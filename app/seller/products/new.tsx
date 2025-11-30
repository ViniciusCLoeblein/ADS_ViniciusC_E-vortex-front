import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import {
  criarProduto,
  listarCategorias,
  uploadImagem,
  criarVariacao,
} from '@/services/sales'
import { listarEnderecos } from '@/services/customer'
import type {
  CriarProdutoReq,
  CriarVariacaoReq,
} from '@/services/sales/interface'
import { useAuthStore } from '@/stores/auth'

// Função para formatar dinheiro durante a digitação
const formatMoneyInput = (value: string): string => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '')

  if (!numbers) return ''

  // Converte para centavos e depois formata
  const cents = parseInt(numbers, 10)
  const reais = cents / 100

  // Formata como R$ X.XXX,XX
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(reais)
}

// Função para converter valor formatado de volta para número
const parseMoneyInput = (value: string): number => {
  if (!value) return 0
  // Remove tudo exceto números e trata como centavos
  const numbers = value.replace(/\D/g, '')
  if (!numbers) return 0
  return parseInt(numbers, 10) / 100
}

// Função para gerar sugestão de SKU baseado no nome
const generateSKUSuggestion = (nome: string): string => {
  if (!nome) return ''

  // Remove acentos e caracteres especiais
  const normalized = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()

  // Pega as primeiras letras de cada palavra
  const words = normalized.split(' ').filter((w) => w.length > 0)
  let sku = ''

  if (words.length === 1) {
    // Se só uma palavra, pega as primeiras 4 letras
    sku = words[0].substring(0, 4)
  } else {
    // Se múltiplas palavras, pega a primeira letra de cada
    sku = words.map((w) => w[0]).join('')
  }

  // Adiciona timestamp para garantir unicidade
  const timestamp = Date.now().toString().slice(-4)
  return `${sku}-${timestamp}`
}

export default function NewProductScreen() {
  const queryClient = useQueryClient()
  const { userId } = useAuthStore()
  const [formData, setFormData] = useState<CriarProdutoReq>({
    categoriaId: '',
    sku: '',
    nome: '',
    descricao: '',
    descricaoCurta: '',
    preco: 0,
    precoPromocional: undefined,
    pesoKg: 0,
    alturaCm: 0,
    larguraCm: 0,
    profundidadeCm: 0,
    estoque: 0,
    estoqueMinimo: 0,
    tags: undefined,
    destaque: false,
    ativo: true,
  })
  const [selectedImages, setSelectedImages] = useState<
    Array<{ uri: string; id?: string }>
  >([])
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [precoDisplay, setPrecoDisplay] = useState('')
  const [precoPromocionalDisplay, setPrecoPromocionalDisplay] = useState('')
  const [variacoes, setVariacoes] = useState<
    Array<Omit<CriarVariacaoReq, 'produtoId'>>
  >([])
  const [showVariacaoForm, setShowVariacaoForm] = useState(false)
  const [variacaoForm, setVariacaoForm] = useState<
    Omit<CriarVariacaoReq, 'produtoId'>
  >({
    nome: '',
    descricao: '',
    preco: 0,
    precoPromocional: undefined,
    estoque: 0,
    sku: '',
    ativa: true,
  })
  const [variacaoPrecoDisplay, setVariacaoPrecoDisplay] = useState('')
  const [variacaoPrecoPromocionalDisplay, setVariacaoPrecoPromocionalDisplay] =
    useState('')

  const { data: categorias } = useQuery({
    queryKey: ['categorias', userId],
    queryFn: listarCategorias,
    enabled: !!userId,
  })

  const { data: enderecosData, isLoading: isLoadingEnderecos } = useQuery({
    queryKey: ['enderecos', userId],
    queryFn: listarEnderecos,
    enabled: !!userId,
  })

  const hasStoreLocation =
    enderecosData?.enderecos && enderecosData.enderecos.length > 0

  useEffect(() => {
    if (!isLoadingEnderecos && !hasStoreLocation) {
      Alert.alert(
        'Localização da Loja Necessária',
        'Você precisa cadastrar a localização da sua loja antes de criar produtos. Isso é necessário para calcular fretes e permitir que clientes façam pedidos.',
        [
          {
            text: 'Cadastrar Agora',
            onPress: () => router.push('/seller/store-location'),
          },
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => router.back(),
          },
        ],
      )
    }
  }, [isLoadingEnderecos, hasStoreLocation])

  // Gera sugestão de SKU quando o nome muda
  useEffect(() => {
    if (formData.nome && !formData.sku) {
      const suggestion = generateSKUSuggestion(formData.nome)
      setFormData((prev) => ({ ...prev, sku: suggestion }))
    }
  }, [formData.nome, formData.sku])

  const createVariacaoMutation = useMutation({
    mutationFn: criarVariacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variacoes', userId] })
    },
  })

  const createMutation = useMutation({
    mutationFn: criarProduto,
    onSuccess: async (data) => {
      // Se houver imagens selecionadas, fazer upload de todas
      if (selectedImages.length > 0 && data.id) {
        const uploadPromises = selectedImages.map((image, index) => {
          return uploadImageMutation
            .mutateAsync({
              produtoId: data.id,
              tipo: index === 0 ? 'principal' : 'galeria',
              file: {
                uri: image.uri,
                type: 'image/jpeg',
                name: `product-image-${index}.jpg`,
              },
              ordem: index + 1,
            })
            .catch((error) => {
              console.error(
                `Erro ao fazer upload da imagem ${index + 1}:`,
                error,
              )
              return null
            })
        })

        await Promise.all(uploadPromises)
      }

      // Se houver variações, criar todas
      if (variacoes.length > 0 && data.id) {
        const variacaoPromises = variacoes.map((variacao) => {
          return createVariacaoMutation
            .mutateAsync({
              ...variacao,
              produtoId: data.id,
            })
            .catch((error) => {
              console.error('Erro ao criar variação:', error)
              return null
            })
        })

        await Promise.all(variacaoPromises)
      }

      queryClient.invalidateQueries({ queryKey: ['produtos', 'vendedor', userId] })
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

  const uploadImageMutation = useMutation({
    mutationFn: uploadImagem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagens', userId] })
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
      const newImages = result.assets.map((asset) => ({ uri: asset.uri }))
      setSelectedImages((prev) => [...prev, ...newImages])
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
      setSelectedImages((prev) => [...prev, { uri: result.assets[0].uri }])
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImageErrors((prev) => {
      const newSet = new Set(prev)
      newSet.delete(selectedImages[index].uri)
      return newSet
    })
  }

  const handleImageError = (uri: string) => {
    setImageErrors((prev) => new Set(prev).add(uri))
  }

  const addVariacao = () => {
    if (!variacaoForm.nome) {
      Alert.alert('Erro', 'O nome da variação é obrigatório.')
      return
    }
    if (variacaoForm.preco <= 0) {
      Alert.alert('Erro', 'O preço da variação deve ser maior que zero.')
      return
    }
    if (variacaoForm.estoque < 0) {
      Alert.alert('Erro', 'O estoque não pode ser negativo.')
      return
    }

    setVariacoes((prev) => [...prev, variacaoForm])
    setVariacaoForm({
      nome: '',
      descricao: '',
      preco: 0,
      precoPromocional: undefined,
      estoque: 0,
      sku: '',
      ativa: true,
    })
    setVariacaoPrecoDisplay('')
    setVariacaoPrecoPromocionalDisplay('')
    setShowVariacaoForm(false)
  }

  const removeVariacao = (index: number) => {
    setVariacoes((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    // Validações
    if (!formData.nome) {
      Alert.alert('Erro', 'O nome do produto é obrigatório.')
      return
    }
    if (!formData.sku) {
      Alert.alert('Erro', 'O SKU é obrigatório.')
      return
    }
    if (!formData.categoriaId) {
      Alert.alert('Erro', 'Selecione uma categoria.')
      return
    }
    if (!formData.descricao) {
      Alert.alert('Erro', 'A descrição é obrigatória.')
      return
    }
    if (!formData.descricaoCurta) {
      Alert.alert('Erro', 'A descrição curta é obrigatória.')
      return
    }
    if (formData.preco <= 0) {
      Alert.alert('Erro', 'O preço deve ser maior que zero.')
      return
    }
    if (formData.estoque < 0) {
      Alert.alert('Erro', 'O estoque não pode ser negativo.')
      return
    }
    if (formData.estoqueMinimo < 0) {
      Alert.alert('Erro', 'O estoque mínimo não pode ser negativo.')
      return
    }

    createMutation.mutate(formData)
  }

  // Bloqueia a tela se não tiver localização cadastrada
  if (!isLoadingEnderecos && !hasStoreLocation) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-white px-6 py-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#9FABB9" />
            </TouchableOpacity>
            <Text className="text-frg900 font-bold text-xl">Novo Produto</Text>
            <View className="w-10" />
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="location-outline" size={64} color="#9FABB9" />
          <Text className="text-frg900 font-bold text-xl mt-4 mb-2">
            Localização Necessária
          </Text>
          <Text className="text-system-text text-center mb-6">
            Você precisa cadastrar a localização da sua loja antes de criar
            produtos.
          </Text>
          <Text className="text-system-text text-center mb-6 text-sm">
            A localização é necessária para calcular fretes e permitir que
            clientes façam pedidos.
          </Text>
          <TouchableOpacity
            className="bg-frgprimary rounded-xl py-3 px-6"
            onPress={() => router.push('/seller/store-location')}
          >
            <Text className="text-white font-semibold">
              Cadastrar Localização
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
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
            <Text className="text-frg900 font-bold text-xl">Novo Produto</Text>
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
            {/* Seção de Imagens */}
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-frg900 font-medium">
                  Imagens do Produto ({selectedImages.length})
                </Text>
                {selectedImages.length < 10 && (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="bg-gray-100 rounded-xl px-4 py-2"
                      onPress={pickImages}
                    >
                      <Ionicons
                        name="images-outline"
                        size={20}
                        color="#437C99"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-gray-100 rounded-xl px-4 py-2"
                      onPress={takePhoto}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={20}
                        color="#437C99"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {selectedImages.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-3"
                >
                  <View className="flex-row gap-3">
                    {selectedImages.map((image, index) => {
                      const hasError = imageErrors.has(image.uri)
                      return (
                        <View
                          key={`${image.uri}-${index}`}
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
                                onError={() => handleImageError(image.uri)}
                              />
                            )}
                          </View>
                          <TouchableOpacity
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5"
                            onPress={() => removeImage(index)}
                          >
                            <Ionicons name="close" size={16} color="white" />
                          </TouchableOpacity>
                          {index === 0 && (
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
              ) : (
                <TouchableOpacity
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center min-h-[200px]"
                  onPress={pickImages}
                >
                  <Ionicons name="image-outline" size={48} color="#9FABB9" />
                  <Text className="text-system-text mt-2 text-center">
                    Toque para adicionar imagens
                  </Text>
                  <Text className="text-system-text text-xs mt-1 text-center">
                    Você pode adicionar até 10 imagens
                  </Text>
                </TouchableOpacity>
              )}

              {selectedImages.length === 0 && (
                <View className="flex-row gap-3 mt-3">
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                    onPress={pickImages}
                  >
                    <Ionicons name="images-outline" size={20} color="#437C99" />
                    <Text className="text-frg900 font-medium mt-1">
                      Galeria
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
                    onPress={takePhoto}
                  >
                    <Ionicons name="camera-outline" size={20} color="#437C99" />
                    <Text className="text-frg900 font-medium mt-1">Câmera</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

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
                <Text className="text-frg900 font-medium mb-2">SKU *</Text>
                <View className="flex-row items-center">
                  <TextInput
                    className="flex-1 bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Ex: PROD-1234"
                    value={formData.sku}
                    onChangeText={(text) =>
                      setFormData({ ...formData, sku: text.toUpperCase() })
                    }
                  />
                  <TouchableOpacity
                    className="ml-2 bg-gray-100 rounded-xl px-4 py-3"
                    onPress={() => {
                      const suggestion = generateSKUSuggestion(formData.nome)
                      setFormData({ ...formData, sku: suggestion })
                    }}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={20}
                      color="#437C99"
                    />
                  </TouchableOpacity>
                </View>
                <Text className="text-system-text text-xs mt-1">
                  Código único de identificação do produto
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">
                  Descrição Curta *
                </Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Breve descrição do produto"
                  value={formData.descricaoCurta}
                  onChangeText={(text) =>
                    setFormData({ ...formData, descricaoCurta: text })
                  }
                  maxLength={150}
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">
                  Descrição Completa *
                </Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="Descrição detalhada do produto"
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
                  placeholder="R$ 0,00"
                  value={precoDisplay}
                  onChangeText={(text) => {
                    const formatted = formatMoneyInput(text)
                    setPrecoDisplay(formatted)
                    const value = parseMoneyInput(formatted)
                    setFormData({ ...formData, preco: value })
                  }}
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">
                  Preço Promocional
                </Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="R$ 0,00"
                  value={precoPromocionalDisplay}
                  onChangeText={(text) => {
                    const formatted = formatMoneyInput(text)
                    setPrecoPromocionalDisplay(formatted)
                    const value = parseMoneyInput(formatted)
                    setFormData({
                      ...formData,
                      precoPromocional: value > 0 ? value : undefined,
                    })
                  }}
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">
                  Categoria *
                </Text>
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

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">
                  Estoque Mínimo *
                </Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="0"
                  value={
                    formData.estoqueMinimo > 0
                      ? formData.estoqueMinimo.toString()
                      : ''
                  }
                  onChangeText={(text) => {
                    const value = parseInt(text.replace(/[^0-9]/g, '')) || 0
                    setFormData({ ...formData, estoqueMinimo: value })
                  }}
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">Peso (kg)</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="0.00"
                  value={formData.pesoKg > 0 ? formData.pesoKg.toString() : ''}
                  onChangeText={(text) => {
                    // Permite números e ponto decimal, mas apenas um ponto
                    const cleaned = text.replace(/[^0-9.]/g, '')
                    const parts = cleaned.split('.')
                    let formatted = parts[0] || ''
                    if (parts.length > 1) {
                      formatted += '.' + parts.slice(1).join('').substring(0, 2)
                    }
                    const value = formatted ? parseFloat(formatted) : 0
                    setFormData({ ...formData, pesoKg: value })
                  }}
                  keyboardType="decimal-pad"
                />
                <Text className="text-system-text text-xs mt-1">
                  Opcional - necessário apenas para cálculo de frete
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">
                  Dimensões (cm)
                </Text>
                <Text className="text-system-text text-xs mb-3">
                  Opcional - preencha apenas os campos relevantes para seu
                  produto
                </Text>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text className="text-system-text text-xs mb-1">
                      Altura
                    </Text>
                    <TextInput
                      className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="0.00"
                      value={
                        formData.alturaCm > 0
                          ? formData.alturaCm.toString()
                          : ''
                      }
                      onChangeText={(text) => {
                        // Permite números e ponto decimal, mas apenas um ponto
                        const cleaned = text.replace(/[^0-9.]/g, '')
                        const parts = cleaned.split('.')
                        let formatted = parts[0] || ''
                        if (parts.length > 1) {
                          formatted +=
                            '.' + parts.slice(1).join('').substring(0, 2)
                        }
                        const value = formatted ? parseFloat(formatted) : 0
                        setFormData({ ...formData, alturaCm: value })
                      }}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-system-text text-xs mb-1">
                      Largura
                    </Text>
                    <TextInput
                      className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="0.00"
                      value={
                        formData.larguraCm > 0
                          ? formData.larguraCm.toString()
                          : ''
                      }
                      onChangeText={(text) => {
                        // Permite números e ponto decimal, mas apenas um ponto
                        const cleaned = text.replace(/[^0-9.]/g, '')
                        const parts = cleaned.split('.')
                        let formatted = parts[0] || ''
                        if (parts.length > 1) {
                          formatted +=
                            '.' + parts.slice(1).join('').substring(0, 2)
                        }
                        const value = formatted ? parseFloat(formatted) : 0
                        setFormData({ ...formData, larguraCm: value })
                      }}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-system-text text-xs mb-1">
                      Profundidade
                    </Text>
                    <TextInput
                      className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="0.00"
                      value={
                        formData.profundidadeCm > 0
                          ? formData.profundidadeCm.toString()
                          : ''
                      }
                      onChangeText={(text) => {
                        // Permite números e ponto decimal, mas apenas um ponto
                        const cleaned = text.replace(/[^0-9.]/g, '')
                        const parts = cleaned.split('.')
                        let formatted = parts[0] || ''
                        if (parts.length > 1) {
                          formatted +=
                            '.' + parts.slice(1).join('').substring(0, 2)
                        }
                        const value = formatted ? parseFloat(formatted) : 0
                        setFormData({ ...formData, profundidadeCm: value })
                      }}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-frg900 font-medium mb-2">Tags</Text>
                <TextInput
                  className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                  placeholder="tag1, tag2, tag3"
                  value={formData.tags || ''}
                  onChangeText={(text) =>
                    setFormData({ ...formData, tags: text || undefined })
                  }
                />
                <Text className="text-system-text text-xs mt-1">
                  Separe as tags por vírgula
                </Text>
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

              <TouchableOpacity
                className="flex-row items-center mb-4"
                onPress={() =>
                  setFormData({ ...formData, destaque: !formData.destaque })
                }
              >
                <View
                  className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                    formData.destaque
                      ? 'bg-frgprimary border-frgprimary'
                      : 'border-gray-300'
                  }`}
                >
                  {formData.destaque && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text className="text-frg900">Produto em destaque</Text>
              </TouchableOpacity>
            </View>

            {/* Seção de Variações */}
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-frg900 font-bold text-lg mb-1">
                    Variações do Produto
                  </Text>
                  <Text className="text-system-text text-sm">
                    Adicione variações como cores, tamanhos, modelos, etc.
                  </Text>
                </View>
                {!showVariacaoForm && (
                  <TouchableOpacity
                    className="bg-frgprimary rounded-xl px-4 py-2"
                    onPress={() => setShowVariacaoForm(true)}
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Explicativo sobre variações */}
              <View className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                <View className="flex-row items-start mb-2">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#437C99"
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                  <View className="flex-1">
                    <Text className="text-frg900 font-semibold mb-1">
                      O que são variações?
                    </Text>
                    <Text className="text-system-text text-sm">
                      Variações permitem que você ofereça diferentes opções do
                      mesmo produto. Exemplos:
                    </Text>
                    <View className="mt-2">
                      <Text className="text-system-text text-sm">
                        • <Text className="font-semibold">Cores:</Text>{' '}
                        Vermelho, Azul, Preto
                      </Text>
                      <Text className="text-system-text text-sm">
                        • <Text className="font-semibold">Tamanhos:</Text> P, M,
                        G, GG
                      </Text>
                      <Text className="text-system-text text-sm">
                        • <Text className="font-semibold">Modelos:</Text>{' '}
                        Básico, Premium, Deluxe
                      </Text>
                    </View>
                    <Text className="text-system-text text-xs mt-2 italic">
                      Cada variação pode ter preço e estoque próprios.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Lista de variações adicionadas */}
              {variacoes.length > 0 && (
                <View className="mb-4">
                  {variacoes.map((variacao, index) => (
                    <View
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 mb-2 border border-gray-200"
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <Text className="text-frg900 font-semibold text-base mb-1">
                            {variacao.nome}
                          </Text>
                          {variacao.descricao && (
                            <Text className="text-system-text text-sm mb-2">
                              {variacao.descricao}
                            </Text>
                          )}
                          <View className="flex-row items-center gap-4">
                            <View>
                              <Text className="text-system-text text-xs">
                                Preço
                              </Text>
                              <Text className="text-frgprimary font-semibold">
                                {formatMoneyInput(
                                  (variacao.preco * 100).toString(),
                                )}
                              </Text>
                            </View>
                            <View>
                              <Text className="text-system-text text-xs">
                                Estoque
                              </Text>
                              <Text className="text-frg900 font-semibold">
                                {variacao.estoque}
                              </Text>
                            </View>
                            {variacao.sku && (
                              <View>
                                <Text className="text-system-text text-xs">
                                  SKU
                                </Text>
                                <Text className="text-frg900 font-semibold text-xs">
                                  {variacao.sku}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity
                          className="bg-red-50 rounded-full p-2 ml-2"
                          onPress={() => removeVariacao(index)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#EF4058"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Formulário de nova variação */}
              {showVariacaoForm && (
                <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-frg900 font-semibold">
                      Nova Variação
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowVariacaoForm(false)
                        setVariacaoForm({
                          nome: '',
                          descricao: '',
                          preco: 0,
                          precoPromocional: undefined,
                          estoque: 0,
                          sku: '',
                          ativa: true,
                        })
                        setVariacaoPrecoDisplay('')
                        setVariacaoPrecoPromocionalDisplay('')
                      }}
                    >
                      <Ionicons name="close" size={24} color="#9FABB9" />
                    </TouchableOpacity>
                  </View>

                  <View className="mb-3">
                    <Text className="text-frg900 font-medium mb-2 text-sm">
                      Nome da Variação * (ex: Cor Vermelha, Tamanho G)
                    </Text>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="Ex: Vermelho, G, Premium"
                      value={variacaoForm.nome}
                      onChangeText={(text) =>
                        setVariacaoForm({ ...variacaoForm, nome: text })
                      }
                    />
                  </View>

                  <View className="mb-3">
                    <Text className="text-frg900 font-medium mb-2 text-sm">
                      Descrição (opcional)
                    </Text>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="Descrição da variação"
                      value={variacaoForm.descricao || ''}
                      onChangeText={(text) =>
                        setVariacaoForm({
                          ...variacaoForm,
                          descricao: text || undefined,
                        })
                      }
                      multiline
                      numberOfLines={2}
                    />
                  </View>

                  <View className="mb-3">
                    <Text className="text-frg900 font-medium mb-2 text-sm">
                      Preço * (adicional ao preço base)
                    </Text>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="R$ 0,00"
                      value={variacaoPrecoDisplay}
                      onChangeText={(text) => {
                        const formatted = formatMoneyInput(text)
                        setVariacaoPrecoDisplay(formatted)
                        const value = parseMoneyInput(formatted)
                        setVariacaoForm({ ...variacaoForm, preco: value })
                      }}
                      keyboardType="numeric"
                    />
                  </View>

                  <View className="mb-3">
                    <Text className="text-frg900 font-medium mb-2 text-sm">
                      Preço Promocional (opcional)
                    </Text>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="R$ 0,00"
                      value={variacaoPrecoPromocionalDisplay}
                      onChangeText={(text) => {
                        const formatted = formatMoneyInput(text)
                        setVariacaoPrecoPromocionalDisplay(formatted)
                        const value = parseMoneyInput(formatted)
                        setVariacaoForm({
                          ...variacaoForm,
                          precoPromocional: value > 0 ? value : undefined,
                        })
                      }}
                      keyboardType="numeric"
                    />
                  </View>

                  <View className="mb-3">
                    <Text className="text-frg900 font-medium mb-2 text-sm">
                      Estoque *
                    </Text>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="0"
                      value={
                        variacaoForm.estoque > 0
                          ? variacaoForm.estoque.toString()
                          : ''
                      }
                      onChangeText={(text) => {
                        const value = parseInt(text.replace(/[^0-9]/g, '')) || 0
                        setVariacaoForm({ ...variacaoForm, estoque: value })
                      }}
                      keyboardType="numeric"
                    />
                  </View>

                  <View className="mb-3">
                    <Text className="text-frg900 font-medium mb-2 text-sm">
                      SKU (opcional)
                    </Text>
                    <TextInput
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                      placeholder="Código único da variação"
                      value={variacaoForm.sku || ''}
                      onChangeText={(text) =>
                        setVariacaoForm({
                          ...variacaoForm,
                          sku: text.toUpperCase() || undefined,
                        })
                      }
                    />
                  </View>

                  <TouchableOpacity
                    className="bg-frgprimary rounded-xl py-3 mt-2"
                    onPress={addVariacao}
                  >
                    <Text className="text-white text-center font-semibold">
                      Adicionar Variação
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {variacoes.length === 0 && !showVariacaoForm && (
                <View className="items-center py-4">
                  <Ionicons name="options-outline" size={32} color="#9FABB9" />
                  <Text className="text-system-text text-sm mt-2 text-center">
                    Nenhuma variação adicionada
                  </Text>
                  <Text className="text-system-text text-xs mt-1 text-center">
                    As variações são opcionais
                  </Text>
                </View>
              )}
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
