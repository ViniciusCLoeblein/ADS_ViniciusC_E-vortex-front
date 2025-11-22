import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  atualizarItemCarrinho,
  removerItemCarrinho,
  limparCarrinho,
} from '@/services/sales'
import { useCart } from '@/contexts/CartContext'

export default function CartScreen() {
  const queryClient = useQueryClient()
  const {
    items,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
    syncCart,
  } = useCart()
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  console.log('items', items)

  const updateItemMutation = useMutation({
    mutationFn: ({
      itemId,
      quantidade,
    }: {
      itemId: string
      quantidade: number
    }) => atualizarItemCarrinho(itemId, { quantidade }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
      syncCart()
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: removerItemCarrinho,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
      syncCart()
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: limparCarrinho,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
      clearCart()
      Alert.alert('Sucesso', 'Carrinho limpo com sucesso!')
    },
    onError: () => {
      clearCart()
      Alert.alert('Sucesso', 'Carrinho limpo com sucesso!')
    },
  })

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId)
      if (!itemId.startsWith('local-')) {
        removeItemMutation.mutate(itemId)
      }
    } else {
      await updateQuantity(itemId, newQuantity)
      if (!itemId.startsWith('local-')) {
        updateItemMutation.mutate({ itemId, quantidade: newQuantity })
      }
    }
  }

  const handleCheckout = () => {
    if (!items || items.length === 0) {
      Alert.alert(
        'Carrinho vazio',
        'Adicione produtos ao carrinho antes de finalizar a compra.',
      )
      return
    }

    router.push('/checkout')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const getTotalPrice = () => {
    return items.reduce(
      (total, item) => total + item.precoUnitario * item.quantidade,
      0,
    )
  }

  const handleImageError = (itemId: string) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }))
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-white px-6 py-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#9FABB9" />
            </TouchableOpacity>
            <Text className="text-frg900 font-bold text-xl">Carrinho</Text>
            <View className="w-6" />
          </View>
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#437C99" />
          <Text className="text-system-text mt-4">Carregando carrinho...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!items || items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-white px-6 py-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#9FABB9" />
            </TouchableOpacity>
            <Text className="text-frg900 font-bold text-xl">Carrinho</Text>
            <View className="w-6" />
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-6">
            <Ionicons name="cart-outline" size={40} color="#9FABB9" />
          </View>
          <Text className="text-frg900 font-bold text-xl mb-2 text-center">
            Seu carrinho está vazio
          </Text>
          <Text className="text-system-text text-center mb-8">
            Adicione produtos ao carrinho para começar suas compras
          </Text>
          <TouchableOpacity
            className="bg-frgprimary rounded-xl py-4 px-8"
            onPress={() => router.replace('/home')}
          >
            <Text className="text-white font-semibold text-lg">
              Continuar Comprando
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#9FABB9" />
          </TouchableOpacity>
          <Text className="text-frg900 font-bold text-xl">Carrinho</Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Limpar carrinho',
                'Tem certeza que deseja limpar o carrinho?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Limpar',
                    style: 'destructive',
                    onPress: () => clearCartMutation.mutate(),
                  },
                ],
              )
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#EF4058" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={syncCart} />
        }
      >
        <View className="px-6 py-4">
          {items.map((item) => {
            const imagemPrincipal =
              item.produto?.imagens?.find((img) => img?.tipo === 'principal')
                ?.url || item.produto?.imagens?.[0]?.url

            const hasImageError = imageErrors[item.id] || !imagemPrincipal

            return (
              <View
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4"
              >
                <View className="flex-row">
                  <View className="w-20 h-20 rounded-xl mr-4 overflow-hidden bg-gray-100 items-center justify-center">
                    {hasImageError ? (
                      <View className="w-full h-full items-center justify-center">
                        <Ionicons
                          name="image-outline"
                          size={24}
                          color="#9FABB9"
                        />
                        <Text className="text-xs text-system-text mt-1 text-center px-1">
                          Erro
                        </Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: imagemPrincipal }}
                        className="w-full h-full"
                        resizeMode="cover"
                        onError={() => handleImageError(item.id)}
                        alt={item.produto?.nome || 'Produto'}
                      />
                    )}
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-frg900 font-semibold text-base mb-1"
                      numberOfLines={2}
                    >
                      {item.produto?.nome || 'Produto'}
                    </Text>

                    {item.variacao && (
                      <Text className="text-system-text text-sm mb-1">
                        {item.variacao.tipo}: {item.variacao.valor}
                      </Text>
                    )}

                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-frgprimary font-bold text-lg">
                          {formatPrice(item.precoUnitario * item.quantidade)}
                        </Text>
                        <Text className="text-system-text text-sm">
                          {formatPrice(item.precoUnitario)} cada
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <TouchableOpacity
                          className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center"
                          onPress={() =>
                            handleQuantityChange(item.id, item.quantidade - 1)
                          }
                          disabled={
                            updateItemMutation.isPending ||
                            removeItemMutation.isPending
                          }
                        >
                          <Ionicons name="remove" size={16} color="#9FABB9" />
                        </TouchableOpacity>

                        <Text className="mx-4 text-frg900 font-semibold text-base">
                          {item.quantidade}
                        </Text>

                        <TouchableOpacity
                          className="bg-frgprimary rounded-full w-8 h-8 items-center justify-center"
                          onPress={() =>
                            handleQuantityChange(item.id, item.quantidade + 1)
                          }
                          disabled={updateItemMutation.isPending}
                        >
                          <Ionicons name="add" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
        </View>

        <View className="h-32" />
      </ScrollView>

      <View className="bg-white border-t border-gray-200 px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-frg900 font-semibold text-lg">Total:</Text>
          <Text className="text-frgprimary font-bold text-2xl">
            {formatPrice(getTotalPrice())}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-frgprimary rounded-xl py-4"
          onPress={handleCheckout}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Finalizar Compra
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
