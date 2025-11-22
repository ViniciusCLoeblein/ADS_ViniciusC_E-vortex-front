import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { obterVendedor } from '@/services/sales'
import { useAuthStore } from '@/stores/auth'
import { useCustomerStore } from '@/stores/customer'

export default function MyCompanyScreen() {
  const { profile } = useCustomerStore()
  const { userId } = useAuthStore()

  const { data: vendedorData, isLoading } = useQuery({
    queryKey: ['vendedor', userId],
    queryFn: () => obterVendedor(userId!),
    enabled: !!userId && !!profile && profile.tipo === 'vendedor',
  })

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View className="mb-4 pb-4 border-b border-gray-200">
      <Text className="text-system-text text-sm mb-1">{label}</Text>
      <Text className="text-frg900 font-medium text-base">
        {value || 'Não informado'}
      </Text>
    </View>
  )

  const InfoSection = ({
    title,
    icon,
    children,
  }: {
    title: string
    icon: string
    children: React.ReactNode
  }) => (
    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="bg-frgprimary/10 rounded-full p-2 mr-3">
          <Ionicons
            name={icon as keyof typeof Ionicons.glyphMap}
            size={20}
            color="#437C99"
          />
        </View>
        <Text className="text-frg900 font-bold text-lg">{title}</Text>
      </View>
      {children}
    </View>
  )

  const empresaData = {
    razaoSocial: vendedorData?.razaoSocial || '',
    nomeFantasia: vendedorData?.nomeFantasia || '',
    status: vendedorData?.status || '',
    dataAprovacao: vendedorData?.dataAprovacao || null,
    criadoEm: vendedorData?.criadoEm || null,
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#9FABB9" />
          </TouchableOpacity>
          <Text className="text-frg900 font-bold text-xl">Minha Empresa</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          {isLoading ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Text className="text-system-text">
                Carregando informações...
              </Text>
            </View>
          ) : (
            <>
              <InfoSection title="Dados da Empresa" icon="business-outline">
                <InfoRow
                  label="Nome Fantasia"
                  value={empresaData.nomeFantasia || 'Não cadastrado'}
                />
                <InfoRow
                  label="Razão Social"
                  value={empresaData.razaoSocial || 'Não cadastrado'}
                />
                <InfoRow
                  label="Status"
                  value={
                    empresaData.status === 'aprovado'
                      ? 'Aprovado'
                      : empresaData.status === 'pendente'
                        ? 'Pendente'
                        : empresaData.status === 'rejeitado'
                          ? 'Rejeitado'
                          : empresaData.status || 'Não informado'
                  }
                />
                {empresaData.dataAprovacao && (
                  <InfoRow
                    label="Data de Aprovação"
                    value={new Date(
                      empresaData.dataAprovacao,
                    ).toLocaleDateString('pt-BR')}
                  />
                )}
                {empresaData.criadoEm && (
                  <InfoRow
                    label="Data de Criação"
                    value={new Date(empresaData.criadoEm).toLocaleDateString(
                      'pt-BR',
                    )}
                  />
                )}
              </InfoSection>

              <View className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                <View className="flex-row items-start">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#437C99"
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                  <View className="flex-1">
                    <Text className="text-frg900 font-semibold mb-1">
                      Informação
                    </Text>
                    <Text className="text-system-text text-sm">
                      Para alterar os dados da empresa ou conta bancária, entre
                      em contato com o suporte.
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  )
}
