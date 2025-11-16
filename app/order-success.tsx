import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'

export default function OrderSuccessScreen() {
  const params = useLocalSearchParams()
  const total = params.total as string
  const pedidoId = params.pedidoId as string | undefined

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numPrice)
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        </View>

        <Text className="text-frg900 font-bold text-2xl mb-2 text-center">
          Pedido Finalizado!
        </Text>
        <Text className="text-system-text text-center mb-2">
          Seu pedido foi realizado com sucesso
        </Text>
        {total && (
          <Text className="text-frgprimary font-bold text-xl mb-8">
            Total: {formatPrice(total)}
          </Text>
        )}

        {pedidoId && (
          <View className="bg-white rounded-2xl p-4 mb-8 w-full">
            <Text className="text-system-text text-center mb-2">
              Número do Pedido
            </Text>
            <Text className="text-frg900 font-bold text-lg text-center">
              #{pedidoId}
            </Text>
          </View>
        )}

        <View className="w-full gap-3">
          <TouchableOpacity
            className="bg-frgprimary rounded-xl py-4"
            onPress={() => router.replace('/home')}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Voltar para Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border-2 border-frgprimary rounded-xl py-4"
            onPress={() => {
              // TODO: Implementar navegação para acompanhar pedido
              // Por enquanto, redireciona para o perfil onde pode ter uma seção de pedidos
              router.push('/profile')
            }}
          >
            <Text className="text-frgprimary text-center text-lg font-semibold">
              Acompanhar Pedido
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

