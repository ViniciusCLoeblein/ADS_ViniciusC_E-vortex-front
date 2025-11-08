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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { criarProduto, listarCategorias } from '@/services/sales'
import type { CriarProdutoReq } from '@/services/sales/interface'

export default function NewProductScreen() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CriarProdutoReq>({
    nome: '',
    descricao: '',
    preco: 0,
    precoPromocional: undefined,
    categoriaId: '',
    estoque: 0,
    ativo: true,
  })

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
  })

  const createMutation = useMutation({
    mutationFn: criarProduto,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      Alert.alert('Sucesso', 'Produto criado com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.push('/seller/products'),
        },
      ])
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível criar o produto.')
    },
  })

  const handleSubmit = () => {
    if (
      !formData.nome ||
      !formData.preco ||
      !formData.categoriaId ||
      formData.estoque === undefined
    ) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.')
      return
    }

    if (formData.preco <= 0) {
      Alert.alert('Erro', 'O preço deve ser maior que zero.')
      return
    }

    createMutation.mutate(formData)
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="bg-white px-6 py-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#9FABB9" />
            </TouchableOpacity>
            <Text className="text-frg900 font-bold text-xl">
              Novo Produto
            </Text>
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
                <Text className="text-frg900 font-medium mb-2">Nome *</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Nome do produto"
                  value={formData.nome}
                  onChangeText={(text) =>
                    setFormData({ ...formData, nome: text })
                  }
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">Descrição</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Descrição do produto"
                  value={formData.descricao}
                  onChangeText={(text) =>
                    setFormData({ ...formData, descricao: text })
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">Preço *</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="0.00"
                  value={
                    formData.preco > 0 ? formData.preco.toString() : ''
                  }
                  onChangeText={(text) => {
                    const value = parseFloat(text.replace(/[^0-9.]/g, '')) || 0
                    setFormData({ ...formData, preco: value })
                  }}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">
                  Preço Promocional
                </Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="0.00"
                  value={
                    formData.precoPromocional
                      ? formData.precoPromocional.toString()
                      : ''
                  }
                  onChangeText={(text) => {
                    const value = parseFloat(text.replace(/[^0-9.]/g, '')) || 0
                    setFormData({
                      ...formData,
                      precoPromocional: value > 0 ? value : undefined,
                    })
                  }}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">Categoria *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categorias?.categorias.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      className={`px-4 py-2 rounded-xl mr-2 ${
                        formData.categoriaId === cat.id
                          ? 'bg-frgprimary'
                          : 'bg-gray-100'
                      }`}
                      onPress={() =>
                        setFormData({ ...formData, categoriaId: cat.id })
                      }
                    >
                      <Text
                        className={
                          formData.categoriaId === cat.id
                            ? 'text-white font-medium'
                            : 'text-frg900 font-medium'
                        }
                      >
                        {cat.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">Estoque *</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="0"
                  value={
                    formData.estoque > 0 ? formData.estoque.toString() : ''
                  }
                  onChangeText={(text) => {
                    const value = parseInt(text.replace(/[^0-9]/g, '')) || 0
                    setFormData({ ...formData, estoque: value })
                  }}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                className="flex-row items-center mb-4"
                onPress={() =>
                  setFormData({ ...formData, ativo: !formData.ativo })
                }
              >
                <View
                  className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                    formData.ativo
                      ? 'bg-frgprimary border-frgprimary'
                      : 'border-gray-300'
                  }`}
                >
                  {formData.ativo && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text className="text-frg900">Produto ativo</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-frgprimary rounded-xl py-4 mb-6"
              onPress={handleSubmit}
              disabled={createMutation.isPending}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {createMutation.isPending ? 'Criando...' : 'Criar Produto'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

