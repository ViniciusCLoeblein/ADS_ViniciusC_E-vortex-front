import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarFavoritos,
  removerFavorito,
  listarImagensProduto,
  removerTodosFavoritos,
} from '@/services/sales'

interface ProductImageProps {
  readonly produtoId: string
  readonly className?: string
  readonly resizeMode?: 'cover' | 'contain' | 'stretch' | 'center'
  readonly alt?: string
}

function ProductImage({
  produtoId,
  className = 'w-20 h-20 rounded-xl',
  resizeMode = 'cover',
  alt = 'Produto',
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)

  const { data: imagensData, isLoading } = useQuery({
    queryKey: ['imagens-produto', produtoId],
    queryFn: () => listarImagensProduto(produtoId),
    enabled: !!produtoId,
  })

  const imagemPrincipal =
    imagensData?.imagens?.find((img) => img?.tipo === 'principal')?.url ||
    imagensData?.imagens?.[0]?.url

  const handleError = () => {
    setImageError(true)
  }

  if (isLoading) {
    return (
      <View className={`${className} bg-gray-100 items-center justify-center`}>
        <ActivityIndicator size="small" color="#437C99" />
      </View>
    )
  }

  if (imageError || !imagemPrincipal) {
    return (
      <View className={`${className} bg-gray-100 items-center justify-center`}>
        <Ionicons name="image-outline" size={24} color="#9FABB9" />
      </View>
    )
  }

  return (
    <Image
      source={{ uri: imagemPrincipal }}
      className={className}
      resizeMode={resizeMode}
      alt={alt}
      onError={handleError}
    />
  )
}

export default function FavoritesScreen() {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['favoritos'],
    queryFn: listarFavoritos,
  })

  const removeFavoriteMutation = useMutation({
    mutationFn: removerFavorito,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] })
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível remover dos favoritos.')
    },
  })

  const removeAllFavoritesMutation = useMutation({
    mutationFn: removerTodosFavoritos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] })
      Alert.alert('Sucesso', 'Todos os favoritos foram removidos!')
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível remover todos os favoritos.')
    },
  })

  const handleRemoveFavorite = (
    produtoId: string,
    event?: { stopPropagation: () => void },
  ) => {
    if (event) {
      event.stopPropagation()
    }
    Alert.alert(
      'Remover favorito',
      'Deseja remover este produto dos favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            removeFavoriteMutation.mutate(produtoId, {
              onSuccess: () => {
                Alert.alert('Sucesso', 'Produto removido dos favoritos!')
              },
            })
          },
        },
      ],
    )
  }

  const handleClearAllFavorites = () => {
    if (!data?.favoritos || data.favoritos.length === 0) return

    Alert.alert(
      'Limpar todos os favoritos',
      `Deseja remover todos os ${data.favoritos.length} produtos dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar tudo',
          style: 'destructive',
          onPress: () => {
            removeAllFavoritesMutation.mutate()
          },
        },
      ],
    )
  }

  const formatPrice = (price: number | string) => {
    const value =
      typeof price === 'string' ? Number(price.replace(',', '.')) : price
    const safe = Number.isFinite(value) ? value : 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(safe)
  }

  const renderFavoritesContent = () => {
    if (isLoading) {
      return (
        <View className="items-center py-8">
          <Text className="text-system-text">Carregando favoritos...</Text>
        </View>
      )
    }

    if (data?.favoritos && data.favoritos.length > 0) {
      return (
        <View className="px-6 pt-6">
          {data.favoritos.map((favorito) => {
            const preco = Number(favorito.produto.preco)
            const promo = Number(favorito.produto.precoPromocional)
            const temDesconto =
              Number.isFinite(preco) &&
              Number.isFinite(promo) &&
              promo > 0 &&
              promo < preco
            const precoFinal = temDesconto ? promo : preco
            const avaliacaoMedia = Number(favorito.produto.avaliacaoMedia || 0)

            return (
              <TouchableOpacity
                key={favorito.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden"
                onPress={() => {
                  router.push(`/home?id=${favorito.produto.id}`)
                }}
                activeOpacity={0.7}
              >
                <View className="flex-row">
                  <View className="relative">
                    <ProductImage
                      produtoId={favorito.produto.id}
                      className="w-32 h-32"
                      resizeMode="cover"
                      alt={favorito.produto.nome}
                    />
                    {temDesconto && (
                      <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-lg">
                        <Text className="text-white text-xs font-bold">
                          -
                          {Number.isFinite(preco) && preco > 0
                            ? Math.round(((preco - precoFinal) / preco) * 100)
                            : 0}
                          %
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-1 p-4">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1 mr-2">
                        <Text
                          className="text-frg900 font-bold text-base mb-1"
                          numberOfLines={2}
                        >
                          {favorito.produto.nome}
                        </Text>
                        {!!favorito.produto.descricaoCurta && (
                          <Text
                            className="text-system-text text-xs mb-2"
                            numberOfLines={2}
                          >
                            {favorito.produto.descricaoCurta}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={(e) =>
                          handleRemoveFavorite(favorito.produtoId, e)
                        }
                        className="bg-red-50 rounded-full p-2"
                      >
                        <Ionicons name="heart" size={18} color="#EF4058" />
                      </TouchableOpacity>
                    </View>

                    <View className="mb-2">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-frgprimary font-bold text-lg">
                          {formatPrice(precoFinal)}
                        </Text>
                        {temDesconto && (
                          <Text className="text-system-text text-xs line-through ml-2">
                            {formatPrice(favorito.produto.preco)}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between">
                      {avaliacaoMedia > 0 && (
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text className="text-frg900 font-semibold text-xs ml-1">
                            {avaliacaoMedia.toFixed(1)}
                          </Text>
                          {favorito.produto.totalAvaliacoes > 0 && (
                            <Text className="text-system-text text-xs ml-1">
                              ({favorito.produto.totalAvaliacoes})
                            </Text>
                          )}
                        </View>
                      )}
                      <View className="flex-row items-center">
                        <Ionicons
                          name="cube-outline"
                          size={14}
                          color="#9FABB9"
                        />
                        <Text className="text-system-text text-xs ml-1">
                          Estoque: {favorito.produto.estoque}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      )
    }

    return (
      <View className="flex-1 items-center justify-center px-6 py-12">
        <Ionicons name="heart-outline" size={64} color="#9FABB9" />
        <Text className="text-frg900 font-bold text-xl mt-4 mb-2">
          Nenhum favorito
        </Text>
        <Text className="text-system-text text-center mb-6">
          Adicione produtos aos favoritos para encontrá-los facilmente
        </Text>
        <TouchableOpacity
          className="bg-frgprimary rounded-xl py-3 px-6"
          onPress={() => router.push('/products')}
        >
          <Text className="text-white font-semibold">Explorar Produtos</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#9FABB9" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-frg900 font-bold text-xl">Favoritos</Text>
            {data?.favoritos && data.favoritos.length > 0 && (
              <Text className="text-system-text text-xs mt-1">
                {data.favoritos.length}{' '}
                {data.favoritos.length === 1 ? 'produto' : 'produtos'}
              </Text>
            )}
          </View>
          {data?.favoritos && data.favoritos.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAllFavorites}
              className="bg-red-50 rounded-full px-3 py-1.5"
            >
              <Ionicons name="trash-outline" size={18} color="#EF4058" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {renderFavoritesContent()}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  )
}
