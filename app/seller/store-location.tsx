import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { criarEndereco } from '@/services/customer'
import { CriarEnderecoReq } from '@/services/customer/interface'
import { maskCEP } from '@/constants/masks'
import { buscarCep } from '@/services/brasilapi'
import { useAuthStore } from '@/stores/auth'

export default function StoreLocationScreen() {
  const queryClient = useQueryClient()
  const { userId } = useAuthStore()
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [formData, setFormData] = useState<CriarEnderecoReq>({
    apelido: 'Localização da Loja',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'BR',
    principal: true,
  })

  const handleCepChange = async (text: string) => {
    const masked = maskCEP(text)
    setFormData({ ...formData, cep: masked })

    const cepNumbers = masked.replace(/\D/g, '')
    if (cepNumbers.length === 8) {
      setIsLoadingCep(true)
      try {
        const cepData = await buscarCep(cepNumbers)
        setFormData((prev) => ({
          ...prev,
          cep: masked,
          logradouro: cepData.street || prev.logradouro,
          bairro: cepData.neighborhood || prev.bairro,
          cidade: cepData.city || prev.cidade,
          estado: cepData.state || prev.estado,
        }))
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao buscar CEP'
        Alert.alert('Aviso', errorMessage)
      } finally {
        setIsLoadingCep(false)
      }
    }
  }

  const createMutation = useMutation({
    mutationFn: criarEndereco,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enderecos', userId] })
      Alert.alert(
        'Sucesso',
        'Localização da loja cadastrada com sucesso! Agora você pode cadastrar produtos.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      )
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível cadastrar a localização da loja.')
    },
  })

  const handleSubmit = () => {
    if (!formData.cep) {
      Alert.alert('Erro', 'O CEP é obrigatório.')
      return
    }
    if (!formData.logradouro) {
      Alert.alert('Erro', 'O logradouro é obrigatório.')
      return
    }
    if (!formData.numero) {
      Alert.alert('Erro', 'O número é obrigatório.')
      return
    }
    if (!formData.bairro) {
      Alert.alert('Erro', 'O bairro é obrigatório.')
      return
    }
    if (!formData.cidade) {
      Alert.alert('Erro', 'A cidade é obrigatória.')
      return
    }
    if (!formData.estado) {
      Alert.alert('Erro', 'O estado é obrigatório.')
      return
    }

    createMutation.mutate(formData)
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        style={{ flex: 1 }}
      >
        <View className="bg-white px-6 py-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#9FABB9" />
            </TouchableOpacity>
            <Text className="text-frg900 font-bold text-xl">
              Localização da Loja
            </Text>
            <View className="w-10" />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="px-6 pt-6">
            {/* Informação importante */}
            <View className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
              <View className="flex-row items-start">
                <Ionicons
                  name="information-circle"
                  size={24}
                  color="#437C99"
                  style={{ marginRight: 12, marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text className="text-frg900 font-semibold mb-2">
                    Por que preciso cadastrar a localização?
                  </Text>
                  <Text className="text-system-text text-sm">
                    A localização da sua loja é necessária para que os clientes
                    possam calcular o frete e fazer pedidos. Esta informação
                    será usada para calcular distâncias e valores de entrega.
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-frg900 font-medium">CEP *</Text>
                  {isLoadingCep && (
                    <ActivityIndicator size="small" color="#437C99" />
                  )}
                </View>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChangeText={handleCepChange}
                  keyboardType="numeric"
                  maxLength={8}
                />
                <Text className="text-gray-500 text-xs mt-1">
                  Preenchimento automático ao digitar 8 dígitos
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">
                  Logradouro * (Rua, Avenida, etc.)
                </Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Ex: Rua das Flores"
                  value={formData.logradouro}
                  onChangeText={(text) =>
                    setFormData({ ...formData, logradouro: text })
                  }
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">Número *</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="123"
                  value={formData.numero}
                  onChangeText={(text) =>
                    setFormData({ ...formData, numero: text })
                  }
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">
                  Complemento
                </Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Ex: Sala 101, Loja A"
                  value={formData.complemento || ''}
                  onChangeText={(text) =>
                    setFormData({ ...formData, complemento: text || undefined })
                  }
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">Bairro *</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Nome do bairro"
                  value={formData.bairro}
                  onChangeText={(text) =>
                    setFormData({ ...formData, bairro: text })
                  }
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">Cidade *</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Nome da cidade"
                  value={formData.cidade}
                  onChangeText={(text) =>
                    setFormData({ ...formData, cidade: text })
                  }
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">Estado *</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Ex: SP, RJ, MG"
                  value={formData.estado}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      estado: text.toUpperCase().slice(0, 2),
                    })
                  }
                  maxLength={2}
                />
                <Text className="text-system-text text-xs mt-1">
                  Digite a sigla do estado (2 letras)
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-frgprimary rounded-xl py-4 mb-6"
              onPress={handleSubmit}
              disabled={createMutation.isPending}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {createMutation.isPending
                  ? 'Cadastrando...'
                  : 'Cadastrar Localização'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
