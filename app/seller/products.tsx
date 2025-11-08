import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import PagerView from 'react-native-pager-view'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarProdutos,
  obterProduto,
  listarCategorias,
  listarVariacoesProduto,
  listarImagensProduto,
  excluirVariacao,
  excluirImagem,
} from '@/services/sales'
import { useAuthStore } from '@/stores/auth'
import type { AtualizarProdutoReq } from '@/services/sales/interface'
import { useBackHandler } from '@/hooks/indext'

export default function SellerProductsScreen() {
  const { userId } = useAuthStore()
  const queryClient = useQueryClient()
  const pagerRef = useRef<PagerView>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AtualizarProdutoReq>({
    nome: '',
    descricao: '',
    preco: 0,
    precoPromocional: undefined,
    categoriaId: '',
    estoque: 0,
    ativo: true,
  })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['produtos', 'vendedor', userId],
    queryFn: () =>
      listarProdutos({
        vendedorId: userId || undefined,
        pagina: 1,
        limite: 100,
      }),
  })

  const { data: produtoEdit, isLoading: isLoadingEdit } = useQuery({
    queryKey: ['produto', editingId],
    queryFn: () => obterProduto(editingId!),
    enabled: !!editingId,
  })

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
  })

  const { data: variacoes } = useQuery({
    queryKey: ['variacoes', editingId],
    queryFn: () => listarVariacoesProduto(editingId!),
    enabled: !!editingId,
  })

  const { data: imagens } = useQuery({
    queryKey: ['imagens', editingId],
    queryFn: () => listarImagensProduto(editingId!),
    enabled: !!editingId,
  })

  useEffect(() => {
    if (produtoEdit) {
      setFormData({
        nome: produtoEdit.nome,
        descricao: produtoEdit.descricao || '',
        preco: produtoEdit.preco,
        precoPromocional: produtoEdit.precoPromocional,
        categoriaId: produtoEdit.categoriaId,
        estoque: produtoEdit.estoque,
        ativo: produtoEdit.ativo,
      })
    }
  }, [produtoEdit])

  const deleteVariationMutation = useMutation({
    mutationFn: excluirVariacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variacoes', editingId] })
      Alert.alert('Sucesso', 'Variação excluída com sucesso!')
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível excluir a variação.')
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: excluirImagem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagens', editingId] })
      Alert.alert('Sucesso', 'Imagem excluída com sucesso!')
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível excluir a imagem.')
    },
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    if (pagerRef.current) {
      pagerRef.current.setPage(1)
    }
    setCurrentPage(1)
  }

  const handleBackToList = () => {
    setEditingId(null)
    if (pagerRef.current) {
      pagerRef.current.setPage(0)
    }
    setCurrentPage(0)
  }

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    const page = e.nativeEvent.position
    setCurrentPage(page)
    if (page === 0) {
      setEditingId(null)
    }
  }

  useBackHandler(() => {
    if (currentPage === 1) {
      handleBackToList()
      return true
    }
    return false
  })

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          {currentPage === 0 ? (
            <>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#9FABB9" />
              </TouchableOpacity>
              <Text className="text-frg900 font-bold text-xl">
                Meus Produtos
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/seller/products/new')}
                className="bg-frgprimary rounded-full p-2"
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={handleBackToList}>
                <Ionicons name="arrow-back" size={24} color="#9FABB9" />
              </TouchableOpacity>
              <Text className="text-frg900 font-bold text-xl">
                Editar Produto
              </Text>
              <View className="w-10" />
            </>
          )}
        </View>
      </View>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {/* Página 0: Listagem */}
        <View key="0" style={{ flex: 1 }}>
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
                  <Text className="text-system-text">
                    Carregando produtos...
                  </Text>
                </View>
              ) : data?.produtos && data.produtos.length > 0 ? (
                data.produtos.map((produto) => (
                  <TouchableOpacity
                    key={produto.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4"
                    onPress={() => handleEdit(produto.id)}
                  >
                    <View className="flex-row">
                      <Image
                        source={{
                          uri:
                            produto.imagemPrincipal ||
                            'https://via.placeholder.com/100',
                        }}
                        className="w-20 h-20 rounded-xl mr-4"
                        resizeMode="cover"
                      />
                      <View className="flex-1">
                        <View className="flex-row items-start justify-between mb-2">
                          <View className="flex-1">
                            <Text className="text-frg900 font-semibold text-base mb-1">
                              {produto.nome}
                            </Text>
                            <Text className="text-frgprimary font-bold text-lg">
                              {formatPrice(
                                produto.precoPromocional || produto.preco,
                              )}
                            </Text>
                          </View>
                          <View
                            className={`px-3 py-1 rounded-full ${
                              produto.ativo
                                ? 'bg-green-100'
                                : 'bg-gray-100'
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                produto.ativo
                                  ? 'text-green-700'
                                  : 'text-gray-600'
                              }`}
                            >
                              {produto.ativo ? 'Ativo' : 'Inativo'}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons
                            name="cube-outline"
                            size={14}
                            color="#9FABB9"
                          />
                          <Text className="text-system-text text-sm ml-1">
                            Estoque: {produto.estoque}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="items-center py-12">
                  <Ionicons name="cube-outline" size={64} color="#9FABB9" />
                  <Text className="text-frg900 font-bold text-xl mt-4 mb-2">
                    Nenhum produto cadastrado
                  </Text>
                  <Text className="text-system-text text-center mb-6">
                    Comece cadastrando seu primeiro produto
                  </Text>
                  <TouchableOpacity
                    className="bg-frgprimary rounded-xl py-3 px-6"
                    onPress={() => router.push('/seller/products/new')}
                  >
                    <Text className="text-white font-semibold">
                      Cadastrar Produto
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View className="h-20" />
          </ScrollView>
        </View>

        {/* Página 1: Edição */}
        <View key="1" style={{ flex: 1 }}>
          {isLoadingEdit ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#437C99" />
            </View>
          ) : !produtoEdit ? (
            <View className="flex-1 items-center justify-center px-6">
              <Ionicons
                name="alert-circle-outline"
                size={64}
                color="#9FABB9"
              />
              <Text className="text-frg900 font-bold text-xl mt-4 mb-2">
                Produto não encontrado
              </Text>
              <TouchableOpacity
                className="bg-frgprimary rounded-xl py-3 px-6 mt-4"
                onPress={handleBackToList}
              >
                <Text className="text-white font-semibold">Voltar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="flex-1"
            >
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <View className="px-6 pt-6">
                  {produtoEdit.imagemPrincipal && (
                    <View className="mb-6">
                      <Image
                        source={{ uri: produtoEdit.imagemPrincipal }}
                        className="w-full h-64 rounded-2xl mb-4"
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <View className="mb-4">
                      <Text className="text-frg900 font-medium mb-2">
                        Nome *
                      </Text>
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
                      <Text className="text-frg900 font-medium mb-2">
                        Descrição
                      </Text>
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
                      <Text className="text-frg900 font-medium mb-2">
                        Preço *
                      </Text>
                      <TextInput
                        className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                        placeholder="0.00"
                        value={
                          formData.preco > 0 ? formData.preco.toString() : ''
                        }
                        onChangeText={(text) => {
                          const value =
                            parseFloat(text.replace(/[^0-9.]/g, '')) || 0
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
                          const value =
                            parseFloat(text.replace(/[^0-9.]/g, '')) || 0
                          setFormData({
                            ...formData,
                            precoPromocional: value > 0 ? value : undefined,
                          })
                        }}
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-frg900 font-medium mb-2">
                        Categoria *
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {categorias?.categorias.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            className={`px-4 py-2 rounded-xl mr-2 ${
                              formData.categoriaId === cat.id
                                ? 'bg-frgprimary'
                                : 'bg-gray-100'
                            }`}
                            onPress={() =>
                              setFormData({
                                ...formData,
                                categoriaId: cat.id,
                              })
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
                      <Text className="text-frg900 font-medium mb-2">
                        Estoque *
                      </Text>
                      <TextInput
                        className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                        placeholder="0"
                        value={
                          formData.estoque > 0
                            ? formData.estoque.toString()
                            : ''
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

                  {variacoes && variacoes.variacoes.length > 0 && (
                    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                      <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-frg900 font-bold text-lg">
                          Variações
                        </Text>
                      </View>
                      {variacoes.variacoes.slice(0, 3).map((variacao) => (
                        <View
                          key={variacao.id}
                          className="bg-gray-50 rounded-xl p-3 mb-2"
                        >
                          <Text className="text-frg900 font-medium">
                            {variacao.nome}
                          </Text>
                          <Text className="text-frgprimary font-semibold">
                            {formatPrice(variacao.preco)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {imagens && imagens.imagens.length > 0 && (
                    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                      <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-frg900 font-bold text-lg">
                          Imagens
                        </Text>
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {imagens.imagens.map((imagem) => (
                          <View key={imagem.id} className="mr-3">
                            <Image
                              source={{ uri: imagem.url }}
                              className="w-24 h-24 rounded-xl"
                              resizeMode="cover"
                            />
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  <TouchableOpacity
                    className="bg-frgprimary rounded-xl py-4 mb-6"
                    onPress={() => {
                      Alert.alert(
                        'Info',
                        'Funcionalidade de atualização em desenvolvimento',
                      )
                    }}
                  >
                    <Text className="text-white text-center text-lg font-semibold">
                      Salvar Alterações
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </View>
      </PagerView>
    </SafeAreaView>
  )
}
