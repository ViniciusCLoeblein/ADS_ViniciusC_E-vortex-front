import { useState, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import PagerView from 'react-native-pager-view'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarPedidos, obterPedido, atualizarStatusPedido } from '@/services/customer'
import { PedidoRes } from '@/services/customer/interface'
import { useBackHandler } from '@/hooks/indext'
import { useCustomerStore } from '@/stores/customer'
import { listarImagensProduto } from '@/services/sales'

interface ProductImageProps {
  readonly produtoId: string
  readonly className?: string
  readonly resizeMode?: 'cover' | 'contain' | 'stretch' | 'center'
  readonly alt?: string
}

function ProductImage({
  produtoId,
  className = 'w-16 h-16 rounded-xl',
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
        <Ionicons name="image-outline" size={20} color="#9FABB9" />
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

export default function OrdersScreen() {
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null)
  const [showAvaliacao, setShowAvaliacao] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const pagerRef = useRef<PagerView>(null)
  const queryClient = useQueryClient()
  const { profile } = useCustomerStore()

  const isVendedor = profile?.tipo === 'vendedor'

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

  const atualizarStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      motivoCancelamento,
    }: {
      id: string
      status: string
      motivoCancelamento?: string
    }) =>
      atualizarStatusPedido(id, {
        status: status as any,
        motivoCancelamento,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['pedido', selectedPedidoId] })
      Alert.alert('Sucesso', 'Status do pedido atualizado com sucesso!')
      if (pedidoDetalhe?.status === 'enviado') {
        setShowAvaliacao(true)
      }
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível atualizar o status do pedido.')
    },
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
      case 'pago':
      case 'confirmado':
      case 'processando':
        return '#3B82F6'
      case 'enviado':
        return '#8B5CF6'
      case 'entregue':
      case 'recebido':
        return '#10B981'
      case 'cancelado':
        return '#EF4444'
      default:
        return '#6B7280'
    }
  }

  const handleMarcarComoRecebido = () => {
    if (!pedidoDetalhe) return

    Alert.alert(
      'Confirmar recebimento',
      'Você confirma que recebeu este pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            atualizarStatusMutation.mutate({
              id: pedidoDetalhe.id,
              status: 'entregue',
            })
          },
        },
      ],
    )
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
              {pedidoDetalhe.itens.map((item) => (
                <View
                  key={item.id}
                  className="flex-row mb-3 pb-3 border-b border-gray-100 last:border-0"
                >
                  <ProductImage
                    produtoId={item.produto_id}
                    className="w-16 h-16 rounded-xl mr-3"
                    resizeMode="cover"
                    alt={item.nome_produto || 'Produto'}
                  />
                  <View className="flex-1">
                    <Text className="text-frg900 font-semibold text-sm mb-1">
                      {item.nome_produto || 'Produto'}
                    </Text>
                    {item.variacao_descricao && (
                      <Text className="text-system-text text-xs mb-1">
                        {item.variacao_descricao}
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
              ))}
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

            {/* Informações de rastreamento */}
            {pedidoDetalhe.codigo_rastreamento && (
              <View className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <View className="flex-row items-start">
                  <Ionicons
                    name="cube-outline"
                    size={20}
                    color="#3B82F6"
                    style={{ marginRight: 12, marginTop: 2 }}
                  />
                  <View className="flex-1">
                    <Text className="text-frg900 font-semibold mb-1">
                      Rastreamento
                    </Text>
                    <Text className="text-system-text text-sm mb-1">
                      Código: {pedidoDetalhe.codigo_rastreamento}
                    </Text>
                    {pedidoDetalhe.transportadora && (
                      <Text className="text-system-text text-sm mb-1">
                        Transportadora: {pedidoDetalhe.transportadora}
                      </Text>
                    )}
                    {pedidoDetalhe.previsao_entrega && (
                      <Text className="text-system-text text-sm">
                        Previsão de entrega:{' '}
                        {new Date(
                          pedidoDetalhe.previsao_entrega,
                        ).toLocaleDateString('pt-BR')}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Botões de ação - Cliente */}
            {!isVendedor && pedidoDetalhe.status === 'enviado' && (
              <View className="mt-4">
                <TouchableOpacity
                  className="bg-green-500 rounded-xl py-4 mb-3"
                  onPress={handleMarcarComoRecebido}
                  disabled={atualizarStatusMutation.isPending}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text className="text-white text-center text-lg font-semibold ml-2">
                      {atualizarStatusMutation.isPending
                        ? 'Processando...'
                        : 'Recebi o Pedido'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Botões de ação - Vendedor */}
            {isVendedor &&
              (pedidoDetalhe.status === 'pago' ||
                pedidoDetalhe.status === 'processando') && (
                <View className="mt-4">
                  <TouchableOpacity
                    className="bg-purple-500 rounded-xl py-4 mb-3"
                    onPress={() => {
                      Alert.alert(
                        'Marcar como enviado',
                        'Deseja marcar este pedido como enviado?',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Confirmar',
                            onPress: () => {
                              atualizarStatusMutation.mutate({
                                id: pedidoDetalhe.id,
                                status: 'enviado',
                              })
                            },
                          },
                        ],
                      )
                    }}
                    disabled={atualizarStatusMutation.isPending}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="send" size={20} color="white" />
                      <Text className="text-white text-center text-lg font-semibold ml-2">
                        {atualizarStatusMutation.isPending
                          ? 'Processando...'
                          : 'Marcar como Enviado'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

            {isVendedor &&
              pedidoDetalhe.status !== 'cancelado' &&
              pedidoDetalhe.status !== 'entregue' && (
                <View className="mt-2">
                  <TouchableOpacity
                    className="bg-red-500 rounded-xl py-4"
                    onPress={() => setShowCancelModal(true)}
                    disabled={atualizarStatusMutation.isPending}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="close-circle" size={20} color="white" />
                      <Text className="text-white text-center text-lg font-semibold ml-2">
                        {atualizarStatusMutation.isPending
                          ? 'Processando...'
                          : 'Cancelar Pedido'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

            {/* Modal de cancelamento */}
            <Modal
              visible={showCancelModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowCancelModal(false)}
            >
              <View className="flex-1 bg-black/50 items-center justify-center px-6">
                <View className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <Text className="text-frg900 font-bold text-xl mb-4">
                    Cancelar Pedido
                  </Text>
                  <Text className="text-system-text text-sm mb-4">
                    Informe o motivo do cancelamento:
                  </Text>
                  <TextInput
                    className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                    placeholder="Ex: Produto fora de estoque"
                    value={motivoCancelamento}
                    onChangeText={setMotivoCancelamento}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 bg-gray-200 rounded-xl py-3"
                      onPress={() => {
                        setShowCancelModal(false)
                        setMotivoCancelamento('')
                      }}
                    >
                      <Text className="text-center font-semibold">Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-red-500 rounded-xl py-3"
                      onPress={() => {
                        if (motivoCancelamento.trim()) {
                          atualizarStatusMutation.mutate({
                            id: pedidoDetalhe.id,
                            status: 'cancelado',
                            motivoCancelamento: motivoCancelamento.trim(),
                          })
                          setShowCancelModal(false)
                          setMotivoCancelamento('')
                        } else {
                          Alert.alert(
                            'Erro',
                            'Por favor, informe o motivo do cancelamento.',
                          )
                        }
                      }}
                      disabled={atualizarStatusMutation.isPending}
                    >
                      <Text className="text-white text-center font-semibold">
                        {atualizarStatusMutation.isPending
                          ? 'Processando...'
                          : 'Confirmar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {!isVendedor &&
              pedidoDetalhe.status === 'entregue' &&
              !showAvaliacao && (
                <View className="mt-4">
                  <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-3">
                    <View className="flex-row items-start">
                      <Ionicons
                        name="star-outline"
                        size={24}
                        color="#3B82F6"
                        style={{ marginRight: 12, marginTop: 2 }}
                      />
                      <View className="flex-1">
                        <Text className="text-frg900 font-semibold mb-1">
                          Avalie seus produtos
                        </Text>
                        <Text className="text-system-text text-sm mb-3">
                          Sua opinião é muito importante para nós! Avalie os
                          produtos que você recebeu.
                        </Text>
                        <TouchableOpacity
                          className="bg-blue-500 rounded-lg py-2 px-4 self-start"
                          onPress={() => setShowAvaliacao(true)}
                        >
                          <Text className="text-white font-semibold text-sm">
                            Avaliar Produtos
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              )}

            {showAvaliacao && (
              <View className="mt-4">
                <View className="bg-white rounded-xl p-4 border border-gray-200">
                  <Text className="text-frg900 font-bold text-base mb-3">
                    Avaliar Produtos
                  </Text>
                  {pedidoDetalhe.itens.map((item) => (
                    <View
                      key={item.id}
                      className="mb-4 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <Text className="text-frg900 font-semibold text-sm mb-2">
                        {item.nome_produto}
                      </Text>
                      <View className="flex-row items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            className="mr-2"
                            onPress={() => {
                              // TODO: Implementar avaliação
                              Alert.alert(
                                'Avaliação',
                                `Avaliar ${item.nome_produto} com ${star} estrela(s)`,
                              )
                            }}
                          >
                            <Ionicons
                              name="star-outline"
                              size={24}
                              color="#FFD700"
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
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
