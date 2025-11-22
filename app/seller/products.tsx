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
import * as ImagePicker from 'expo-image-picker'
import PagerView from 'react-native-pager-view'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarProdutos,
  obterProduto,
  listarCategorias,
  listarVariacoesProduto,
  listarImagensProduto,
  excluirImagem,
  uploadImagem,
} from '@/services/sales'
import { listarEnderecos } from '@/services/customer'
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
  const [newImages, setNewImages] = useState<
    Array<{ uri: string; id?: string }>
  >([])
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

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

  console.log(produtoEdit)

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

  const { data: enderecosData } = useQuery({
    queryKey: ['enderecos'],
    queryFn: listarEnderecos,
  })

  const hasStoreLocation =
    enderecosData?.enderecos && enderecosData.enderecos.length > 0

  useEffect(() => {
    if (produtoEdit) {
      setFormData({
        nome: produtoEdit.nome,
        descricao: produtoEdit.descricao || '',
        preco: Number(produtoEdit.preco) || 0,
        precoPromocional: produtoEdit.precoPromocional
          ? Number(produtoEdit.precoPromocional)
          : undefined,
        estoque: produtoEdit.estoque,
      })
      setNewImages([])
      setImageErrors(new Set())
    }
  }, [produtoEdit])

  useEffect(() => {
    if (!editingId) {
      setNewImages([])
      setImageErrors(new Set())
    }
  }, [editingId])

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

  const uploadImageMutation = useMutation({
    mutationFn: uploadImagem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagens', editingId] })
    },
  })

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para acessar sua galeria.',
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    })

    if (!result.canceled && result.assets.length > 0) {
      const newImgs = result.assets.map((asset) => ({ uri: asset.uri }))
      setNewImages((prev) => [...prev, ...newImgs])
    }
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de permissão para acessar sua câmera.',
      )
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setNewImages((prev) => [...prev, { uri: result.assets[0].uri }])
    }
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setImageErrors((prev) => {
      const newSet = new Set(prev)
      newSet.delete(newImages[index].uri)
      return newSet
    })
  }

  const handleImageError = (uri: string) => {
    setImageErrors((prev) => new Set(prev).add(uri))
  }

  const handleSaveImages = async () => {
    if (!editingId || newImages.length === 0) return

    const totalImages = imagens?.imagens.length || 0
    const uploadPromises = newImages.map((image, index) => {
      return uploadImageMutation
        .mutateAsync({
          produtoId: editingId,
          tipo: totalImages === 0 && index === 0 ? 'principal' : 'galeria',
          file: {
            uri: image.uri,
            type: 'image/jpeg',
            name: `product-image-${Date.now()}-${index}.jpg`,
          },
          ordem: totalImages + index + 1,
        })
        .catch((error) => {
          console.error(`Erro ao fazer upload da imagem ${index + 1}:`, error)
          Alert.alert(
            'Erro',
            `Não foi possível fazer upload da imagem ${index + 1}`,
          )
          return null
        })
    })

    await Promise.all(uploadPromises)
    setNewImages([])
    queryClient.invalidateQueries({ queryKey: ['imagens', editingId] })
  }

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
                onPress={() => {
                  if (!hasStoreLocation) {
                    Alert.alert(
                      'Localização da Loja Necessária',
                      'Você precisa cadastrar a localização da sua loja antes de criar produtos.',
                      [
                        {
                          text: 'Cadastrar Agora',
                          onPress: () => router.push('/seller/store-location'),
                        },
                        { text: 'Cancelar', style: 'cancel' },
                      ],
                    )
                  } else {
                    router.push('/seller/products/new')
                  }
                }}
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
                      {produto.imagens && produto.imagens.length > 0 ? (
                        <Image
                          source={{
                            uri:
                              produto.imagens.find(
                                (img) => img.tipo === 'principal',
                              )?.url || produto.imagens[0].url,
                          }}
                          className="w-20 h-20 rounded-xl mr-4"
                          resizeMode="cover"
                          alt={produto.nome}
                        />
                      ) : (
                        <View className="w-20 h-20 rounded-xl mr-4 bg-gray-200 items-center justify-center">
                          <Ionicons
                            name="image-outline"
                            size={24}
                            color="#9FABB9"
                          />
                        </View>
                      )}
                      <View className="flex-1">
                        <View className="flex-row items-start justify-between mb-2">
                          <View className="flex-1">
                            <Text className="text-frg900 font-semibold text-base mb-1">
                              {produto.nome}
                            </Text>
                            <Text className="text-frgprimary font-bold text-lg">
                              {formatPrice(
                                Number(
                                  produto.precoPromocional || produto.preco,
                                ),
                              )}
                            </Text>
                          </View>
                          <View
                            className={`px-3 py-1 rounded-full ${
                              produto.estoque > 0
                                ? 'bg-green-100'
                                : 'bg-gray-100'
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                produto.estoque > 0
                                  ? 'text-green-700'
                                  : 'text-gray-600'
                              }`}
                            >
                              {produto.estoque > 0 ? 'Ativo' : 'Sem estoque'}
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
              <Ionicons name="alert-circle-outline" size={64} color="#9FABB9" />
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
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
              style={{ flex: 1 }}
            >
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 100 }}
              >
                <View className="px-6 pt-6">
                  {/* Imagens Existentes e Novas */}
                  <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-frg900 font-bold text-lg">
                        Imagens do Produto
                      </Text>
                      {(imagens?.imagens.length || 0) + newImages.length <
                        10 && (
                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            className="bg-gray-100 rounded-xl px-3 py-2"
                            onPress={pickImages}
                          >
                            <Ionicons
                              name="images-outline"
                              size={18}
                              color="#437C99"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="bg-gray-100 rounded-xl px-3 py-2"
                            onPress={takePhoto}
                          >
                            <Ionicons
                              name="camera-outline"
                              size={18}
                              color="#437C99"
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {/* Imagens Existentes */}
                    {imagens && imagens.imagens.length > 0 && (
                      <View className="mb-4">
                        <Text className="text-system-text text-sm mb-2">
                          Imagens existentes
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                        >
                          <View className="flex-row gap-3">
                            {imagens.imagens.map((imagem) => {
                              const hasError = imageErrors.has(imagem.url)
                              return (
                                <View key={imagem.id} className="relative">
                                  <View className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                                    {hasError ? (
                                      <View className="w-full h-full bg-gray-200 items-center justify-center">
                                        <Ionicons
                                          name="image-outline"
                                          size={32}
                                          color="#9FABB9"
                                        />
                                        <Text className="text-system-text text-xs mt-1">
                                          Erro
                                        </Text>
                                      </View>
                                    ) : (
                                      <Image
                                        source={{ uri: imagem.url }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                        alt={
                                          produtoEdit?.nome ||
                                          'Imagem do produto'
                                        }
                                        onError={() =>
                                          handleImageError(imagem.url)
                                        }
                                      />
                                    )}
                                  </View>
                                  <TouchableOpacity
                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5"
                                    onPress={() => {
                                      Alert.alert(
                                        'Confirmar exclusão',
                                        'Tem certeza que deseja excluir esta imagem?',
                                        [
                                          { text: 'Cancelar', style: 'cancel' },
                                          {
                                            text: 'Excluir',
                                            style: 'destructive',
                                            onPress: () =>
                                              deleteImageMutation.mutate(
                                                imagem.id,
                                              ),
                                          },
                                        ],
                                      )
                                    }}
                                  >
                                    <Ionicons
                                      name="close"
                                      size={16}
                                      color="white"
                                    />
                                  </TouchableOpacity>
                                  {imagem.tipo === 'principal' && (
                                    <View className="absolute bottom-0 left-0 right-0 bg-frgprimary/80 px-2 py-1">
                                      <Text className="text-white text-xs text-center font-semibold">
                                        Principal
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              )
                            })}
                          </View>
                        </ScrollView>
                      </View>
                    )}

                    {/* Novas Imagens Selecionadas */}
                    {newImages.length > 0 && (
                      <View className="mb-4">
                        <Text className="text-system-text text-sm mb-2">
                          Novas imagens ({newImages.length})
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                        >
                          <View className="flex-row gap-3">
                            {newImages.map((image, index) => {
                              const hasError = imageErrors.has(image.uri)
                              return (
                                <View
                                  key={`new-${image.uri}-${index}`}
                                  className="relative"
                                >
                                  <View className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                                    {hasError ? (
                                      <View className="w-full h-full bg-gray-200 items-center justify-center">
                                        <Ionicons
                                          name="image-outline"
                                          size={32}
                                          color="#9FABB9"
                                        />
                                        <Text className="text-system-text text-xs mt-1">
                                          Erro
                                        </Text>
                                      </View>
                                    ) : (
                                      <Image
                                        source={{ uri: image.uri }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                        alt="Nova imagem do produto"
                                        onError={() =>
                                          handleImageError(image.uri)
                                        }
                                      />
                                    )}
                                  </View>
                                  <TouchableOpacity
                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5"
                                    onPress={() => removeNewImage(index)}
                                  >
                                    <Ionicons
                                      name="close"
                                      size={16}
                                      color="white"
                                    />
                                  </TouchableOpacity>
                                </View>
                              )
                            })}
                          </View>
                        </ScrollView>
                        <TouchableOpacity
                          className="bg-frgprimary rounded-xl py-3 mt-3"
                          onPress={handleSaveImages}
                          disabled={uploadImageMutation.isPending}
                        >
                          <Text className="text-white text-center font-semibold">
                            {uploadImageMutation.isPending
                              ? 'Enviando...'
                              : `Salvar ${newImages.length} imagem(ns)`}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Placeholder quando não há imagens */}
                    {(!imagens || imagens.imagens.length === 0) &&
                      newImages.length === 0 && (
                        <TouchableOpacity
                          className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center min-h-[200px]"
                          onPress={pickImages}
                        >
                          <Ionicons
                            name="image-outline"
                            size={48}
                            color="#9FABB9"
                          />
                          <Text className="text-system-text mt-2 text-center">
                            Nenhuma imagem adicionada
                          </Text>
                          <Text className="text-system-text text-xs mt-1 text-center">
                            Toque para adicionar imagens
                          </Text>
                        </TouchableOpacity>
                      )}
                  </View>

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
                          formData.preco && formData.preco > 0
                            ? formData.preco.toString()
                            : ''
                        }
                        onChangeText={(text) => {
                          const value =
                            Number.parseFloat(
                              text.replaceAll(/[^0-9.]/g, ''),
                            ) || 0
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
                            Number.parseFloat(
                              text.replaceAll(/[^0-9.]/g, ''),
                            ) || 0
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
                          formData.estoque && formData.estoque > 0
                            ? formData.estoque.toString()
                            : ''
                        }
                        onChangeText={(text) => {
                          const value =
                            Number.parseInt(text.replaceAll(/\D/g, ''), 10) || 0
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
                            {variacao.tipo}: {variacao.valor}
                          </Text>
                          <Text className="text-frgprimary font-semibold">
                            {variacao.precoAdicional &&
                            Number(variacao.precoAdicional) > 0
                              ? `+ ${formatPrice(Number(variacao.precoAdicional))}`
                              : 'Sem adicional'}
                          </Text>
                          <Text className="text-system-text text-xs mt-1">
                            Estoque: {variacao.estoque}
                          </Text>
                        </View>
                      ))}
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
