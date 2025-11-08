import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { criarCartao } from '@/services/customer'
import { CriarCartaoReq } from '@/services/customer/interface'

export default function NewCardScreen() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CriarCartaoReq>({
    numero: '',
    nomeTitular: '',
    validade: '',
    cvv: '',
    principal: false,
  })

  const createMutation = useMutation({
    mutationFn: criarCartao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartoes'] })
      Alert.alert('Sucesso', 'Cartão adicionado com sucesso!')
      router.back()
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível adicionar o cartão.')
    },
  })

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '')
    const match = cleaned.match(/.{1,4}/g)
    return match ? match.join(' ') : cleaned
  }

  const formatValidity = (text: string) => {
    const cleaned = text.replace(/\//g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handleSubmit = () => {
    if (
      !formData.numero ||
      !formData.nomeTitular ||
      !formData.validade ||
      !formData.cvv
    ) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.')
      return
    }

    if (formData.cvv.length !== 3) {
      Alert.alert('Erro', 'O CVV deve ter 3 dígitos.')
      return
    }

    createMutation.mutate({
      ...formData,
      numero: formData.numero.replace(/\s/g, ''),
    })
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
          <Text className="text-frg900 font-bold text-xl">Novo Cartão</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <View className="mb-4">
              <Text className="text-frg900 font-medium mb-2">
                Número do Cartão *
              </Text>
              <TextInput
                className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                placeholder="0000 0000 0000 0000"
                value={formData.numero}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    numero: formatCardNumber(text),
                  })
                }
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View className="mb-4">
              <Text className="text-frg900 font-medium mb-2">
                Nome do Titular *
              </Text>
              <TextInput
                className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                placeholder="Nome como está no cartão"
                value={formData.nomeTitular}
                onChangeText={(text) =>
                  setFormData({ ...formData, nomeTitular: text })
                }
                autoCapitalize="words"
              />
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-frg900 font-medium mb-2">Validade *</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="MM/AA"
                  value={formData.validade}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      validade: formatValidity(text),
                    })
                  }
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View className="flex-1">
                <Text className="text-frg900 font-medium mb-2">CVV *</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="123"
                  value={formData.cvv}
                  onChangeText={(text) =>
                    setFormData({ ...formData, cvv: text })
                  }
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
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
              <Text className="text-frg900">Definir como cartão principal</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-frgprimary rounded-xl py-4 mb-6"
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {createMutation.isPending ? 'Salvando...' : 'Adicionar Cartão'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
