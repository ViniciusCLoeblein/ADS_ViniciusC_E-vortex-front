import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCart } from '@/contexts/CartContext'

export default function CartScreen() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } =
    useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
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
        `Pedido de R$ ${getTotalPrice().toFixed(2).replace('.', ',')} realizado com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart()
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

  const formatPrice = (price: string) => {
    return price.replace('R$ ', '').replace('.', '').replace(',', '.')
  }

  const calculateItemTotal = (item: (typeof items)[0]) => {
    const price = parseFloat(formatPrice(item.price))
    return price * item.quantity
  }

  if (items.length === 0) {
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
          <TouchableOpacity onPress={clearCart}>
            <Ionicons name="trash-outline" size={24} color="#EF4058" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Items List */}
        <View className="px-6 py-4">
          {items.map((item) => (
            <View
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4"
            >
              <View className="flex-row">
                <Image
                  source={{ uri: item.image }}
                  className="w-20 h-20 rounded-xl mr-4"
                  resizeMode="cover"
                  alt={item.name}
                />

                <View className="flex-1">
                  <Text
                    className="text-frg900 font-semibold text-base mb-1"
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <View className="flex-row items-center mb-2">
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text className="text-xs text-system-text ml-1">
                      {item.rating}
                    </Text>
                    <Text className="text-xs text-system-text ml-1">
                      ({item.reviews})
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-frgprimary font-bold text-lg">
                        R${' '}
                        {calculateItemTotal(item).toFixed(2).replace('.', ',')}
                      </Text>
                      <Text className="text-system-text text-sm">
                        R$ {formatPrice(item.price).replace('.', ',')} cada
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <TouchableOpacity
                        className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center"
                        onPress={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                      >
                        <Ionicons name="remove" size={16} color="#9FABB9" />
                      </TouchableOpacity>

                      <Text className="mx-4 text-frg900 font-semibold text-base">
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        className="bg-frgprimary rounded-full w-8 h-8 items-center justify-center"
                        onPress={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                      >
                        <Ionicons name="add" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View className="h-32" />
      </ScrollView>

      {/* Checkout Footer */}
      <View className="bg-white border-t border-gray-200 px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-frg900 font-semibold text-lg">Total:</Text>
          <Text className="text-frgprimary font-bold text-2xl">
            R$ {getTotalPrice().toFixed(2).replace('.', ',')}
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
