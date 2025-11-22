import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarCartoes, excluirCartao } from '@/services/customer'

export default function CardsScreen() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['cartoes'],
    queryFn: listarCartoes,
  })

  const deleteMutation = useMutation({
    mutationFn: excluirCartao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartoes'] })
      Alert.alert('Sucesso', 'Cartão excluído com sucesso!')
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível excluir o cartão.')
    },
  })

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este cartão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ],
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-100 rounded-full p-2"
          >
            <Ionicons name="arrow-back" size={20} color="#9FABB9" />
          </TouchableOpacity>
          <Text className="text-frg900 font-bold text-xl">Meus Cartões</Text>
          <TouchableOpacity
            onPress={() => router.push('/profile/cards/new')}
            className="bg-frgprimary rounded-full p-2"
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          {isLoading ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Text className="text-system-text">Carregando cartões...</Text>
            </View>
          ) : data?.cartoes && data.cartoes.length > 0 ? (
            data.cartoes.map((cartao) => (
              <View
                key={cartao.id}
                className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    {cartao.principal && (
                      <View className="bg-frgprimary/10 rounded-full px-3 py-1 self-start mb-2">
                        <Text className="text-frgprimary text-xs font-semibold">
                          Principal
                        </Text>
                      </View>
                    )}
                    <Text className="text-frg900 font-semibold text-lg mb-1">
                      {cartao.bandeira}
                    </Text>
                    <Text className="text-frg900 font-medium text-base mb-2">
                      •••• •••• •••• {cartao.ultimos_digitos ?? '****'}
                    </Text>
                    <Text className="text-system-text text-sm">
                      {cartao.titular}
                    </Text>
                    <Text className="text-system-text text-sm">
                      Válido até {cartao.mes_validade}/
                      {String(cartao.ano_validade).slice(-2)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 bg-red-50 rounded-xl py-3 flex-row items-center justify-center"
                    onPress={() => handleDelete(cartao.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4058" />
                    <Text className="text-red-500 font-medium ml-2">
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Ionicons name="card-outline" size={64} color="#9FABB9" />
              <Text className="text-system-text text-center mt-4 mb-6">
                Nenhum cartão cadastrado
              </Text>
              <TouchableOpacity
                className="bg-frgprimary rounded-xl py-3 px-6"
                onPress={() => router.push('/profile/cards/new')}
              >
                <Text className="text-white font-semibold">
                  Adicionar Cartão
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
