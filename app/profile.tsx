import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCustomerStore } from '@/stores/customer'
import { useAuthStore } from '@/stores/auth'
import { maskCPF, maskPhone } from '@/constants/masks'

export default function ProfileScreen() {
  const { profile } = useCustomerStore()
  const { clearAuth } = useAuthStore()
  const { clearProfile } = useCustomerStore()

  const handleLogout = () => {
    clearAuth()
    clearProfile()
    router.replace('/login')
  }

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View className="mb-4 pb-4 border-b border-gray-200">
      <Text className="text-system-text text-sm mb-1">{label}</Text>
      <Text className="text-frg900 font-medium text-base">{value}</Text>
    </View>
  )

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
          <Text className="text-frg900 font-bold text-xl">Meu Perfil</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          {profile ? (
            <>
              <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                <View className="items-center mb-6">
                  <View className="w-20 h-20 bg-frgprimary rounded-full items-center justify-center mb-3">
                    <Ionicons name="person" size={40} color="white" />
                  </View>
                  <Text className="text-frg900 font-bold text-xl">
                    {profile.nome}
                  </Text>
                  <Text className="text-system-text text-sm mt-1">
                    {profile.email}
                  </Text>
                </View>

                <InfoRow label="CPF" value={maskCPF(profile.cpf)} />
                <InfoRow
                  label="Status do Email"
                  value={
                    profile.emailVerificado ? 'Verificado' : 'Não verificado'
                  }
                />
                <InfoRow label="Telefone" value={maskPhone(profile.telefone)} />
                <InfoRow label="Tipo" value={profile.tipo} />
                <InfoRow label="ID" value={profile.id} />
                <InfoRow label="UUID" value={profile.uuid} />
              </View>

              <TouchableOpacity
                className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex-row items-center justify-between"
                onPress={() => router.push('/profile/addresses')}
              >
                <View className="flex-row items-center">
                  <View className="bg-frgprimary/10 rounded-full p-3 mr-4">
                    <Ionicons
                      name="location-outline"
                      size={24}
                      color="#437C99"
                    />
                  </View>
                  <View>
                    <Text className="text-frg900 font-semibold text-base">
                      Gerenciar Endereços
                    </Text>
                    <Text className="text-system-text text-sm">
                      Adicionar, editar ou remover endereços
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9FABB9" />
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex-row items-center justify-between"
                onPress={() => router.push('/profile/cards')}
              >
                <View className="flex-row items-center">
                  <View className="bg-frgprimary/10 rounded-full p-3 mr-4">
                    <Ionicons name="card-outline" size={24} color="#437C99" />
                  </View>
                  <View>
                    <Text className="text-frg900 font-semibold text-base">
                      Gerenciar Cartões
                    </Text>
                    <Text className="text-system-text text-sm">
                      Adicionar ou remover cartões de crédito
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9FABB9" />
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white rounded-2xl p-4 mb-6 shadow-sm flex-row items-center justify-between"
                onPress={() => router.push('/profile/orders')}
              >
                <View className="flex-row items-center">
                  <View className="bg-frgprimary/10 rounded-full p-3 mr-4">
                    <Ionicons name="receipt-outline" size={24} color="#437C99" />
                  </View>
                  <View>
                    <Text className="text-frg900 font-semibold text-base">
                      Meus Pedidos
                    </Text>
                    <Text className="text-system-text text-sm">
                      Ver histórico de pedidos
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9FABB9" />
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-red-500 rounded-xl py-4 mb-6"
                onPress={handleLogout}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  Sair da Conta
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Ionicons name="person-outline" size={64} color="#9FABB9" />
              <Text className="text-system-text text-center mt-4">
                Carregando informações do perfil...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
