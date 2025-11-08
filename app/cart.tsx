import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  obterCarrinho,
  atualizarItemCarrinho,
  removerItemCarrinho,
  limparCarrinho,
} from '@/services/sales'

export default function CartScreen() {
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: carrinho, isLoading, refetch } = useQuery({
    queryKey: ['carrinho'],
    queryFn: obterCarrinho,
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantidade }: { itemId: string; quantidade: number }) =>
      atualizarItemCarrinho(itemId, { quantidade }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: removerItemCarrinho,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: limparCarrinho,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
      Alert.alert('Sucesso', 'Carrinho limpo com sucesso!')
    },
  })

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemMutation.mutate(itemId)
    } else {
      updateItemMutation.mutate({ itemId, quantidade: newQuantity })
    }
  }

  const handleCheckout = async () => {
    if (!carrinho || carrinho.itens.length === 0) {
      Alert.alert(
        'Carrinho vazio',
        'Adicione produtos ao carrinho antes de finalizar a compra.',
      )
      return
    }

    setIsProcessing(true)

    try {
      // Simulação de processamento do pedido
      await new Promise<void>((resolve) => setTimeout(resolve, 2000))

      Alert.alert(
        'Compra finalizada!',
        `Pedido de ${formatPrice(carrinho.total)} realizado com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCartMutation.mutate()
              router.replace('/home')
            },
          },
        ],
      )
    } catch (error) {
      Alert.alert('Erro', 'Falha ao processar o pedido. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  if (!carrinho || carrinho.itens.length === 0) {
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
      {/* Header */}
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
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View className="px-6 py-4">
          {isLoading ? (
            <View className="items-center py-8">
              <Text className="text-system-text">Carregando carrinho...</Text>
            </View>
          ) : (
            carrinho?.itens.map((item) => (
              <View
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4"
              >
                <View className="flex-row">
                  <Image
                    source={{
                      uri:
                        item.produto?.imagemPrincipal ||
                        'https://via.placeholder.com/100',
                    }}
                    className="w-20 h-20 rounded-xl mr-4"
                    resizeMode="cover"
                  />

                  <View className="flex-1">
                    <Text
                      className="text-frg900 font-semibold text-base mb-1"
                      numberOfLines={2}
                    >
                      {item.produto?.nome || 'Produto'}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-frgprimary font-bold text-lg">
                          {formatPrice(item.subtotal)}
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
            ))
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="h-32" />
      </ScrollView>

      {/* Checkout Footer */}
      <View className="bg-white border-t border-gray-200 px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-frg900 font-semibold text-lg">Total:</Text>
          <Text className="text-frgprimary font-bold text-2xl">
            {carrinho ? formatPrice(carrinho.total) : 'R$ 0,00'}
          </Text>
        </View>

        <TouchableOpacity
          className={`bg-frgprimary rounded-xl py-4 ${
            isProcessing ? 'opacity-70' : ''
          }`}
          onPress={handleCheckout}
          disabled={isProcessing}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {isProcessing ? 'Processando...' : 'Finalizar Compra'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
