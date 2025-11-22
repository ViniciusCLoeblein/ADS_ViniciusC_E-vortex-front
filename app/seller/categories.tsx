import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCustomerStore } from '@/stores/customer'
import {
  listarCategorias,
  criarCategoria,
  excluirCategoria,
} from '@/services/sales'
import type { CriarCategoriaReq } from '@/services/sales/interface'

export default function SellerCategoriesScreen() {
  const { profile } = useCustomerStore()
  const isVendedor = profile?.tipo === 'vendedor'

  useEffect(() => {
    if (isVendedor) {
      Alert.alert(
        'Acesso restrito',
        'Vendedores não podem gerenciar categorias. Apenas produtos.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      )
    }
  }, [isVendedor])

  if (isVendedor) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-white px-6 py-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#9FABB9" />
            </TouchableOpacity>
            <Text className="text-frg900 font-bold text-xl">Categorias</Text>
            <View className="w-10" />
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="lock-closed-outline" size={64} color="#9FABB9" />
          <Text className="text-frg900 font-bold text-xl mt-4 mb-2">
            Acesso Restrito
          </Text>
          <Text className="text-system-text text-center mb-6">
            Vendedores não podem gerenciar categorias.{'\n'}
            Você pode apenas cadastrar e gerenciar produtos.
          </Text>
          <TouchableOpacity
            className="bg-frgprimary rounded-xl py-3 px-6"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }
  const queryClient = useQueryClient()
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
  })

  const createMutation = useMutation({
    mutationFn: criarCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      setShowNewCategory(false)
      setNewCategoryName('')
      Alert.alert('Sucesso', 'Categoria criada com sucesso!')
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível criar a categoria.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: excluirCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      Alert.alert('Sucesso', 'Categoria excluída com sucesso!')
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível excluir a categoria.')
    },
  })

  const handleCreate = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Erro', 'Digite o nome da categoria.')
      return
    }

    createMutation.mutate({
      nome: newCategoryName.trim(),
      ativa: true,
    })
  }

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta categoria?',
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
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#9FABB9" />
          </TouchableOpacity>
          <Text className="text-frg900 font-bold text-xl">Categorias</Text>
          <TouchableOpacity
            onPress={() => setShowNewCategory(!showNewCategory)}
            className="bg-frgprimary rounded-full p-2"
          >
            <Ionicons
              name={showNewCategory ? 'close' : 'add'}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>

      {showNewCategory && (
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <View className="flex-1 mr-3">
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-base"
                placeholder="Nome da categoria"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
            </View>
            <TouchableOpacity
              className="bg-frgprimary rounded-xl px-6 py-3"
              onPress={handleCreate}
              disabled={createMutation.isPending}
            >
              <Text className="text-white font-semibold">
                {createMutation.isPending ? 'Criando...' : 'Criar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View className="px-6 pt-6">
          {isLoading ? (
            <View className="items-center py-8">
              <Text className="text-system-text">Carregando categorias...</Text>
            </View>
          ) : data?.categorias && data.categorias.length > 0 ? (
            data.categorias.map((categoria) => (
              <View
                key={categoria.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-frg900 font-semibold text-base mb-1">
                      {categoria.nome}
                    </Text>
                    {categoria.descricao && (
                      <Text className="text-system-text text-sm mb-2">
                        {categoria.descricao}
                      </Text>
                    )}
                    <View
                      className={`px-3 py-1 rounded-full self-start ${
                        categoria.ativa ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          categoria.ativa ? 'text-green-700' : 'text-gray-600'
                        }`}
                      >
                        {categoria.ativa ? 'Ativa' : 'Inativa'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    className="bg-red-50 rounded-xl p-3 ml-4"
                    onPress={() => handleDelete(categoria.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4058" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View className="items-center py-12">
              <Ionicons name="grid-outline" size={64} color="#9FABB9" />
              <Text className="text-frg900 font-bold text-xl mt-4 mb-2">
                Nenhuma categoria
              </Text>
              <Text className="text-system-text text-center">
                Crie uma categoria para começar
              </Text>
            </View>
          )}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  )
}

