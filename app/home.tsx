import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  RefreshControl,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import PagerView from 'react-native-pager-view'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth'
import { useCustomerStore } from '@/stores/customer'
import { getCustomerProfile } from '@/services/customer'
import {
  obterCarrinho,
  listarProdutos,
  listarCategorias,
  adicionarItemCarrinho,
  adicionarFavorito,
  removerFavorito,
  listarFavoritos,
  obterProduto,
} from '@/services/sales'
import type { ProdutoRes } from '@/services/sales/interface'

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  )
  const [quantidade, setQuantidade] = useState(1)
  const pagerRef = useRef<PagerView>(null)
  const queryClient = useQueryClient()
  const { setProfile, profile } = useCustomerStore()

  const isVendedor = profile?.tipo === 'vendedor'

  const { data: carrinho } = useQuery({
    queryKey: ['carrinho'],
    queryFn: obterCarrinho,
    enabled: !isVendedor,
  })

  const { data: customerProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: getCustomerProfile,
    enabled: !!useAuthStore.getState().accessToken && !isVendedor,
    retry: 1,
  })

  const {
    data: produtosData,
    isLoading: isLoadingProdutos,
    refetch: refetchProdutos,
  } = useQuery({
    queryKey: ['produtos', 'home', selectedCategory, searchText],
    queryFn: () =>
      listarProdutos({
        busca: searchText || undefined,
        categoriaId: selectedCategory,
        apenasAtivos: true,
        pagina: 1,
        limite: 20,
      }),
    enabled: !isVendedor,
  })

  const { data: categoriasData } = useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
    enabled: !isVendedor,
  })

  const { data: favoritosData } = useQuery({
    queryKey: ['favoritos'],
    queryFn: listarFavoritos,
    enabled: !isVendedor,
  })

  const { data: produtoDetalhe, isLoading: isLoadingDetalhe } = useQuery({
    queryKey: ['produto', selectedProductId],
    queryFn: () => obterProduto(selectedProductId!),
    enabled: !!selectedProductId && !isVendedor,
  })

  const favoritosIds = new Set(
    favoritosData?.favoritos.map((f) => f.produtoId) || [],
  )

  const addToCartMutation = useMutation({
    mutationFn: adicionarItemCarrinho,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrinho'] })
      Alert.alert('Sucesso', 'Produto adicionado ao carrinho!')
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível adicionar ao carrinho.')
    },
  })

  const addFavoriteMutation = useMutation({
    mutationFn: adicionarFavorito,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] })
    },
  })

  const removeFavoriteMutation = useMutation({
    mutationFn: removerFavorito,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] })
    },
  })

  useEffect(() => {
    if (customerProfile) {
      setProfile(customerProfile)
    }
  }, [customerProfile, setProfile])

  const getWelcomeMessage = () => {
    if (isLoadingProfile && !isVendedor) return 'Carregando...'
    if (profile) return `Bem-vindo, ${profile.nome}!`
    return 'Bem-vindo de volta!'
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const handleToggleFavorite = (produtoId: string) => {
    if (favoritosIds.has(produtoId)) {
      removeFavoriteMutation.mutate(produtoId)
    } else {
      addFavoriteMutation.mutate(produtoId)
    }
  }

  const handleAddToCart = (produto: ProdutoRes, qtd?: number) => {
    addToCartMutation.mutate({
      produtoId: produto.id,
      quantidade: qtd || 1,
    })
  }

  const handleViewProduct = (produtoId: string) => {
    setSelectedProductId(produtoId)
    setQuantidade(1)
    if (pagerRef.current) {
      pagerRef.current.setPage(1)
    }
  }

  const handleBackToList = () => {
    setSelectedProductId(null)
    if (pagerRef.current) {
      pagerRef.current.setPage(0)
    }
  }

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    const page = e.nativeEvent.position
    if (page === 0) {
      setSelectedProductId(null)
    }
  }

  const renderProduct = ({ item }: { item: ProdutoRes }) => {
    const isFavorite = favoritosIds.has(item.id)
    const precoFinal = item.precoPromocional || item.preco
    const temDesconto = !!item.precoPromocional

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mr-4 w-48"
        onPress={() => handleViewProduct(item.id)}
      >
        <View className="relative">
          <Image
            source={{
              uri: item.imagemPrincipal || 'https://via.placeholder.com/200',
            }}
            className="w-full h-32 rounded-xl mb-3"
            resizeMode="cover"
            alt={item.nome}
          />
          {temDesconto && (
            <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-lg">
              <Text className="text-white text-xs font-bold">
                -{Math.round(((item.preco - precoFinal) / item.preco) * 100)}%
              </Text>
            </View>
          )}
          <TouchableOpacity
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm"
            onPress={() => handleToggleFavorite(item.id)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={16}
              color="#EF4058"
            />
          </TouchableOpacity>
        </View>

        <Text
          className="text-frg900 font-semibold text-sm mb-1"
          numberOfLines={2}
        >
          {item.nome}
        </Text>

        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-frgprimary font-bold text-base">
              {formatPrice(precoFinal)}
            </Text>
            {temDesconto && (
              <Text className="text-system-text text-xs line-through">
                {formatPrice(item.preco)}
              </Text>
            )}
          </View>
          <TouchableOpacity
            className="bg-frgprimary rounded-lg p-2"
            onPress={() => handleAddToCart(item)}
            disabled={addToCartMutation.isPending}
          >
            <Ionicons name="add" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const renderCategory = ({
    item,
  }: {
    item: { id: string; nome: string; imagem?: string }
  }) => (
    <TouchableOpacity
      className={`items-center p-4 rounded-xl mr-3 ${
        selectedCategory === item.id ? 'bg-frgprimary' : 'bg-gray-100'
      }`}
      onPress={() =>
        setSelectedCategory(selectedCategory === item.id ? undefined : item.id)
      }
    >
      {item.imagem ? (
        <Image
          source={{ uri: item.imagem }}
          className="w-12 h-12 rounded-lg mb-2"
          alt={item.nome}
        />
      ) : (
        <Ionicons
          name="grid-outline"
          size={24}
          color={selectedCategory === item.id ? 'white' : '#9FABB9'}
        />
      )}
      <Text
        className={`text-xs mt-2 font-medium ${
          selectedCategory === item.id ? 'text-white' : 'text-system-text'
        }`}
      >
        {item.nome}
      </Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-frg900 font-bold text-xl">E-Vortex</Text>
            <Text className="text-system-text">{getWelcomeMessage()}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            {isVendedor ? (
              <>
                <TouchableOpacity
                  className="bg-gray-100 rounded-full p-2"
                  onPress={() => router.push('/seller/products')}
                >
                  <Ionicons name="cube-outline" size={20} color="#9FABB9" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-100 rounded-full p-2"
                  onPress={() => router.push('/seller/categories')}
                >
                  <Ionicons name="grid-outline" size={20} color="#9FABB9" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  className="bg-gray-100 rounded-full p-2"
                  onPress={() => router.push('/mannequin')}
                >
                  <Ionicons name="shirt-outline" size={20} color="#9FABB9" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-100 rounded-full p-2 relative"
                  onPress={() => router.push('/cart')}
                >
                  <Ionicons name="cart-outline" size={20} color="#9FABB9" />
                  {carrinho && carrinho.quantidadeItens > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                      <Text className="text-white text-xs font-bold">
                        {carrinho.quantidadeItens > 99
                          ? '99+'
                          : carrinho.quantidadeItens}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-100 rounded-full p-2"
                  onPress={() => router.push('/favorites')}
                >
                  <Ionicons name="heart-outline" size={20} color="#9FABB9" />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              className="bg-gray-100 rounded-full p-2"
              onPress={() => router.push('/profile')}
            >
              <Ionicons
                name="person-circle-outline"
                size={20}
                color="#9FABB9"
              />
            </TouchableOpacity>
          </View>
        </View>

        {!isVendedor && (
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search-outline" size={20} color="#9FABB9" />
            <TextInput
              className="flex-1 ml-3 text-base"
              placeholder="Buscar produtos..."
              placeholderTextColor="#9FABB9"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        )}
      </View>

      {isVendedor ? (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-6">
            <TouchableOpacity
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4"
              onPress={() => router.push('/seller/products')}
            >
              <View className="flex-row items-center">
                <View className="bg-frgprimary/10 rounded-full p-4 mr-4">
                  <Ionicons name="cube-outline" size={32} color="#437C99" />
                </View>
                <View className="flex-1">
                  <Text className="text-frg900 font-bold text-lg mb-1">
                    Meus Produtos
                  </Text>
                  <Text className="text-system-text">
                    Gerencie seus produtos cadastrados
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9FABB9" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4"
              onPress={() => router.push('/seller/categories')}
            >
              <View className="flex-row items-center">
                <View className="bg-frgprimary/10 rounded-full p-4 mr-4">
                  <Ionicons name="grid-outline" size={32} color="#437C99" />
                </View>
                <View className="flex-1">
                  <Text className="text-frg900 font-bold text-lg mb-1">
                    Categorias
                  </Text>
                  <Text className="text-system-text">
                    Gerencie as categorias de produtos
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9FABB9" />
              </View>
            </TouchableOpacity>
          </View>
          <View className="h-20" />
        </ScrollView>
      ) : (
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          {/* Página 0: Home com produtos */}
          <View key="0" style={{ flex: 1 }}>
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isLoadingProdutos}
                  onRefresh={refetchProdutos}
                />
              }
            >
              {categoriasData && (
                <View className="px-6 mb-6 mt-4">
                  <Text className="text-frg900 font-bold text-lg mb-4">
                    Categorias
                  </Text>
                  <FlatList
                    data={categoriasData.categorias}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              )}

              <View className="px-6 mb-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-frg900 font-bold text-lg">
                    {produtosData?.total || 0} Produtos
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/products')}>
                    <Text className="text-frgprimary font-medium">
                      Ver todos
                    </Text>
                  </TouchableOpacity>
                </View>
                {(() => {
                  if (isLoadingProdutos) {
                    return (
                      <View className="items-center py-8">
                        <Text className="text-system-text">
                          Carregando produtos...
                        </Text>
                      </View>
                    )
                  }
                  if (
                    produtosData?.produtos &&
                    produtosData.produtos.length > 0
                  ) {
                    return (
                      <FlatList
                        data={produtosData.produtos}
                        renderItem={renderProduct}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      />
                    )
                  }
                  return (
                    <View className="items-center py-8">
                      <Ionicons name="cube-outline" size={64} color="#9FABB9" />
                      <Text className="text-system-text mt-4">
                        Nenhum produto encontrado
                      </Text>
                    </View>
                  )
                })()}
              </View>

              <View className="h-20" />
            </ScrollView>
          </View>

          {/* Página 1: Detalhes do produto */}
          <View key="1" style={{ flex: 1 }}>
            {(() => {
              if (isLoadingDetalhe) {
                return (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-system-text">Carregando...</Text>
                  </View>
                )
              }
              if (!produtoDetalhe) {
                return (
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
                )
              }
              return (
                <ScrollView
                  className="flex-1"
                  showsVerticalScrollIndicator={false}
                >
                  <View className="bg-white mb-4">
                    <Image
                      source={{
                        uri:
                          produtoDetalhe.imagemPrincipal ||
                          'https://via.placeholder.com/400',
                      }}
                      className="w-full h-80"
                      resizeMode="cover"
                      alt={produtoDetalhe.nome}
                    />
                  </View>

                  <View className="px-6 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                      <Text className="text-frg900 font-bold text-2xl flex-1">
                        {produtoDetalhe.nome}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          produtoDetalhe &&
                          handleToggleFavorite(produtoDetalhe.id)
                        }
                      >
                        <Ionicons
                          name={
                            favoritosIds.has(produtoDetalhe.id)
                              ? 'heart'
                              : 'heart-outline'
                          }
                          size={24}
                          color="#EF4058"
                        />
                      </TouchableOpacity>
                    </View>

                    {produtoDetalhe.descricao && (
                      <Text className="text-system-text text-base mb-4">
                        {produtoDetalhe.descricao}
                      </Text>
                    )}

                    <View className="flex-row items-center mb-4">
                      <View className="flex-1">
                        <Text className="text-frgprimary font-bold text-3xl">
                          {formatPrice(
                            produtoDetalhe.precoPromocional ||
                              produtoDetalhe.preco,
                          )}
                        </Text>
                        {produtoDetalhe.precoPromocional && (
                          <Text className="text-system-text text-lg line-through">
                            {formatPrice(produtoDetalhe.preco)}
                          </Text>
                        )}
                      </View>
                      {produtoDetalhe.categoria && (
                        <View className="bg-frgprimary/10 rounded-full px-4 py-2">
                          <Text className="text-frgprimary font-medium">
                            {produtoDetalhe.categoria.nome}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="bg-gray-100 rounded-xl p-4 mb-4">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-frg900 font-semibold">
                          Quantidade
                        </Text>
                        <View className="flex-row items-center">
                          <TouchableOpacity
                            className="bg-gray-200 rounded-full w-8 h-8 items-center justify-center"
                            onPress={() =>
                              setQuantidade(Math.max(1, quantidade - 1))
                            }
                          >
                            <Ionicons name="remove" size={16} color="#9FABB9" />
                          </TouchableOpacity>
                          <Text className="mx-4 text-frg900 font-semibold text-lg">
                            {quantidade}
                          </Text>
                          <TouchableOpacity
                            className="bg-frgprimary rounded-full w-8 h-8 items-center justify-center"
                            onPress={() => setQuantidade(quantidade + 1)}
                          >
                            <Ionicons name="add" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text className="text-system-text text-sm">
                        Estoque: {produtoDetalhe.estoque} unidades
                      </Text>
                    </View>

                    {produtoDetalhe.variacoes &&
                      produtoDetalhe.variacoes.length > 0 && (
                        <View className="mb-4">
                          <Text className="text-frg900 font-semibold mb-2">
                            Variações
                          </Text>
                          {produtoDetalhe.variacoes.map((variacao) => (
                            <View
                              key={variacao.id}
                              className="bg-white rounded-xl p-3 mb-2 border border-gray-200"
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

                    <TouchableOpacity
                      className="bg-frgprimary rounded-xl py-4 mb-4"
                      onPress={() =>
                        handleAddToCart(produtoDetalhe, quantidade)
                      }
                      disabled={
                        addToCartMutation.isPending ||
                        produtoDetalhe.estoque === 0
                      }
                    >
                      <Text className="text-white text-center text-lg font-semibold">
                        {(() => {
                          if (addToCartMutation.isPending)
                            return 'Adicionando...'
                          if (produtoDetalhe.estoque === 0) return 'Sem estoque'
                          return 'Adicionar ao Carrinho'
                        })()}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="h-20" />
                </ScrollView>
              )
            })()}
          </View>
        </PagerView>
      )}
    </SafeAreaView>
  )
}
