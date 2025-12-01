import { useState, useRef, useEffect, useMemo } from 'react'
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
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  listarPedidos,
  obterPedido,
  atualizarStatusPedido,
} from '@/services/customer'
import { PedidoRes } from '@/services/customer/interface'
import { useBackHandler } from '@/hooks/indext'
import { useCustomerStore } from '@/stores/customer'
import { useAuthStore } from '@/stores/auth'
import {
  listarImagensProduto,
  criarAvaliacao,
  listarAvaliacoesProduto,
} from '@/services/sales'

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
  const [showEnviadoModal, setShowEnviadoModal] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const [codigoRastreamento, setCodigoRastreamento] = useState('')
  const [transportadora, setTransportadora] = useState('')
  const [previsaoEntrega, setPrevisaoEntrega] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [avaliacoes, setAvaliacoes] = useState<
    Record<string, { nota: number; comentario?: string }>
  >({})
  const [comentariosAvaliacao, setComentariosAvaliacao] = useState<
    Record<string, string>
  >({})
  const [notasSelecionadas, setNotasSelecionadas] = useState<
    Record<string, number>
  >({})
  const pagerRef = useRef<PagerView>(null)
  const isMountedRef = useRef(true)
  const queryClient = useQueryClient()
  const { profile } = useCustomerStore()
  const { userId } = useAuthStore()

  const isVendedor = profile?.tipo === 'vendedor'

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const {
    data: pedidosData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['pedidos', userId],
    queryFn: listarPedidos,
    enabled: !!userId,
    gcTime: 0,
    staleTime: 0,
  })

  const {
    data: pedidoDetalhe,
    isLoading: isLoadingDetalhe,
    refetch: refetchPedidoDetalhe,
  } = useQuery({
    queryKey: ['pedido', userId, selectedPedidoId],
    queryFn: () => obterPedido(selectedPedidoId!),
    enabled: !!selectedPedidoId && !!userId,
    gcTime: 0,
    staleTime: 0,
  })

  const avaliacoesQueries = useQueries({
    queries:
      showAvaliacao && pedidoDetalhe?.itens && userId
        ? pedidoDetalhe.itens.map((item) => ({
            queryKey: [
              'avaliacoes-produto',
              userId,
              item.produto_id,
              selectedPedidoId,
            ],
            queryFn: () => listarAvaliacoesProduto(item.produto_id),
            enabled: !!userId && !!item.produto_id && !!showAvaliacao,
          }))
        : [],
  })

  const avaliacoesDataString = avaliacoesQueries
    .map((q) => (q.data ? JSON.stringify(q.data) : ''))
    .join('|')

  const avaliacoesProcessadas = useMemo(() => {
    if (
      !showAvaliacao ||
      !pedidoDetalhe?.itens ||
      !userId ||
      avaliacoesQueries.length === 0
    ) {
      return null
    }

    const avaliacoesEncontradas: Record<
      string,
      { nota: number; comentario?: string }
    > = {}
    const comentariosEncontrados: Record<string, string> = {}

    avaliacoesQueries.forEach((query, index) => {
      if (query.data && pedidoDetalhe.itens[index]) {
        const item = pedidoDetalhe.itens[index]
        const avaliacaoUsuario = query.data.avaliacoes.find(
          (av) => av.usuarioId === userId,
        )

        if (avaliacaoUsuario) {
          avaliacoesEncontradas[item.produto_id] = {
            nota: avaliacaoUsuario.nota,
            comentario: avaliacaoUsuario.comentario || undefined,
          }
          if (avaliacaoUsuario.comentario) {
            comentariosEncontrados[item.produto_id] =
              avaliacaoUsuario.comentario
          }
        }
      }
    })

    return { avaliacoesEncontradas, comentariosEncontrados }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAvaliacao, pedidoDetalhe?.itens, userId, avaliacoesDataString])

  useEffect(() => {
    if (avaliacoesProcessadas && isMountedRef.current) {
      setAvaliacoes(avaliacoesProcessadas.avaliacoesEncontradas)
      setComentariosAvaliacao(avaliacoesProcessadas.comentariosEncontrados)
    }
  }, [avaliacoesProcessadas])

  const criarAvaliacaoMutation = useMutation({
    mutationFn: ({
      pedidoId,
      produtoId,
      nota,
      comentario,
    }: {
      pedidoId: string
      produtoId: string
      nota: number
      comentario?: string
    }) =>
      criarAvaliacao({
        pedidoId,
        produtoId,
        nota,
        comentario: comentario || undefined,
      }),
    onMutate: async (variables) => {
      // Atualizar estado local imediatamente (otimistic update)
      if (!isMountedRef.current) return
      setAvaliacoes((prev) => ({
        ...prev,
        [variables.produtoId]: {
          nota: variables.nota,
          comentario: variables.comentario,
        },
      }))
      setNotasSelecionadas((prev) => {
        const newState = { ...prev }
        delete newState[variables.produtoId]
        return newState
      })
      setComentariosAvaliacao((prev) => {
        const newState = { ...prev }
        delete newState[variables.produtoId]
        return newState
      })
    },
    onSuccess: () => {
      if (!isMountedRef.current) return
      queryClient.invalidateQueries({ queryKey: ['produto'] })
    },
    onError: (error, variables) => {
      if (!isMountedRef.current) return
      setAvaliacoes((prev) => {
        const newState = { ...prev }
        delete newState[variables.produtoId]
        return newState
      })
      // Restaurar comentário
      if (variables.comentario) {
        setComentariosAvaliacao((prev) => ({
          ...prev,
          [variables.produtoId]: variables.comentario || '',
        }))
      }
      console.error('Erro ao criar avaliação:', error)
      Alert.alert('Erro', 'Não foi possível registrar a avaliação.')
    },
  })

  const atualizarStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      motivoCancelamento,
      codigoRastreamento,
      transportadora,
      previsaoEntrega,
    }: {
      id: string
      status: string
      motivoCancelamento?: string
      codigoRastreamento?: string
      transportadora?: string
      previsaoEntrega?: string
    }) =>
      atualizarStatusPedido(id, {
        status: status as
          | 'pendente'
          | 'pago'
          | 'processando'
          | 'enviado'
          | 'entregue'
          | 'cancelado',
        motivoCancelamento,
        codigoRastreamento,
        transportadora,
        previsaoEntrega,
      }),
    onSuccess: async (data, variables) => {
      if (!isMountedRef.current) return

      setShowEnviadoModal(false)
      setShowCancelModal(false)
      setCodigoRastreamento('')
      setTransportadora('')
      setPrevisaoEntrega('')
      setSelectedDate(null)
      setMotivoCancelamento('')

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pedidos', userId] }),
        queryClient.invalidateQueries({
          queryKey: ['pedido', userId, selectedPedidoId],
        }),
      ])

      // Refetch manual para garantir atualização imediata
      if (selectedPedidoId) {
        refetchPedidoDetalhe()
      }
      refetch()

      Alert.alert('Sucesso', 'Status do pedido atualizado com sucesso!')

      // Se o status atualizado foi 'enviado' e não é vendedor, mostrar avaliação
      if (
        variables.status === 'enviado' &&
        !isVendedor &&
        isMountedRef.current
      ) {
        setTimeout(() => {
          if (isMountedRef.current) {
            setShowAvaliacao(true)
          }
        }, 500)
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

  const formatDateForInput = (date: Date) => {
    // Usa métodos locais para evitar problemas de timezone
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Função para formatar data para exibição sem problemas de timezone
  const formatDateForDisplay = (dateString: string) => {
    // Parse a string YYYY-MM-DD como data local (não UTC)
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getNextDays = () => {
    const days = []
    // Cria data local sem problemas de timezone
    const today = new Date()
    const todayLocal = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    )
    for (let i = 0; i < 30; i++) {
      const date = new Date(
        todayLocal.getFullYear(),
        todayLocal.getMonth(),
        todayLocal.getDate() + i,
      )
      days.push(date)
    }
    return days
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
    setPrevisaoEntrega(formatDateForInput(date))
    setShowDatePicker(false)
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
              <TouchableOpacity onPress={handleBackToList}>
                <Ionicons name="arrow-back" size={24} color="#9FABB9" />
              </TouchableOpacity>
              <Text className="text-frg900 font-bold text-xl">
                Pedido #{pedidoDetalhe.id.slice(-8).toUpperCase()}
              </Text>
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
                      {item?.nome_produto || 'Produto'}
                    </Text>
                    {!!item?.variacao_descricao && (
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
                    {formatPrice(Number(item.preco_unitario) * item.quantidade)}
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
              {pedidoDetalhe?.desconto > 0 && (
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

            {!isVendedor && pedidoDetalhe.status === 'enviado' && (
              <View className="mt-4">
                <TouchableOpacity
                  className="bg-green-500 rounded-xl py-4 mb-3"
                  onPress={handleMarcarComoRecebido}
                  disabled={atualizarStatusMutation.isPending}
                >
                  {atualizarStatusMutation.isPending ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-white text-center text-lg font-semibold ml-2">
                        Processando...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="white"
                      />
                      <Text className="text-white text-center text-lg font-semibold ml-2">
                        Recebi o Pedido
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {isVendedor &&
              (pedidoDetalhe.status === 'pago' ||
                pedidoDetalhe.status === 'processando') && (
                <View className="mt-4">
                  <TouchableOpacity
                    className="bg-purple-500 rounded-xl py-4 mb-3"
                    onPress={() => setShowEnviadoModal(true)}
                    disabled={atualizarStatusMutation.isPending}
                  >
                    {atualizarStatusMutation.isPending ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text className="text-white text-center text-lg font-semibold ml-2">
                          Processando...
                        </Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="send" size={20} color="white" />
                        <Text className="text-white text-center text-lg font-semibold ml-2">
                          Marcar como Enviado
                        </Text>
                      </View>
                    )}
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
                    {atualizarStatusMutation.isPending ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text className="text-white text-center text-lg font-semibold ml-2">
                          Processando...
                        </Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="close-circle" size={20} color="white" />
                        <Text className="text-white text-center text-lg font-semibold ml-2">
                          Cancelar Pedido
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}

            <Modal
              visible={showEnviadoModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowEnviadoModal(false)}
            >
              <View className="flex-1 bg-black/50 items-center justify-center px-6">
                <View className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <Text className="text-frg900 font-bold text-xl mb-4">
                    Marcar como Enviado
                  </Text>
                  <Text className="text-system-text text-sm mb-4">
                    Informe os dados de rastreamento (opcional):
                  </Text>

                  <Text className="text-frg900 font-semibold text-sm mb-2">
                    Código de Rastreamento
                  </Text>
                  <TextInput
                    className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                    placeholder="Ex: BR123456789BR"
                    value={codigoRastreamento}
                    onChangeText={setCodigoRastreamento}
                  />

                  <Text className="text-frg900 font-semibold text-sm mb-2">
                    Transportadora
                  </Text>
                  <TextInput
                    className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base mb-4"
                    placeholder="Ex: Correios, Jadlog, etc."
                    value={transportadora}
                    onChangeText={setTransportadora}
                  />

                  <Text className="text-frg900 font-semibold text-sm mb-2">
                    Previsão de Entrega
                  </Text>
                  <TouchableOpacity
                    className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between"
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text
                      className={`text-base ${
                        previsaoEntrega ? 'text-frg900' : 'text-gray-400'
                      }`}
                    >
                      {previsaoEntrega
                        ? formatDateForDisplay(previsaoEntrega)
                        : 'Selecione uma data'}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#9FABB9"
                    />
                  </TouchableOpacity>

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 bg-gray-200 rounded-xl py-3"
                      onPress={() => {
                        setShowEnviadoModal(false)
                        setCodigoRastreamento('')
                        setTransportadora('')
                        setPrevisaoEntrega('')
                        setSelectedDate(null)
                      }}
                    >
                      <Text className="text-center font-semibold">
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-purple-500 rounded-xl py-3"
                      onPress={() => {
                        atualizarStatusMutation.mutate({
                          id: pedidoDetalhe.id,
                          status: 'enviado',
                          codigoRastreamento:
                            codigoRastreamento.trim() || undefined,
                          transportadora: transportadora.trim() || undefined,
                          previsaoEntrega: previsaoEntrega.trim() || undefined,
                        })
                      }}
                      disabled={atualizarStatusMutation.isPending}
                    >
                      {atualizarStatusMutation.isPending ? (
                        <View className="flex-row items-center justify-center">
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text className="text-white text-center font-semibold ml-2">
                            Processando...
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-white text-center font-semibold">
                          Confirmar
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal
              visible={showDatePicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View className="flex-1 bg-black/50 items-center justify-center px-6">
                <View className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80%]">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-frg900 font-bold text-xl">
                      Selecionar Data de Entrega
                    </Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Ionicons name="close" size={24} color="#9FABB9" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="max-h-96"
                  >
                    <View className="flex-row flex-wrap -mx-1">
                      {getNextDays().map((date) => {
                        // Compara datas usando componentes locais para evitar problemas de timezone
                        const today = new Date()
                        const todayLocal = new Date(
                          today.getFullYear(),
                          today.getMonth(),
                          today.getDate(),
                        )
                        const isToday =
                          date.getFullYear() === todayLocal.getFullYear() &&
                          date.getMonth() === todayLocal.getMonth() &&
                          date.getDate() === todayLocal.getDate()
                        const isSelected =
                          selectedDate &&
                          date.getFullYear() === selectedDate.getFullYear() &&
                          date.getMonth() === selectedDate.getMonth() &&
                          date.getDate() === selectedDate.getDate()
                        const dayName = date.toLocaleDateString('pt-BR', {
                          weekday: 'short',
                        })
                        const dayNumber = date.getDate()
                        const monthName = date.toLocaleDateString('pt-BR', {
                          month: 'short',
                        })
                        const dateKey = formatDateForInput(date)

                        return (
                          <TouchableOpacity
                            key={dateKey}
                            className={`w-1/3 px-1 mb-2`}
                            onPress={() => handleSelectDate(date)}
                          >
                            <View
                              className={`rounded-xl p-3 border-2 min-h-[90px] ${
                                isSelected
                                  ? 'bg-purple-500 border-purple-500'
                                  : isToday
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <Text
                                className={`text-xs font-semibold mb-1 text-center ${
                                  isSelected
                                    ? 'text-white'
                                    : isToday
                                      ? 'text-blue-600'
                                      : 'text-gray-600'
                                }`}
                              >
                                {dayName.toUpperCase()}
                              </Text>
                              <Text
                                className={`text-lg font-bold text-center ${
                                  isSelected
                                    ? 'text-white'
                                    : isToday
                                      ? 'text-blue-600'
                                      : 'text-frg900'
                                }`}
                              >
                                {dayNumber}
                              </Text>
                              <Text
                                className={`text-xs text-center ${
                                  isSelected
                                    ? 'text-white'
                                    : isToday
                                      ? 'text-blue-600'
                                      : 'text-gray-500'
                                }`}
                              >
                                {monthName}
                              </Text>
                              <View className="h-4 mt-1">
                                {isToday && (
                                  <Text className="text-xs text-center text-blue-600 font-semibold">
                                    Hoje
                                  </Text>
                                )}
                              </View>
                            </View>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </ScrollView>

                  <TouchableOpacity
                    className="bg-gray-200 rounded-xl py-3 mt-4"
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text className="text-center font-semibold">Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

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
                      <Text className="text-center font-semibold">
                        Cancelar
                      </Text>
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
                  {pedidoDetalhe.itens.map((item) => {
                    const avaliacaoAtual = avaliacoes[item.produto_id]
                    const comentarioAtual =
                      comentariosAvaliacao[item.produto_id] || ''
                    return (
                      <View
                        key={item.id}
                        className="mb-4 pb-4 border-b border-gray-100 last:border-0"
                      >
                        <Text className="text-frg900 font-semibold text-sm mb-2">
                          {item.nome_produto}
                        </Text>
                        <View className="flex-row items-center mb-3">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const notaSelecionada =
                              notasSelecionadas[item.produto_id] ||
                              avaliacaoAtual?.nota ||
                              0
                            const isPintada = star <= notaSelecionada
                            return (
                              <TouchableOpacity
                                key={star}
                                className="mr-2"
                                onPress={() => {
                                  setNotasSelecionadas((prev) => ({
                                    ...prev,
                                    [item.produto_id]: star,
                                  }))
                                }}
                                disabled={criarAvaliacaoMutation.isPending}
                              >
                                <Ionicons
                                  name={isPintada ? 'star' : 'star-outline'}
                                  size={24}
                                  color={isPintada ? '#FFD700' : '#D1D5DB'}
                                />
                              </TouchableOpacity>
                            )
                          })}
                        </View>
                        {(!!notasSelecionadas[item.produto_id] ||
                          !!avaliacaoAtual) && (
                          <TextInput
                            className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base mb-2"
                            placeholder="Adicione um comentário (opcional)"
                            placeholderTextColor="#9FABB9"
                            value={comentarioAtual}
                            onChangeText={(text) =>
                              setComentariosAvaliacao((prev) => ({
                                ...prev,
                                [item.produto_id]: text,
                              }))
                            }
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            returnKeyType="done"
                          />
                        )}
                        {!!notasSelecionadas[item.produto_id] && (
                          <TouchableOpacity
                            className="bg-frgprimary rounded-xl py-3 px-4 mb-2"
                            onPress={() => {
                              const nota = notasSelecionadas[item.produto_id]
                              const comentario =
                                comentariosAvaliacao[item.produto_id] || ''
                              criarAvaliacaoMutation.mutate({
                                pedidoId: selectedPedidoId!,
                                produtoId: item.produto_id,
                                nota,
                                comentario: comentario || undefined,
                              })
                            }}
                            disabled={criarAvaliacaoMutation.isPending}
                          >
                            <Text className="text-white text-center font-semibold">
                              {criarAvaliacaoMutation.isPending
                                ? 'Enviando...'
                                : 'Enviar Avaliação'}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {avaliacaoAtual && (
                          <View className="mt-2">
                            <Text className="text-system-text text-xs">
                              Avaliado com {avaliacaoAtual.nota} estrela(s)
                            </Text>
                            {avaliacaoAtual.comentario && (
                              <Text className="text-system-text text-xs mt-1">
                                Comentário: {avaliacaoAtual.comentario}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    )
                  })}
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
        scrollEnabled={!!selectedPedidoId}
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
