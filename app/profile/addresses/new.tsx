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

export default function NewAddressScreen() {
  const queryClient = useQueryClient()
  const { userId } = useAuthStore()
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [formData, setFormData] = useState<CriarEnderecoReq>({
    apelido: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'BR',
    principal: false,
  })

  const handleCepChange = async (text: string) => {
    const masked = maskCEP(text)
    setFormData({ ...formData, cep: masked })

    // Buscar CEP quando tiver 8 dígitos
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
      Alert.alert('Sucesso', 'Endereço criado com sucesso!')
      router.back()
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível criar o endereço.')
    },
  })

  const handleSubmit = () => {
    // Validações obrigatórias
    if (
      !formData.apelido ||
      !formData.cep ||
      !formData.logradouro ||
      !formData.numero ||
      !formData.bairro ||
      !formData.cidade ||
      !formData.estado ||
      !formData.pais
    ) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.')
      return
    }

    // Validação de CEP (8 dígitos)
    const cepNumbers = formData.cep.replace(/\D/g, '')
    if (cepNumbers.length !== 8) {
      Alert.alert('Erro', 'CEP deve conter 8 dígitos.')
      return
    }

    // Validação de estado (2 caracteres)
    if (formData.estado.length !== 2) {
      Alert.alert('Erro', 'Estado deve conter 2 caracteres (UF).')
      return
    }

    // Validação de país (2 caracteres)
    if (formData.pais.length !== 2) {
      Alert.alert('Erro', 'País deve conter 2 caracteres (código).')
      return
    }

    // Validação de tamanhos máximos
    if (formData.apelido.length > 50) {
      Alert.alert('Erro', 'Apelido deve ter no máximo 50 caracteres.')
      return
    }

    if (formData.logradouro.length > 255) {
      Alert.alert('Erro', 'Logradouro deve ter no máximo 255 caracteres.')
      return
    }

    if (formData.numero.length > 20) {
      Alert.alert('Erro', 'Número deve ter no máximo 20 caracteres.')
      return
    }

    if (formData.complemento && formData.complemento.length > 100) {
      Alert.alert('Erro', 'Complemento deve ter no máximo 100 caracteres.')
      return
    }

    if (formData.bairro.length > 100) {
      Alert.alert('Erro', 'Bairro deve ter no máximo 100 caracteres.')
      return
    }

    if (formData.cidade.length > 100) {
      Alert.alert('Erro', 'Cidade deve ter no máximo 100 caracteres.')
      return
    }

    createMutation.mutate({
      ...formData,
      cep: cepNumbers, // Enviar apenas números
      complemento: formData.complemento || undefined,
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="bg-white px-6 py-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-gray-100 rounded-full p-2"
            >
              <Ionicons name="arrow-back" size={20} color="#9FABB9" />
            </TouchableOpacity>
            <Text className="text-frg900 font-bold text-xl">Novo Endereço</Text>
            <View className="w-10" />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className="px-6 pt-6">
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">Apelido *</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Casa, Trabalho, etc."
                  value={formData.apelido}
                  onChangeText={(text) =>
                    setFormData({ ...formData, apelido: text })
                  }
                  maxLength={50}
                />
              </View>

              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-frg900 font-medium">CEP *</Text>
                  {isLoadingCep && (
                    <ActivityIndicator size="small" color="#437C99" />
                  )}
                </View>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="00000000"
                  value={formData.cep}
                  onChangeText={handleCepChange}
                  keyboardType="numeric"
                  maxLength={8}
                />
                <Text className="text-gray-500 text-xs mt-1">
                  Apenas números (8 dígitos) - Preenchimento automático
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">
                  Logradouro *
                </Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Rua, Avenida, etc."
                  value={formData.logradouro}
                  onChangeText={(text) =>
                    setFormData({ ...formData, logradouro: text })
                  }
                  maxLength={255}
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
                  maxLength={20}
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">
                  Complemento
                </Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Apto, Bloco, etc."
                  value={formData.complemento}
                  onChangeText={(text) =>
                    setFormData({ ...formData, complemento: text })
                  }
                  maxLength={100}
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
                  maxLength={100}
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
                  maxLength={100}
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">Estado *</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="UF"
                  value={formData.estado}
                  onChangeText={(text) =>
                    setFormData({ ...formData, estado: text.toUpperCase() })
                  }
                  maxLength={2}
                />
                <Text className="text-gray-500 text-xs mt-1">
                  2 caracteres (ex: RS, SP)
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">País *</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="BR"
                  value={formData.pais}
                  onChangeText={(text) =>
                    setFormData({ ...formData, pais: text.toUpperCase() })
                  }
                  maxLength={2}
                />
                <Text className="text-gray-500 text-xs mt-1">
                  2 caracteres (código do país, ex: BR)
                </Text>
              </View>

              <TouchableOpacity
                className="flex-row items-center mb-4"
                onPress={() =>
                  setFormData({ ...formData, principal: !formData.principal })
                }
              >
                <View
                  className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                    formData.principal
                      ? 'bg-frgprimary border-frgprimary'
                      : 'border-gray-300'
                  }`}
                >
                  {formData.principal && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text className="text-frg900">
                  Definir como endereço principal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-frgprimary rounded-xl py-4 mb-6"
                onPress={handleSubmit}
                disabled={createMutation.isPending}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {createMutation.isPending ? 'Salvando...' : 'Salvar Endereço'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
