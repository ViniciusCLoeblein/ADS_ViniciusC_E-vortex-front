import { useState, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import PagerView from 'react-native-pager-view'
import { useQuery } from '@tanstack/react-query'
import { listarPedidos, obterPedido } from '@/services/customer'
import { PedidoRes } from '@/services/customer/interface'
import { useBackHandler } from '@/hooks/indext'

export default function OrdersScreen() {
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null)
  const pagerRef = useRef<PagerView>(null)

  const {
    data: pedidosData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['pedidos'],
    queryFn: listarPedidos,
  })

  const { data: pedidoDetalhe, isLoading: isLoadingDetalhe } = useQuery({
    queryKey: ['pedido', selectedPedidoId],
    queryFn: () => obterPedido(selectedPedidoId!),
    enabled: !!selectedPedidoId,
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return '#F59E0B'
      case 'confirmado':
      case 'processando':
        return '#3B82F6'
      case 'enviado':
        return '#8B5CF6'
      case 'entregue':
        return '#10B981'
      case 'cancelado':
        return '#EF4444'
      default:
        return '#6B7280'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  const handleViewPedido = (pedidoId: string) => {
    setSelectedPedidoId(pedidoId)
    if (pagerRef.current) {
      pagerRef.current.setPage(1)
    }
  }

  const handleBackToList = () => {
    setSelectedPedidoId(null)
    if (pagerRef.current) {
      pagerRef.current.setPage(0)
    }
  }

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    const page = e.nativeEvent.position
    if (page === 0) {
      setSelectedPedidoId(null)
    }
  }

  useBackHandler(() => {
    if (selectedPedidoId) {
      handleBackToList()
      return true
    }
    return false
  })

  const renderPedidoCard = (pedido: PedidoRes) => (
    <TouchableOpacity
      key={pedido.id}
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
      onPress={() => handleViewPedido(pedido.id)}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <Text className="text-frg900 font-bold text-base mb-1">
            Pedido #{pedido.id.slice(-8).toUpperCase()}
          </Text>
          <Text className="text-system-text text-sm">
            {formatDate(pedido.criado_em)}
          </Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${getStatusColor(pedido.status)}20` }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: getStatusColor(pedido.status) }}
          >
            {getStatusLabel(pedido.status)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <Text className="text-system-text text-sm">
          {pedido.metodo_pagamento.charAt(0).toUpperCase() +
            pedido.metodo_pagamento.slice(1)}
        </Text>
        <Text className="text-frgprimary font-bold text-lg">
          {formatPrice(pedido.total)}
        </Text>
      </View>
    </TouchableOpacity>
  )

  const renderPedidoDetalhe = () => {
    if (isLoadingDetalhe) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-system-text">Carregando...</Text>
        </View>
      )
    }

    if (!pedidoDetalhe) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#9FABB9" />
          <Text className="text-frg900 font-bold text-xl mt-4 mb-2">
            Pedido não encontrado
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4">
          <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-frg900 font-bold text-xl">
                Pedido #{pedidoDetalhe.id.slice(-8).toUpperCase()}
              </Text>
              <TouchableOpacity onPress={handleBackToList}>
                <Ionicons name="arrow-back" size={24} color="#9FABB9" />
              </TouchableOpacity>
            </View>

            <View className="mb-4 pb-4 border-b border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-system-text text-sm">Status:</Text>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${getStatusColor(pedidoDetalhe.status)}20`,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: getStatusColor(pedidoDetalhe.status) }}
                  >
                    {getStatusLabel(pedidoDetalhe.status)}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-system-text text-sm">Data:</Text>
                <Text className="text-frg900 font-medium text-sm">
                  {formatDate(pedidoDetalhe.criado_em)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-system-text text-sm">Pagamento:</Text>
                <Text className="text-frg900 font-medium text-sm">
                  {pedidoDetalhe.metodo_pagamento.charAt(0).toUpperCase() +
                    pedidoDetalhe.metodo_pagamento.slice(1)}
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-frg900 font-semibold text-base mb-3">
                Itens do Pedido
              </Text>
              {pedidoDetalhe.itens.map((item) => {
                const imagemPrincipal = item.nome_produto || 'Produto'

                return (
                  <View
                    key={item.id}
                    className="flex-row mb-3 pb-3 border-b border-gray-100 last:border-0"
                  >
                    {imagemPrincipal ? (
                      <Image
                        source={{ uri: imagemPrincipal }}
                        className="w-16 h-16 rounded-xl mr-3"
                        resizeMode="cover"
                        alt={item.nome_produto || 'Produto'}
                      />
                    ) : (
                      <View className="w-16 h-16 bg-gray-200 rounded-xl mr-3 items-center justify-center">
                        <Ionicons
                          name="image-outline"
                          size={24}
                          color="#9FABB9"
                        />
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-frg900 font-semibold text-sm mb-1">
                        {item.nome_produto || 'Produto'}
                      </Text>
                      {item.variacao_descricao && (
                        <Text className="text-system-text text-xs mb-1">
                          {item.variacao_descricao || 'Variacao'}
                        </Text>
                      )}
                      <Text className="text-system-text text-xs">
                        Qtd: {item.quantidade} x{' '}
                        {formatPrice(Number(item.preco_unitario))}
                      </Text>
                    </View>
                    <Text className="text-frgprimary font-bold text-sm">
                      {formatPrice(
                        Number(item.preco_unitario) * item.quantidade,
                      )}
                    </Text>
                  </View>
                )
              })}
            </View>

            <View className="pt-4 border-t border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-system-text text-sm">Subtotal:</Text>
                <Text className="text-frg900 font-medium text-sm">
                  {formatPrice(pedidoDetalhe.total - pedidoDetalhe.frete)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-system-text text-sm">Frete:</Text>
                <Text className="text-frg900 font-medium text-sm">
                  {formatPrice(pedidoDetalhe.frete)}
                </Text>
              </View>
              {pedidoDetalhe.desconto && pedidoDetalhe.desconto > 0 && (
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-system-text text-sm">Desconto:</Text>
                  <Text className="text-red-500 font-medium text-sm">
                    - {formatPrice(pedidoDetalhe.desconto)}
                  </Text>
                </View>
              )}
              <View className="flex-row items-center justify-between pt-2 border-t border-gray-200">
                <Text className="text-frg900 font-bold text-base">Total:</Text>
                <Text className="text-frgprimary font-bold text-lg">
                  {formatPrice(pedidoDetalhe.total)}
                </Text>
              </View>
            </View>
          </View>
          <View className="h-20" />
        </View>
      </ScrollView>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-white px-6 py-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#9FABB9" />
            </TouchableOpacity>
            <Text className="text-frg900 font-bold text-xl">Meus Pedidos</Text>
            <View className="w-6" />
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-system-text">Carregando pedidos...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#9FABB9" />
          </TouchableOpacity>
          <Text className="text-frg900 font-bold text-xl">Meus Pedidos</Text>
          <View className="w-6" />
        </View>
      </View>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        <View key="0" style={{ flex: 1 }}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} />
            }
          >
            <View className="px-6 pt-4">
              {pedidosData && pedidosData.pedidos.length > 0 ? (
                <>
                  <Text className="text-frg900 font-bold text-lg mb-4">
                    {pedidosData.total} Pedido
                    {pedidosData.total !== 1 ? 's' : ''}
                  </Text>
                  {pedidosData.pedidos.map(renderPedidoCard)}
                </>
              ) : (
                <View className="items-center justify-center py-12">
                  <Ionicons name="receipt-outline" size={64} color="#9FABB9" />
                  <Text className="text-frg900 font-bold text-xl mt-4 mb-2">
                    Nenhum pedido encontrado
                  </Text>
                  <Text className="text-system-text text-center">
                    Você ainda não realizou nenhum pedido
                  </Text>
                </View>
              )}

              <View className="h-20" />
            </View>
          </ScrollView>
        </View>

        <View key="1" style={{ flex: 1 }}>
          {renderPedidoDetalhe()}
        </View>
      </PagerView>
    </SafeAreaView>
  )
}
