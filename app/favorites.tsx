import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarFavoritos, removerFavorito } from '@/services/sales'

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
      Alert.alert('Sucesso', 'Produto removido dos favoritos!')
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível remover dos favoritos.')
    },
  })

  const handleRemoveFavorite = (produtoId: string) => {
    Alert.alert(
      'Remover favorito',
      'Deseja remover este produto dos favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeFavoriteMutation.mutate(produtoId),
        },
      ],
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#9FABB9" />
          </TouchableOpacity>
          <Text className="text-frg900 font-bold text-xl">Favoritos</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {isLoading ? (
          <View className="items-center py-8">
            <Text className="text-system-text">Carregando favoritos...</Text>
          </View>
        ) : data?.favoritos && data.favoritos.length > 0 ? (
          <View className="px-6 pt-6">
            {data.favoritos.map((favorito) => (
              <TouchableOpacity
                key={favorito.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4"
                onPress={() => router.push('/products')}
              >
                <View className="flex-row">
                  <Image
                    source={{
                      uri:
                        favorito.produto.imagemPrincipal ||
                        'https://via.placeholder.com/100',
                    }}
                    className="w-20 h-20 rounded-xl mr-4"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text
                      className="text-frg900 font-semibold text-base mb-1"
                      numberOfLines={2}
                    >
                      {favorito.produto.nome}
                    </Text>
                    <Text className="text-frgprimary font-bold text-lg mb-2">
                      {formatPrice(
                        favorito.produto.precoPromocional ||
                          favorito.produto.preco,
                      )}
                    </Text>
                    <TouchableOpacity
                      className="self-start"
                      onPress={() => handleRemoveFavorite(favorito.produtoId)}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="heart" size={16} color="#EF4058" />
                        <Text className="text-red-500 text-sm ml-1">
                          Remover
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
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
              <Text className="text-white font-semibold">
                Explorar Produtos
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  )
}

