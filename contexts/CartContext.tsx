import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  obterCarrinho,
  adicionarItemCarrinho,
  atualizarItemCarrinho,
  removerItemCarrinho,
  limparCarrinho,
} from '@/services/sales'
import type {
  ItemCarrinhoRes,
  AdicionarItemCarrinhoReq,
  ProdutoRes,
  VariacaoRes,
} from '@/services/sales/interface'
import { useAuthStore } from '@/stores/auth'

const CART_STORAGE_KEY = '@evortex:cart'

interface CartContextType {
  items: ItemCarrinhoRes[]
  isLoading: boolean
  addToCart: (data: AdicionarItemCarrinhoReq) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalItems: () => number
  getTotalPrice: () => number
  syncCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<ItemCarrinhoRes[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const queryClient = useQueryClient()
  const { accessToken } = useAuthStore()

  const { data: carrinhoBackend, isLoading: isLoadingBackend } = useQuery({
    queryKey: ['carrinho'],
    queryFn: obterCarrinho,
    enabled: !!accessToken,
    retry: 1,
  })

  useEffect(() => {
    const loadLocalCart = async () => {
      try {
        const stored = await AsyncStorage.getItem(CART_STORAGE_KEY)
        if (stored) {
          const localCart: ItemCarrinhoRes[] = JSON.parse(stored)
          setItems(localCart)
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho local:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    loadLocalCart()
  }, [])

  useEffect(() => {
    if (carrinhoBackend && accessToken && isInitialized) {
      setItems(carrinhoBackend.itens)
      AsyncStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(carrinhoBackend.itens),
      )
    }
  }, [carrinhoBackend, accessToken, isInitialized])

  useEffect(() => {
    if (isInitialized) {
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isInitialized])

  const addToCartMutation = useMutation({
    mutationFn: adicionarItemCarrinho,
    onSuccess: (data) => {
      setItems(data.itens)
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
    },
    onError: async (error, variables) => {
      console.error('Erro ao adicionar item ao carrinho:', error)
      const newItem: ItemCarrinhoRes = {
        id: `local-${Date.now()}`,
        produtoId: variables.produtoId,
        quantidade: variables.quantidade,
        precoUnitario: 0,
        produto: {} as ProdutoRes,
        variacao: variables.variacaoId
          ? ({ id: variables.variacaoId } as VariacaoRes)
          : null,
        variacaoId: variables.variacaoId || null,
      }
      setItems((prev) => {
        const existing = prev.find(
          (item) =>
            item.produtoId === variables.produtoId &&
            item.variacaoId === (variables.variacaoId || null),
        )
        if (existing) {
          return prev.map((item) =>
            item.id === existing.id
              ? { ...item, quantidade: item.quantidade + variables.quantidade }
              : item,
          )
        }
        return [...prev, newItem]
      })
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: ({
      itemId,
      quantidade,
    }: {
      itemId: string
      quantidade: number
    }) => atualizarItemCarrinho(itemId, { quantidade }),
    onSuccess: (data) => {
      setItems(data.itens)
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
    },
    onError: async (error, variables) => {
      console.error('Erro ao atualizar item do carrinho:', error)
      setItems((prev) =>
        prev.map((item) =>
          item.id === variables.itemId
            ? { ...item, quantidade: variables.quantidade }
            : item,
        ),
      )
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: removerItemCarrinho,
    onSuccess: (data) => {
      setItems(data.itens)
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
    },
    onError: async (error, itemId) => {
      console.error('Erro ao remover item do carrinho:', error)
      setItems((prev) => prev.filter((item) => item.id !== itemId))
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: limparCarrinho,
    onSuccess: () => {
      setItems([])
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
    },
    onError: () => {
      setItems([])
    },
  })

  const addToCart = useCallback(
    async (data: AdicionarItemCarrinhoReq) => {
      const existingItem = items.find(
        (item) =>
          item.produtoId === data.produtoId &&
          item.variacaoId === (data.variacaoId || null),
      )

      if (existingItem) {
        const newQuantity = existingItem.quantidade + data.quantidade
        setItems((prev) =>
          prev.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantidade: newQuantity }
              : item,
          ),
        )

        if (accessToken && !existingItem.id.startsWith('local-')) {
          updateItemMutation.mutate({
            itemId: existingItem.id,
            quantidade: newQuantity,
          })
        }
      } else {
        const newItem: ItemCarrinhoRes = {
          id: `local-${Date.now()}`,
          produtoId: data.produtoId,
          quantidade: data.quantidade,
          precoUnitario: 0,
          produto: {} as ProdutoRes,
          variacao: data.variacaoId
            ? ({ id: data.variacaoId } as VariacaoRes)
            : null,
          variacaoId: data.variacaoId || null,
        }
        setItems((prev) => [...prev, newItem])

        if (accessToken) {
          addToCartMutation.mutate(data)
        }
      }
    },
    [items, accessToken, addToCartMutation, updateItemMutation],
  )

  const removeFromCart = useCallback(
    async (itemId: string) => {
      setItems((prev) => prev.filter((item) => item.id !== itemId))

      if (accessToken && !itemId.startsWith('local-')) {
        removeItemMutation.mutate(itemId)
      }
    },
    [accessToken, removeItemMutation],
  )

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(itemId)
        return
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantidade: quantity } : item,
        ),
      )

      if (accessToken && !itemId.startsWith('local-')) {
        updateItemMutation.mutate({ itemId, quantidade: quantity })
      }
    },
    [accessToken, updateItemMutation, removeFromCart],
  )

  const clearCart = useCallback(async () => {
    setItems([])

    if (accessToken) {
      clearCartMutation.mutate()
    }
  }, [accessToken, clearCartMutation])

  const syncCart = useCallback(async () => {
    if (!accessToken) return

    try {
      const backendCart = await obterCarrinho()
      setItems(backendCart.itens)
      await AsyncStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(backendCart.itens),
      )
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
    } catch (error) {
      console.error('Erro ao sincronizar carrinho:', error)
    }
  }, [accessToken, queryClient])

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantidade, 0)
  }, [items])

  const getTotalPrice = useCallback(() => {
    return items.reduce(
      (total, item) => total + item.precoUnitario * item.quantidade,
      0,
    )
  }, [items])

  const value: CartContextType = useMemo(
    () => ({
      items,
      isLoading: isLoadingBackend && !isInitialized,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      syncCart,
    }),
    [
      items,
      isLoadingBackend,
      isInitialized,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      syncCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
