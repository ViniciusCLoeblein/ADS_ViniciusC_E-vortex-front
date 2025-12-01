import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import PagerView from 'react-native-pager-view'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useAuthStore } from '@/stores/auth'
import { useCustomerStore } from '@/stores/customer'
import { getCustomerProfile, listarEnderecos } from '@/services/customer'
import {
  listarProdutos,
  listarCategorias,
  adicionarFavorito,
  removerFavorito,
  listarFavoritos,
  obterProduto,
  listarImagensProduto,
  listarVariacoesProduto,
  obterVendedorUsuario,
  listarAvaliacoesProduto,
  getTotalVendasVendedor,
} from '@/services/sales'
import type { CategoriaRes, ProdutoRes } from '@/services/sales/interface'
import { useBackHandler } from '@/hooks/indext'
import { useCart } from '@/contexts/CartContext'
import { registerForPushNotificationsAsync } from '@/notifications'
import { updateToken } from '@/services/auth'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface ProductImageProps {
  readonly produtoId: string
  readonly className?: string
  readonly resizeMode?: 'cover' | 'contain' | 'stretch' | 'center'
  readonly alt?: string
  readonly onError?: () => void
}

function ProductImage({
  produtoId,
  className = 'w-full h-32 rounded-xl',
  resizeMode = 'cover',
  alt = 'Produto',
  onError,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)

  const { userId } = useAuthStore()
  const { data: imagensData, isLoading } = useQuery({
    queryKey: ['imagens-produto', userId, produtoId],
    queryFn: () => listarImagensProduto(produtoId),
    enabled: !!produtoId && !!userId,
  })

  const imagemPrincipal =
    imagensData?.imagens?.find((img) => img?.tipo === 'principal')?.url ||
    imagensData?.imagens?.[0]?.url

  const handleError = () => {
    setImageError(true)
    onError?.()
  }

  if (isLoading) {
    return (
      <View className={`${className} bg-gray-100 items-center justify-center`}>
        <ActivityIndicator size="small" color="#437C99" />
      </View>
    )
  }

  if (imageError || !imagemPrincipal) {
    return (
      <View className={`${className} bg-gray-100 items-center justify-center`}>
        <Ionicons name="image-outline" size={32} color="#9FABB9" />
        <Text className="text-xs text-system-text mt-1 text-center px-1">
          Erro
        </Text>
      </View>
    )
  }

  return (
    <Image
      source={{ uri: imagemPrincipal }}
      className={className}
      resizeMode={resizeMode}
      alt={alt}
      onError={handleError}
    />
  )
}

function SellerProductsDashboard() {
  const { userId } = useAuthStore()

  const {
    data: produtosData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['produtos', 'vendedor', userId],
    queryFn: () =>
      listarProdutos({
        vendedorId: userId || undefined,
        pagina: 1,
        limite: 100,
      }),
  })

  const { data: enderecosData } = useQuery({
    queryKey: ['enderecos', userId],
    queryFn: listarEnderecos,
    enabled: !!userId,
  })

  // Busca o vendedor para obter o vendedorId
  const { data: vendedorData } = useQuery({
    queryKey: ['vendedor-usuario', userId],
    queryFn: () => obterVendedorUsuario(userId!),
    enabled: !!userId,
  })

  // Busca o total de vendas do vendedor
  const { data: vendasData, isLoading: isLoadingVendas } = useQuery({
    queryKey: ['vendas-vendedor', vendedorData?.id],
    queryFn: () => getTotalVendasVendedor(vendedorData!.id),
    enabled: !!vendedorData?.id,
  })

  const hasStoreLocation =
    enderecosData?.enderecos && enderecosData.enderecos.length > 0

  const formatPrice = (price: number | string) => {
    const value =
      typeof price === 'string' ? Number(price.replace(',', '.')) : price
    const safe = Number.isFinite(value) ? value : 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(safe)
  }

  const formatLargeNumber = (num: number): string => {
    if (num < 1000) return num.toString()
    if (num < 1000000) {
      const k = num / 1000
      return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`
    }
    if (num < 1000000000) {
      const m = num / 1000000
      return m % 1 === 0 ? `${m}m` : `${m.toFixed(1)}m`
    }
    const b = num / 1000000000
    return b % 1 === 0 ? `${b}b` : `${b.toFixed(1)}b`
  }

  const formatLargePrice = (price: number | string): string => {
    const value =
      typeof price === 'string' ? Number(price.replace(',', '.')) : price
    const safe = Number.isFinite(value) ? value : 0

    if (safe < 10000) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(safe)
    }

    if (safe < 1000000) {
      const k = safe / 1000
      const formatted = k % 1 === 0 ? `${k}k` : `${k.toFixed(3)}k`
      return `R$ ${formatted}`
    }

    if (safe < 1000000000) {
      const m = safe / 1000000
      const formatted = m % 1 === 0 ? `${m}m` : `${m.toFixed(3)}m`
      return `R$ ${formatted}`
    }

    const b = safe / 1000000000
    const formatted = b % 1 === 0 ? `${b}b` : `${b.toFixed(3)}b`
    return `R$ ${formatted}`
  }

  const produtos = produtosData?.produtos || []
  const totalProdutos = produtos.length
  const produtosAtivos = produtos.filter((p) => p.estoque > 0).length
  const produtosInativos = produtos.filter((p) => p.estoque === 0).length
  const valorTotalEstoque = produtos.reduce((acc, p) => {
    const preco = Number(p.preco) || 0
    const estoque = p.estoque || 0
    return acc + preco * estoque
  }, 0)

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View className="px-6 pt-6">
        <View className="flex-row flex-wrap -mx-2 mb-6">
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-blue-100 rounded-full p-2 mr-2">
                  <Ionicons name="cube-outline" size={20} color="#437C99" />
                </View>
                <Text className="text-frg900 font-bold text-2xl">
                  {totalProdutos}
                </Text>
              </View>
              <Text className="text-system-text text-sm">
                Total de Produtos
              </Text>
            </View>
          </View>

          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-green-100 rounded-full p-2 mr-2">
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
                <Text className="text-frg900 font-bold text-2xl">
                  {produtosAtivos}
                </Text>
              </View>
              <Text className="text-system-text text-sm">Produtos Ativos</Text>
            </View>
          </View>

          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-yellow-100 rounded-full p-2 mr-2">
                  <Ionicons name="warning-outline" size={20} color="#F59E0B" />
                </View>
                <Text className="text-frg900 font-bold text-2xl">
                  {produtosInativos}
                </Text>
              </View>
              <Text className="text-system-text text-sm">Sem Estoque</Text>
            </View>
          </View>

          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-purple-100 rounded-full p-2 mr-2">
                  <Ionicons name="cash-outline" size={20} color="#8B5CF6" />
                </View>
                <Text className="text-frg900 font-bold text-base flex-1">
                  {formatLargePrice(valorTotalEstoque)}
                </Text>
              </View>
              <Text className="text-system-text text-sm">Valor em Estoque</Text>
            </View>
          </View>

          {/* Card de Total de Vendas */}
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-emerald-100 rounded-full p-2 mr-2">
                  <Ionicons
                    name="trending-up-outline"
                    size={20}
                    color="#10B981"
                  />
                </View>
                {isLoadingVendas ? (
                  <ActivityIndicator size="small" color="#437C99" />
                ) : (
                  <Text className="text-frg900 font-bold text-base flex-1">
                    {vendasData
                      ? formatLargePrice(vendasData.totalVendas)
                      : formatPrice(0)}
                  </Text>
                )}
              </View>
              <Text className="text-system-text text-sm">Total de Vendas</Text>
            </View>
          </View>

          {/* Card de Total de Pedidos */}
          <TouchableOpacity
            className="w-1/2 px-2 mb-4"
            activeOpacity={0.9}
            onPress={() => router.push('/profile/orders')}
          >
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-orange-100 rounded-full p-2 mr-2">
                  <Ionicons name="receipt-outline" size={20} color="#F97316" />
                </View>
                {isLoadingVendas ? (
                  <ActivityIndicator size="small" color="#437C99" />
                ) : (
                  <Text className="text-frg900 font-bold text-2xl">
                    {vendasData?.totalPedidos || 0}
                  </Text>
                )}
              </View>
              <Text className="text-system-text text-sm">Total de Pedidos</Text>
            </View>
          </TouchableOpacity>
        </View>

        {!hasStoreLocation && (
          <View className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
            <View className="flex-row items-start">
              <Ionicons
                name="warning"
                size={24}
                color="#F59E0B"
                style={{ marginRight: 12, marginTop: 2 }}
              />
              <View className="flex-1">
                <Text className="text-frg900 font-semibold mb-1">
                  Localização da Loja Necessária
                </Text>
                <Text className="text-system-text text-sm mb-3">
                  Cadastre a localização da sua loja para poder criar produtos.
                </Text>
                <TouchableOpacity
                  className="bg-frgprimary rounded-xl py-2 px-4 self-start"
                  onPress={() => router.push('/seller/store-location')}
                >
                  <Text className="text-white font-semibold text-sm">
                    Cadastrar Localização
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-frg900 font-bold text-xl">Meus Produtos</Text>
          <TouchableOpacity
            className="bg-frgprimary rounded-full px-4 py-2"
            onPress={() => {
              if (hasStoreLocation) {
                router.push('/seller/products/new')
              } else {
                Toast.show({
                  type: 'info',
                  text1: 'Localização Necessária',
                  text2: 'Cadastre a localização da sua loja primeiro',
                })
                setTimeout(() => {
                  router.push('/seller/store-location')
                }, 2000)
              }
            }}
          >
            <View className="flex-row items-center">
              <Ionicons name="add" size={18} color="white" />
              <Text className="text-white font-semibold ml-1">Novo</Text>
            </View>
          </TouchableOpacity>
        </View>

        {(() => {
          if (isLoading) {
            return (
              <View className="items-center py-8">
                <Text className="text-system-text">Carregando produtos...</Text>
              </View>
            )
          }

          if (produtos.length > 0) {
            return produtos.slice(0, 5).map((produto) => {
              return (
                <TouchableOpacity
                  key={produto.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4"
                  onPress={() => router.push('/seller/products')}
                >
                  <View className="flex-row">
                    <ProductImage
                      produtoId={produto.id}
                      className="w-20 h-20 rounded-xl mr-4"
                      resizeMode="cover"
                      alt={produto.nome}
                    />
                    <View className="flex-1">
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1">
                          <Text className="text-frg900 font-semibold text-base mb-1">
                            {produto.nome}
                          </Text>
                          <Text className="text-frgprimary font-bold text-lg">
                            {formatPrice(produto.preco)}
                          </Text>
                        </View>
                        <View
                          className={`px-3 py-1 rounded-full ${
                            produto.estoque > 0 ? 'bg-green-100' : 'bg-gray-100'
                          }`}
                        >
                          <Text
                            className={`text-xs font-semibold ${
                              produto.estoque > 0
                                ? 'text-green-700'
                                : 'text-gray-600'
                            }`}
                          >
                            {produto.estoque > 0 ? 'Ativo' : 'Sem estoque'}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons
                          name="cube-outline"
                          size={14}
                          color="#9FABB9"
                        />
                        <Text className="text-system-text text-sm ml-1">
                          Estoque: {formatLargeNumber(produto.estoque)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })
          }

          return (
            <View className="items-center py-12 bg-white rounded-2xl">
              <Ionicons name="cube-outline" size={64} color="#9FABB9" />
              <Text className="text-frg900 font-bold text-xl mt-4 mb-2">
                Nenhum produto cadastrado
              </Text>
              <Text className="text-system-text text-center mb-6">
                Comece cadastrando seu primeiro produto
              </Text>
              <TouchableOpacity
                className="bg-frgprimary rounded-xl py-3 px-6"
                onPress={() => {
                  if (hasStoreLocation) {
                    router.push('/seller/products/new')
                  } else {
                    Toast.show({
                      type: 'info',
                      text1: 'Localização Necessária',
                      text2: 'Cadastre a localização da sua loja primeiro',
                    })
                    setTimeout(() => {
                      router.push('/seller/store-location')
                    }, 2000)
                  }
                }}
              >
                <Text className="text-white font-semibold">
                  Cadastrar Produto
                </Text>
              </TouchableOpacity>
            </View>
          )
        })()}

        {produtos.length > 5 && (
          <TouchableOpacity
            className="bg-frgprimary rounded-xl py-4 mt-4"
            onPress={() => router.push('/seller/products')}
          >
            <Text className="text-white text-center font-semibold">
              Ver todos os produtos ({totalProdutos})
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View className="h-20" />
    </ScrollView>
  )
}

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  )
  const [quantidade, setQuantidade] = useState(1)
  const [selectedVariacaoId, setSelectedVariacaoId] = useState<string | null>(
    null,
  )
  const [pushToken, setPushToken] = useState('')
  const notificationRequestedRef = useRef(false)
  const pagerRef = useRef<PagerView>(null)
  const queryClient = useQueryClient()
  const { setProfile, profile } = useCustomerStore()
  const { getTotalItems } = useCart()
  const { accessToken, userId } = useAuthStore()

  const isVendedor = profile?.tipo === 'vendedor'

  const { data: customerProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['customerProfile', userId],
    queryFn: getCustomerProfile,
    enabled: !!accessToken && !!userId,
    retry: 1,
  })

  const {
    data: produtosData,
    isLoading: isLoadingProdutos,
    refetch: refetchProdutos,
  } = useQuery({
    queryKey: ['produtos', 'home', userId, selectedCategory, searchText],
    queryFn: () =>
      listarProdutos({
        busca: searchText || undefined,
        categoriaId: selectedCategory,
        apenasAtivos: true,
        pagina: 1,
        limite: 20,
      }),
    enabled: !isVendedor && !!userId,
  })

  const { data: categoriasData } = useQuery({
    queryKey: ['categorias', userId],
    queryFn: listarCategorias,
    enabled: !isVendedor && !!userId,
  })

  const { data: favoritosData } = useQuery({
    queryKey: ['favoritos', userId],
    queryFn: listarFavoritos,
    enabled: !isVendedor && !!userId,
  })

  const { data: produtoDetalhe, isLoading: isLoadingDetalhe } = useQuery({
    queryKey: ['produto', userId, selectedProductId],
    queryFn: () => obterProduto(selectedProductId!),
    enabled: !!selectedProductId && !isVendedor && !!userId,
  })

  const { data: vendedorData } = useQuery({
    queryKey: ['vendedor', userId, produtoDetalhe?.vendedorId],
    queryFn: () => obterVendedorUsuario(produtoDetalhe!.vendedorId!),
    enabled: !!produtoDetalhe?.vendedorId && !isVendedor && !!userId,
  })

  const { data: variacoesData } = useQuery({
    queryKey: ['variacoes', userId, selectedProductId],
    queryFn: () => listarVariacoesProduto(selectedProductId!),
    enabled: !!selectedProductId && !isVendedor && !!userId,
  })

  const { data: imagensProdutoData } = useQuery({
    queryKey: ['imagens-produto', userId, selectedProductId],
    queryFn: () => listarImagensProduto(selectedProductId!),
    enabled: !!selectedProductId && !isVendedor && !!userId,
  })

  const { data: avaliacoesData } = useQuery({
    queryKey: ['avaliacoes', userId, selectedProductId],
    queryFn: () => listarAvaliacoesProduto(selectedProductId!),
    enabled: !!selectedProductId && !isVendedor && !!userId,
  })

  const imagemPrincipalProduto =
    imagensProdutoData?.imagens?.find((img) => img?.tipo === 'principal')
      ?.url || imagensProdutoData?.imagens?.[0]?.url

  const favoritosIds = new Set(
    favoritosData?.favoritos.map((f) => f.produtoId) || [],
  )

  const addFavoriteMutation = useMutation({
    mutationFn: adicionarFavorito,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos', userId] })
    },
  })

  const removeFavoriteMutation = useMutation({
    mutationFn: removerFavorito,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos', userId] })
    },
  })

  const updateTokenMutation = useMutation({
    mutationFn: updateToken,
  })

  const updateTokenFn = useCallback(async () => {
    if (notificationRequestedRef.current) {
      return
    }

    if (!userId || !profile || profile?.pushToken || pushToken) {
      return
    }

    const permissionDenied = await AsyncStorage.getItem(
      '@evortex:notification_permission_denied',
    )

    if (permissionDenied === 'true') {
      return
    }

    notificationRequestedRef.current = true

    try {
      const { status } = await Notifications.getPermissionsAsync()

      if (status === 'denied') {
        await AsyncStorage.setItem(
          '@evortex:notification_permission_denied',
          'true',
        )
        notificationRequestedRef.current = false
        return
      }

      if (status === 'granted') {
        const pushTokenData = await Notifications.getExpoPushTokenAsync()
        if (pushTokenData?.data) {
          setPushToken(pushTokenData.data)
          updateTokenMutation.mutate(pushTokenData.data)
          setProfile({ ...profile, pushToken: pushTokenData.data })
        }
        notificationRequestedRef.current = false
        return
      }

      registerForPushNotificationsAsync(setPushToken, async (token) => {
        if (token) {
          updateTokenMutation.mutate(token)
          setProfile({ ...profile, pushToken: token })
        } else {
          const { status: newStatus } =
            await Notifications.getPermissionsAsync()
          if (newStatus === 'denied') {
            await AsyncStorage.setItem(
              '@evortex:notification_permission_denied',
              'true',
            )
          }
        }
        notificationRequestedRef.current = false
      })
    } catch (error) {
      console.error('Erro ao verificar permissão de notificações:', error)
      notificationRequestedRef.current = false
    }
  }, [pushToken, updateTokenMutation, userId, profile, setProfile])

  useEffect(() => {
    notificationRequestedRef.current = false
    updateTokenFn()
  }, [userId, profile?.id, updateTokenFn])

  useEffect(() => {
    if (customerProfile) setProfile(customerProfile)
  }, [customerProfile, setProfile])

  useEffect(() => {
    if (produtoDetalhe) {
      setSelectedVariacaoId(null)
      setQuantidade(1)
    }
  }, [produtoDetalhe])

  useEffect(() => {
    if (selectedVariacaoId && variacoesData?.variacoes) {
      const variacaoSelecionada = variacoesData.variacoes.find(
        (v) => v.id === selectedVariacaoId,
      )
      if (variacaoSelecionada && quantidade > variacaoSelecionada.estoque) {
        setQuantidade(Math.max(1, variacaoSelecionada.estoque))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariacaoId, variacoesData])

  const getWelcomeMessage = () => {
    if (isLoadingProfile && !isVendedor) return 'Carregando...'
    if (profile) return `Bem-vindo, ${profile.nome?.trimEnd()}!`
    return 'Bem-vindo de volta!'
  }

  const formatPrice = (price: number | string) => {
    const value =
      typeof price === 'string' ? Number(price.replace(',', '.')) : price
    const safe = Number.isFinite(value) ? value : 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(safe)
  }

  const formatLargeNumber = (num: number): string => {
    if (num < 1000) return num.toString()
    if (num < 1000000) {
      const k = num / 1000
      return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`
    }
    if (num < 1000000000) {
      const m = num / 1000000
      return m % 1 === 0 ? `${m}m` : `${m.toFixed(1)}m`
    }
    const b = num / 1000000000
    return b % 1 === 0 ? `${b}b` : `${b.toFixed(1)}b`
  }

  const handleToggleFavorite = (produtoId: string) => {
    if (favoritosIds.has(produtoId)) {
      removeFavoriteMutation.mutate(produtoId)
    } else {
      addFavoriteMutation.mutate(produtoId)
    }
  }

  const { addToCart } = useCart()

  const handleAddToCart = async (
    produto: ProdutoRes,
    qtd?: number,
    variacaoId?: string | null,
  ) => {
    await addToCart({
      produtoId: produto.id,
      quantidade: qtd || 1,
      variacaoId: variacaoId || undefined,
    })
  }

  const handleViewProduct = (produtoId: string) => {
    setSelectedProductId(produtoId)
    setQuantidade(1)
    setSelectedVariacaoId(null)
    if (pagerRef.current) {
      pagerRef.current.setPage(1)
    }
  }

  const handleBackToList = () => {
    setSelectedProductId(null)
    setSelectedVariacaoId(null)
    if (pagerRef.current) {
      pagerRef.current.setPage(0)
    }
  }

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    const page = e.nativeEvent.position
    if (page === 0) {
      setSelectedProductId(null)
    }
  }

  useBackHandler(() => {
    if (selectedProductId) {
      handleBackToList()
      return true
    }
    return false
  })

  const renderProduct = ({ item }: { item: ProdutoRes }) => {
    const isFavorite = favoritosIds.has(item.id)
    const preco = Number(item.preco)
    const promo = Number(item.precoPromocional)
    const temDesconto =
      Number.isFinite(preco) &&
      Number.isFinite(promo) &&
      promo > 0 &&
      promo < preco
    const precoFinal = temDesconto ? promo : preco

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-4"
        style={{ minHeight: 240 }}
        onPress={() => handleViewProduct(item.id)}
      >
        <View className="relative mb-2">
          <ProductImage
            produtoId={item.id}
            className="w-full h-40 rounded-xl"
            resizeMode="cover"
            alt={item.nome}
          />
          {temDesconto && (
            <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-lg">
              <Text className="text-white text-xs font-bold">
                -
                {Number.isFinite(preco) && preco > 0
                  ? Math.round(((preco - precoFinal) / preco) * 100)
                  : 0}
                %
              </Text>
            </View>
          )}
          <TouchableOpacity
            className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm"
            onPress={() => handleToggleFavorite(item.id)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={14}
              color="#EF4058"
            />
          </TouchableOpacity>
        </View>

        <View style={{ minHeight: 40, marginBottom: 8 }}>
          <Text className="text-frg900 font-semibold text-sm" numberOfLines={2}>
            {item.nome}
          </Text>
        </View>

        <View style={{ minHeight: 32 }}>
          <Text className="text-frgprimary font-bold text-sm">
            {formatPrice(precoFinal)}
          </Text>
          {temDesconto ? (
            <Text className="text-system-text text-xs line-through">
              {formatPrice(item.preco)}
            </Text>
          ) : (
            <View style={{ height: 14 }} />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const renderCategory = ({ item }: { item: CategoriaRes }) => (
    <TouchableOpacity
      className="items-center justify-center mr-3 w-20 h-32"
      onPress={() =>
        setSelectedCategory(selectedCategory === item.id ? undefined : item.id)
      }
    >
      <View
        className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${
          selectedCategory === item.id ? 'bg-frgprimary' : 'bg-gray-100'
        }`}
      >
        <Ionicons
          name={item.icone as keyof typeof Ionicons.glyphMap}
          size={28}
          color={item.cor_hex}
        />
      </View>

      <View className="h-8 items-center justify-center w-16">
        <Text
          className="text-xs font-medium text-center text-system-text"
          numberOfLines={2}
        >
          {item.nome}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-frg900 font-bold text-xl">E-Vortex</Text>
            <Text className="text-system-text">{getWelcomeMessage()}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            {isVendedor ? (
              <TouchableOpacity
                className="bg-gray-100 rounded-full p-2"
                onPress={() => router.push('/seller/products')}
              >
                <Ionicons name="cube-outline" size={20} color="#9FABB9" />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  className="bg-gray-100 rounded-full p-2 relative"
                  onPress={() => router.push('/cart')}
                >
                  <Ionicons name="cart-outline" size={20} color="#9FABB9" />
                  {getTotalItems() > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                      <Text className="text-white text-xs font-bold">
                        {getTotalItems() > 99 ? '99+' : getTotalItems()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-100 rounded-full p-2"
                  onPress={() => router.push('/favorites')}
                >
                  <Ionicons name="heart-outline" size={20} color="#9FABB9" />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              className="bg-gray-100 rounded-full p-2"
              onPress={() => router.push('/profile')}
            >
              <Ionicons
                name="person-circle-outline"
                size={20}
                color="#9FABB9"
              />
            </TouchableOpacity>
          </View>
        </View>

        {!isVendedor && !selectedProductId && (
          <View className="flex-row items-center bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-200">
            <View className="bg-frgprimary/10 rounded-full p-1.5 mr-2">
              <Ionicons name="search-outline" size={18} color="#437C99" />
            </View>
            <TextInput
              className="flex-1 text-sm text-frg900 py-1"
              placeholder="Buscar produtos..."
              placeholderTextColor="#9FABB9"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                className="ml-2"
              >
                <Ionicons name="close-circle" size={18} color="#9FABB9" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {isVendedor ? (
        <SellerProductsDashboard />
      ) : (
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={handlePageSelected}
          scrollEnabled={!!selectedProductId}
        >
          <View key="0" style={{ flex: 1 }}>
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isLoadingProdutos}
                  onRefresh={refetchProdutos}
                />
              }
            >
              {categoriasData && (
                <View className="px-6 mb-6 mt-4">
                  <Text className="text-frg900 font-bold text-lg mb-4">
                    Categorias
                  </Text>
                  <FlatList
                    data={categoriasData.categorias}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              )}

              <View className="px-6 mb-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-frg900 font-bold text-lg">
                    {produtosData?.total || 0} Produtos
                  </Text>
                </View>
                {(() => {
                  if (isLoadingProdutos) {
                    return (
                      <View className="items-center justify-center py-12">
                        <ActivityIndicator size="large" color="#437C99" />
                        <Text className="text-system-text mt-4">
                          Carregando produtos...
                        </Text>
                      </View>
                    )
                  }
                  if (
                    produtosData?.produtos &&
                    produtosData.produtos.length > 0
                  ) {
                    return (
                      <View className="flex-row flex-wrap -mx-1">
                        {produtosData.produtos.map((item) => (
                          <View key={item.id} className="w-1/2 px-1">
                            {renderProduct({ item })}
                          </View>
                        ))}
                      </View>
                    )
                  }
                  return (
                    <View className="items-center py-8">
                      <Ionicons name="cube-outline" size={64} color="#9FABB9" />
                      <Text className="text-system-text mt-4">
                        Nenhum produto encontrado
                      </Text>
                    </View>
                  )
                })()}
              </View>

              <View className="h-20" />
            </ScrollView>
          </View>

          <View key="1" style={{ flex: 1 }}>
            {(() => {
              if (isLoadingDetalhe) {
                return (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#437C99" />
                    <Text className="text-system-text mt-4">
                      Carregando produto...
                    </Text>
                  </View>
                )
              }
              if (!produtoDetalhe) {
                return (
                  <View className="flex-1 items-center justify-center px-6">
                    <Ionicons
                      name="alert-circle-outline"
                      size={64}
                      color="#9FABB9"
                    />
                    <Text className="text-frg900 font-bold text-xl mt-4 mb-2">
                      Produto não encontrado
                    </Text>
                    <TouchableOpacity
                      className="bg-frgprimary rounded-xl py-3 px-6 mt-4"
                      onPress={handleBackToList}
                    >
                      <Text className="text-white font-semibold">Voltar</Text>
                    </TouchableOpacity>
                  </View>
                )
              }
              return (
                <ScrollView
                  className="flex-1"
                  showsVerticalScrollIndicator={false}
                >
                  <View className="bg-white mb-4">
                    <ProductImage
                      produtoId={produtoDetalhe.id}
                      className="w-full h-80"
                      resizeMode="cover"
                      alt={produtoDetalhe.nome}
                    />
                  </View>

                  <View className="px-6 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                      <Text className="text-frg900 font-bold text-2xl flex-1">
                        {produtoDetalhe.nome}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          produtoDetalhe &&
                          handleToggleFavorite(produtoDetalhe.id)
                        }
                      >
                        <Ionicons
                          name={
                            favoritosIds.has(produtoDetalhe.id)
                              ? 'heart'
                              : 'heart-outline'
                          }
                          size={24}
                          color="#EF4058"
                        />
                      </TouchableOpacity>
                    </View>

                    {!!produtoDetalhe?.descricaoCurta && (
                      <Text className="text-system-text text-base mb-4">
                        {produtoDetalhe.descricaoCurta}
                      </Text>
                    )}

                    <View className="flex-row items-center mb-4">
                      <View className="flex-1">
                        <Text className="text-frgprimary font-bold text-3xl">
                          {formatPrice(
                            (() => {
                              const preco = Number(produtoDetalhe.preco)
                              const promo = Number(
                                produtoDetalhe.precoPromocional,
                              )
                              if (
                                Number.isFinite(preco) &&
                                Number.isFinite(promo) &&
                                promo > 0 &&
                                promo < preco
                              ) {
                                return promo
                              }
                              return preco
                            })(),
                          )}
                        </Text>
                        {(() => {
                          const preco = Number(produtoDetalhe.preco)
                          const promo = Number(produtoDetalhe.precoPromocional)
                          return (
                            Number.isFinite(preco) &&
                            Number.isFinite(promo) &&
                            promo > 0 &&
                            promo < preco
                          )
                        })() && (
                          <Text className="text-system-text text-lg line-through">
                            {formatPrice(produtoDetalhe.preco)}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View className="bg-gray-50 rounded-xl p-4 mb-4">
                      <View className="flex-row items-center mb-2">
                        <View className="flex-row items-center mr-3">
                          <Ionicons name="star" size={20} color="#FFD700" />
                          <Text className="text-frg900 font-bold text-lg ml-1">
                            {Number(produtoDetalhe.avaliacaoMedia || 0).toFixed(
                              1,
                            )}
                          </Text>
                        </View>
                        <Text className="text-system-text text-sm">
                          ({produtoDetalhe.totalAvaliacoes || 0} avaliações)
                        </Text>
                      </View>
                      <View className="flex-row mb-3">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const rating = Number(
                            produtoDetalhe.avaliacaoMedia || 0,
                          )
                          return (
                            <Ionicons
                              key={star}
                              name={star <= rating ? 'star' : 'star-outline'}
                              size={16}
                              color={star <= rating ? '#FFD700' : '#D1D5DB'}
                            />
                          )
                        })}
                      </View>
                    </View>

                    {vendedorData && (
                      <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                        <View className="flex-row items-center mb-3">
                          <View className="bg-frgprimary/10 rounded-full p-2 mr-3">
                            <Ionicons
                              name="storefront-outline"
                              size={20}
                              color="#437C99"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-frg900 font-bold text-base">
                              {vendedorData.nomeFantasia}
                            </Text>
                            <Text className="text-system-text text-sm">
                              {vendedorData.razaoSocial}
                            </Text>
                          </View>
                          {vendedorData.status === 'aprovado' ? (
                            <View className="bg-green-100 px-3 py-1 rounded-full">
                              <Text className="text-green-700 text-xs font-semibold">
                                Verificado
                              </Text>
                            </View>
                          ) : (
                            <View className="bg-yellow-100 px-3 py-1 rounded-full">
                              <Text className="text-yellow-700 text-xs font-semibold">
                                Não Verificado
                              </Text>
                            </View>
                          )}
                        </View>
                        {vendedorData.criadoEm && (
                          <Text className="text-system-text text-xs">
                            Vendedor desde{' '}
                            {new Date(vendedorData.criadoEm).toLocaleDateString(
                              'pt-BR',
                            )}
                          </Text>
                        )}
                      </View>
                    )}

                    <View className="bg-gray-100 rounded-xl p-4 mb-4">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-frg900 font-semibold">
                          Quantidade
                        </Text>
                        <View className="flex-row items-center">
                          <TouchableOpacity
                            className="bg-gray-200 rounded-full w-8 h-8 items-center justify-center"
                            onPress={() =>
                              setQuantidade(Math.max(1, quantidade - 1))
                            }
                          >
                            <Ionicons name="remove" size={16} color="#9FABB9" />
                          </TouchableOpacity>
                          <Text className="mx-4 text-frg900 font-semibold text-lg">
                            {quantidade}
                          </Text>
                          <TouchableOpacity
                            className="bg-frgprimary rounded-full w-8 h-8 items-center justify-center"
                            onPress={() => {
                              const estoqueDisponivel = selectedVariacaoId
                                ? variacoesData?.variacoes?.find(
                                    (v) => v.id === selectedVariacaoId,
                                  )?.estoque || 0
                                : produtoDetalhe.estoque || 0
                              if (quantidade < estoqueDisponivel) {
                                setQuantidade(quantidade + 1)
                              }
                            }}
                            disabled={
                              quantidade >=
                              (selectedVariacaoId
                                ? variacoesData?.variacoes?.find(
                                    (v) => v.id === selectedVariacaoId,
                                  )?.estoque || 0
                                : produtoDetalhe.estoque || 0)
                            }
                          >
                            <Ionicons
                              name="add"
                              size={16}
                              color={
                                quantidade >=
                                (selectedVariacaoId
                                  ? variacoesData?.variacoes?.find(
                                      (v) => v.id === selectedVariacaoId,
                                    )?.estoque || 0
                                  : produtoDetalhe.estoque || 0)
                                  ? '#9FABB9'
                                  : 'white'
                              }
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text className="text-system-text text-sm">
                        Estoque: {formatLargeNumber(produtoDetalhe.estoque)}{' '}
                        unidades
                      </Text>
                    </View>

                    {variacoesData?.variacoes &&
                      variacoesData.variacoes.length > 0 && (
                        <View className="mb-4">
                          <Text className="text-frg900 font-semibold mb-2">
                            Variações
                          </Text>
                          {variacoesData.variacoes.map((variacao) => {
                            const isSelected =
                              selectedVariacaoId === variacao.id
                            const precoAdicional = Number(
                              variacao.precoAdicional,
                            )
                            const temEstoque = variacao.estoque > 0

                            return (
                              <TouchableOpacity
                                key={variacao.id}
                                className={`rounded-xl p-3 mb-2 border ${
                                  isSelected
                                    ? 'bg-frgprimary/10 border-frgprimary'
                                    : 'bg-white border-gray-200'
                                } ${temEstoque ? '' : 'opacity-50'}`}
                                onPress={() => {
                                  if (temEstoque) {
                                    const novaVariacaoId = isSelected
                                      ? null
                                      : variacao.id
                                    setSelectedVariacaoId(novaVariacaoId)
                                    if (
                                      novaVariacaoId &&
                                      quantidade > variacao.estoque
                                    ) {
                                      setQuantidade(
                                        Math.max(1, variacao.estoque),
                                      )
                                    }
                                  }
                                }}
                                disabled={!temEstoque}
                              >
                                <View className="flex-row items-center gap-3">
                                  {imagemPrincipalProduto ? (
                                    <Image
                                      source={{ uri: imagemPrincipalProduto }}
                                      className="w-16 h-16 rounded-lg"
                                      resizeMode="cover"
                                      alt={`${variacao.tipo} ${variacao.valor}`}
                                    />
                                  ) : (
                                    <View className="w-16 h-16 rounded-lg bg-gray-100 items-center justify-center">
                                      <Ionicons
                                        name="image-outline"
                                        size={24}
                                        color="#9FABB9"
                                      />
                                    </View>
                                  )}
                                  <View className="flex-1">
                                    <View className="flex-row items-center gap-2">
                                      <Text className="text-frg900 font-medium">
                                        {variacao.tipo}: {variacao.valor}
                                      </Text>
                                      {isSelected && (
                                        <Ionicons
                                          name="checkmark-circle"
                                          size={20}
                                          color="#437C99"
                                        />
                                      )}
                                    </View>
                                    <View className="flex-row items-center gap-2 mt-1">
                                      {precoAdicional > 0 && (
                                        <Text className="text-frgprimary font-semibold">
                                          + {formatPrice(precoAdicional)}
                                        </Text>
                                      )}
                                      <Text className="text-system-text text-xs">
                                        Estoque:{' '}
                                        {formatLargeNumber(variacao.estoque)}
                                      </Text>
                                    </View>
                                  </View>
                                  {!temEstoque && (
                                    <Text className="text-red-500 text-xs font-medium ml-2">
                                      Sem estoque
                                    </Text>
                                  )}
                                </View>
                              </TouchableOpacity>
                            )
                          })}
                        </View>
                      )}

                    {avaliacoesData && avaliacoesData.avaliacoes.length > 0 && (
                      <View className="mb-4 px-4">
                        <Text className="text-frg900 font-semibold text-base mb-3">
                          Avaliações dos clientes
                        </Text>
                        <ScrollView
                          className="max-h-64"
                          showsVerticalScrollIndicator={false}
                        >
                          {avaliacoesData.avaliacoes
                            .slice(0, 5)
                            .map((avaliacao) => (
                              <View
                                key={avaliacao.id}
                                className="mb-3 pb-3 border-b border-gray-100 last:border-0"
                              >
                                <View className="flex-row items-center justify-between mb-2">
                                  <View className="flex-row items-center">
                                    {avaliacao.usuarioNome && (
                                      <Text className="text-frg900 font-semibold text-sm mr-2">
                                        {avaliacao.usuarioNome}
                                      </Text>
                                    )}
                                  </View>
                                  <View className="flex-row items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Ionicons
                                        key={star}
                                        name={
                                          star <= avaliacao.nota
                                            ? 'star'
                                            : 'star-outline'
                                        }
                                        size={14}
                                        color={
                                          star <= avaliacao.nota
                                            ? '#FFD700'
                                            : '#D1D5DB'
                                        }
                                      />
                                    ))}
                                  </View>
                                </View>
                                {avaliacao.titulo && (
                                  <Text className="text-frg900 font-semibold text-xs mb-1">
                                    {avaliacao.titulo}
                                  </Text>
                                )}
                                {avaliacao.comentario && (
                                  <Text className="text-system-text text-xs mb-2">
                                    {avaliacao.comentario}
                                  </Text>
                                )}
                                {avaliacao.respostaVendedor && (
                                  <View className="mt-2 bg-blue-50 rounded-lg p-2">
                                    <Text className="text-blue-900 font-semibold text-xs mb-1">
                                      Resposta do vendedor:
                                    </Text>
                                    <Text className="text-blue-800 text-xs">
                                      {avaliacao.respostaVendedor}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            ))}
                        </ScrollView>
                      </View>
                    )}

                    <TouchableOpacity
                      className="bg-frgprimary rounded-xl py-4 mb-4"
                      onPress={() =>
                        handleAddToCart(
                          produtoDetalhe,
                          quantidade,
                          selectedVariacaoId,
                        )
                      }
                      disabled={
                        produtoDetalhe.estoque === 0 ||
                        (variacoesData?.variacoes &&
                          variacoesData.variacoes.length > 0 &&
                          !selectedVariacaoId)
                      }
                    >
                      <Text className="text-white text-center text-lg font-semibold">
                        {(() => {
                          if (produtoDetalhe.estoque === 0) return 'Sem estoque'
                          if (
                            variacoesData?.variacoes &&
                            variacoesData.variacoes.length > 0 &&
                            !selectedVariacaoId
                          )
                            return 'Selecione uma variação'
                          return 'Adicionar ao Carrinho'
                        })()}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {produtosData && produtosData.produtos.length > 0 && (
                    <View className="px-6 mb-6">
                      <Text className="text-frg900 font-bold text-xl mb-4">
                        Outros Produtos
                      </Text>
                      <FlatList
                        data={produtosData.produtos
                          .filter((p) => p.id !== produtoDetalhe.id)
                          .slice(0, 10)}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mr-4 w-48"
                            onPress={() => handleViewProduct(item.id)}
                          >
                            <View className="relative">
                              <ProductImage
                                produtoId={item.id}
                                className="w-full h-32 rounded-xl mb-3"
                                resizeMode="cover"
                                alt={item.nome}
                              />
                              <Text
                                className="text-frg900 font-semibold text-sm mb-1"
                                numberOfLines={2}
                              >
                                {item.nome}
                              </Text>
                              <View className="flex-row items-center justify-between">
                                <Text className="text-frgprimary font-bold text-base">
                                  {formatPrice(
                                    (() => {
                                      const preco = Number(item.preco)
                                      const promo = Number(
                                        item.precoPromocional,
                                      )
                                      if (
                                        Number.isFinite(preco) &&
                                        Number.isFinite(promo) &&
                                        promo > 0 &&
                                        promo < preco
                                      ) {
                                        return promo
                                      }
                                      return preco
                                    })(),
                                  )}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      />
                    </View>
                  )}

                  <View className="h-20" />
                </ScrollView>
              )
            })()}
          </View>
        </PagerView>
      )}
    </SafeAreaView>
  )
}
