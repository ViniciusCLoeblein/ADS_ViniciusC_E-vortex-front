import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  obterCarrinho,
  limparCarrinho,
  listarImagensProduto,
  obterVendedorUsuario,
  buscarCupomPorCodigo,
} from '@/services/sales'
import {
  listarEnderecos,
  listarCartoes,
  criarPedido,
  listarEnderecosVendedor,
} from '@/services/customer'
import { EnderecoRes } from '@/services/customer/interface'
import { calcularFrete } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useCart } from '@/contexts/CartContext'

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
  const { userId } = useAuthStore()

  const { data: imagensData, isLoading } = useQuery({
    queryKey: ['imagens-produto', userId, produtoId],
    queryFn: () => listarImagensProduto(produtoId),
    enabled: !!produtoId && !!userId,
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

export default function CheckoutScreen() {
  const queryClient = useQueryClient()
  const { userId } = useAuthStore()
  const { clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedEndereco, setSelectedEndereco] = useState<string | null>(null)
  const [selectedCartao, setSelectedCartao] = useState<string | null>(null)
  const [valorFrete, setValorFrete] = useState<number>(0)
  const [isCalculandoFrete, setIsCalculandoFrete] = useState(false)
  const [codigoCupom, setCodigoCupom] = useState('')
  const [cupomAplicado, setCupomAplicado] = useState<{
    id: string
    codigo: string
    tipo: string
    valor: string
    valorMinimo: string
  } | null>(null)
  const [isValidandoCupom, setIsValidandoCupom] = useState(false)

  const {
    data: carrinho,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['carrinho', userId],
    queryFn: obterCarrinho,
    enabled: !!userId,
  })

  const { data: enderecosData, isLoading: isLoadingEnderecos } = useQuery({
    queryKey: ['enderecos', userId],
    queryFn: listarEnderecos,
    enabled: !!userId,
  })

  const { data: cartoesData, isLoading: isLoadingCartoes } = useQuery({
    queryKey: ['cartoes', userId],
    queryFn: listarCartoes,
    enabled: !!userId,
  })

  const criarPedidoMutation = useMutation({
    mutationFn: criarPedido,
    onSuccess: async (pedido) => {
      await clearCart()

      try {
        await limparCarrinho()
      } catch (error) {
        console.error('Erro ao limpar carrinho no backend:', error)
      }

      queryClient.invalidateQueries({ queryKey: ['carrinho'] })

      const descontoFinal = calcularDesconto()
      const totalFinal = (carrinho?.total || 0) + valorFrete - descontoFinal

      router.replace({
        pathname: '/order-success',
        params: {
          total: totalFinal.toString(),
          pedidoId: pedido?.id || '',
        },
      })
    },
    onError: () => {
      Alert.alert('Erro', 'Falha ao criar o pedido. Tente novamente.')
    },
  })

  useEffect(() => {
    if (
      enderecosData?.enderecos &&
      enderecosData.enderecos.length > 0 &&
      !selectedEndereco
    ) {
      const principal = enderecosData.enderecos.find((e) => e.principal)
      if (principal) {
        setSelectedEndereco(principal.id)
      } else {
        setSelectedEndereco(enderecosData.enderecos[0].id)
      }
    }

    if (
      cartoesData?.cartoes &&
      cartoesData.cartoes.length > 0 &&
      !selectedCartao
    ) {
      const principal = cartoesData.cartoes.find((c) => c.principal)
      if (principal) {
        setSelectedCartao(principal.id)
      } else {
        setSelectedCartao(cartoesData.cartoes[0].id)
      }
    }
  }, [enderecosData, cartoesData, selectedEndereco, selectedCartao])

  const vendedorId = carrinho?.itens?.[0]?.produto?.vendedorId
  const { data: vendedorData } = useQuery({
    queryKey: ['vendedor', vendedorId],
    queryFn: () => obterVendedorUsuario(vendedorId!),
    enabled: !!vendedorId,
  })

  // Query para buscar endereços do vendedor (assumindo que há uma API para isso)
  // Como não temos essa API, vamos usar uma abordagem alternativa:
  // Vamos buscar o endereço através do vendedorId usando uma query customizada
  // Por enquanto, vamos usar uma solução temporária: buscar o CEP através do vendedor

  // Calcula o frete quando o endereço é selecionado ou o carrinho muda
  useEffect(() => {
    const calcularFreteAtual = async () => {
      if (
        !selectedEndereco ||
        !carrinho ||
        !carrinho.itens ||
        carrinho.itens.length === 0
      ) {
        setValorFrete(0)
        return
      }

      // Pega o vendedorId do primeiro item (assumindo que todos são do mesmo vendedor)
      const vendedorIdItem = carrinho.itens[0]?.produto?.vendedorId
      if (!vendedorIdItem) {
        setValorFrete(0)
        return
      }

      // Busca o endereço selecionado do cliente
      const enderecoCliente = enderecosData?.enderecos?.find(
        (e) => e.id === selectedEndereco,
      )

      if (!enderecoCliente) {
        setValorFrete(0)
        return
      }

      setIsCalculandoFrete(true)
      try {
        const enderecosVendedor = await listarEnderecosVendedor(vendedorIdItem)

        const enderecoPrincipalVendedor = enderecosVendedor.enderecos.find(
          (e) => e.principal,
        )

        if (!enderecoPrincipalVendedor) {
          setValorFrete(0)
          Alert.alert(
            'Aviso',
            'O vendedor não possui endereço principal cadastrado. Não foi possível calcular o frete.',
          )
          return
        }

        const frete = await calcularFrete(
          enderecoPrincipalVendedor.cep,
          enderecoCliente.cep,
        )
        setValorFrete(frete)
      } catch (error) {
        console.error('Erro ao calcular frete:', error)
        setValorFrete(0)
        Alert.alert(
          'Aviso',
          'Não foi possível calcular o frete. O valor será R$ 0,00.',
        )
      } finally {
        setIsCalculandoFrete(false)
      }
    }

    calcularFreteAtual()
  }, [selectedEndereco, carrinho, enderecosData, vendedorData])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const calcularDesconto = (): number => {
    if (!cupomAplicado || !carrinho) return 0

    const subtotal = carrinho.total
    const valorMinimo = Number.parseFloat(cupomAplicado.valorMinimo)

    // Verifica se o subtotal atende ao valor mínimo
    if (subtotal < valorMinimo) {
      return 0
    }

    const valorCupom = Number.parseFloat(cupomAplicado.valor)

    if (cupomAplicado.tipo === 'percentual') {
      // Desconto percentual
      const desconto = (subtotal * valorCupom) / 100
      return Math.min(desconto, subtotal) // Não pode ser maior que o subtotal
    } else {
      // Desconto em valor fixo
      return Math.min(valorCupom, subtotal) // Não pode ser maior que o subtotal
    }
  }

  const handleValidarCupom = async () => {
    if (!codigoCupom.trim()) {
      Alert.alert('Aviso', 'Digite um código de cupom')
      return
    }

    setIsValidandoCupom(true)
    try {
      const cupom = await buscarCupomPorCodigo(codigoCupom.trim().toUpperCase())

      // Validações do cupom
      if (!cupom.ativo) {
        Alert.alert('Cupom Inválido', 'Este cupom não está ativo')
        setCodigoCupom('')
        setCupomAplicado(null)
        return
      }

      const agora = new Date()
      const dataInicio = new Date(cupom.dataInicio)
      const dataExpiracao = new Date(cupom.dataExpiracao)

      if (agora < dataInicio) {
        Alert.alert('Cupom Inválido', 'Este cupom ainda não está válido')
        setCodigoCupom('')
        setCupomAplicado(null)
        return
      }

      if (agora > dataExpiracao) {
        Alert.alert('Cupom Inválido', 'Este cupom está expirado')
        setCodigoCupom('')
        setCupomAplicado(null)
        return
      }

      if (cupom.usosAtuais >= cupom.usosMaximos) {
        Alert.alert('Cupom Inválido', 'Este cupom atingiu o limite de usos')
        setCodigoCupom('')
        setCupomAplicado(null)
        return
      }

      if (carrinho && carrinho.total < Number.parseFloat(cupom.valorMinimo)) {
        Alert.alert(
          'Cupom Inválido',
          `O valor mínimo para usar este cupom é ${formatPrice(Number.parseFloat(cupom.valorMinimo))}`,
        )
        setCodigoCupom('')
        setCupomAplicado(null)
        return
      }

      // Cupom válido
      setCupomAplicado({
        id: cupom.id,
        codigo: cupom.codigo,
        tipo: cupom.tipo,
        valor: cupom.valor,
        valorMinimo: cupom.valorMinimo,
      })
      Alert.alert('Sucesso', 'Cupom aplicado com sucesso!')
    } catch (error) {
      Alert.alert('Cupom Inválido', 'Cupom não encontrado ou inválido')
      setCodigoCupom('')
      setCupomAplicado(null)
    } finally {
      setIsValidandoCupom(false)
    }
  }

  const handleRemoverCupom = () => {
    setCupomAplicado(null)
    setCodigoCupom('')
  }

  const formatEndereco = (endereco: EnderecoRes) => {
    return `${endereco.logradouro}, ${endereco.numero}${
      endereco.complemento ? ` - ${endereco.complemento}` : ''
    } - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado} - ${endereco.cep}`
  }

  const renderEnderecos = () => {
    if (isLoadingEnderecos) {
      return (
        <View className="bg-white rounded-2xl p-4 items-center justify-center min-h-[100px]">
          <ActivityIndicator size="large" color="#437C99" />
          <Text className="text-system-text mt-4">Carregando endereços...</Text>
        </View>
      )
    }

    const hasEnderecos =
      enderecosData?.enderecos && enderecosData.enderecos.length > 0

    if (!hasEnderecos) {
      return (
        <View className="bg-white rounded-2xl p-4 border border-gray-200">
          <Text className="text-system-text mb-4 text-center">
            Nenhum endereço cadastrado
          </Text>
          <TouchableOpacity
            className="bg-frgprimary rounded-xl py-3"
            onPress={() => router.push('/profile/addresses/new')}
          >
            <Text className="text-white text-center font-semibold">
              Adicionar Endereço
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    return enderecosData.enderecos.map((endereco) => (
      <TouchableOpacity
        key={endereco.id}
        onPress={() => setSelectedEndereco(endereco.id)}
        className={`bg-white rounded-2xl p-4 mb-3 border-2 ${
          selectedEndereco === endereco.id
            ? 'border-frgprimary'
            : 'border-gray-200'
        }`}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            {endereco.principal && (
              <View className="bg-frgprimary/10 rounded-full px-3 py-1 self-start mb-2">
                <Text className="text-frgprimary text-xs font-semibold">
                  Principal
                </Text>
              </View>
            )}
            {endereco.apelido && (
              <Text className="text-frg900 font-semibold text-base mb-1">
                {endereco.apelido}
              </Text>
            )}
            <Text className="text-system-text text-sm">
              {formatEndereco(endereco)}
            </Text>
          </View>
          {selectedEndereco === endereco.id && (
            <Ionicons name="checkmark-circle" size={24} color="#EF4058" />
          )}
        </View>
      </TouchableOpacity>
    ))
  }

  const renderCartoes = () => {
    if (isLoadingCartoes) {
      return (
        <View className="bg-white rounded-2xl p-4 items-center justify-center min-h-[100px]">
          <ActivityIndicator size="large" color="#437C99" />
          <Text className="text-system-text mt-4">Carregando cartões...</Text>
        </View>
      )
    }

    const hasCartoes = cartoesData?.cartoes && cartoesData.cartoes.length > 0

    if (!hasCartoes) {
      return (
        <View className="bg-white rounded-2xl p-4 border border-gray-200">
          <Text className="text-system-text mb-4 text-center">
            Nenhum cartão cadastrado
          </Text>
          <TouchableOpacity
            className="bg-frgprimary rounded-xl py-3"
            onPress={() => router.push('/profile/cards/new')}
          >
            <Text className="text-white text-center font-semibold">
              Adicionar Cartão
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    return cartoesData.cartoes.map((cartao) => (
      <TouchableOpacity
        key={cartao.id}
        onPress={() => setSelectedCartao(cartao.id)}
        className={`bg-white rounded-2xl p-4 mb-3 border-2 ${
          selectedCartao === cartao.id ? 'border-frgprimary' : 'border-gray-200'
        }`}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            {cartao.principal && (
              <View className="bg-frgprimary/10 rounded-full px-3 py-1 self-start mb-2">
                <Text className="text-frgprimary text-xs font-semibold">
                  Principal
                </Text>
              </View>
            )}
            <Text className="text-frg900 font-semibold text-lg mb-1">
              {cartao.bandeira}
            </Text>
            <Text className="text-frg900 font-medium text-base mb-2">
              •••• •••• •••• {cartao.ultimos_digitos ?? '****'}
            </Text>
            <Text className="text-system-text text-sm">{cartao.titular}</Text>
            <Text className="text-system-text text-sm">
              Válido até {cartao.mes_validade}/
              {String(cartao.ano_validade).slice(-2)}
            </Text>
          </View>
          {selectedCartao === cartao.id && (
            <Ionicons name="checkmark-circle" size={24} color="#EF4058" />
          )}
        </View>
      </TouchableOpacity>
    ))
  }

  const getButtonText = () => {
    if (isProcessing) {
      return 'Processando...'
    }
    if (!selectedEndereco || !selectedCartao) {
      return 'Selecione endereço e cartão'
    }
    return 'Finalizar Compra'
  }

  const handleCheckout = async () => {
    if (!carrinho || carrinho.itens.length === 0) {
      Alert.alert(
        'Carrinho vazio',
        'Adicione produtos ao carrinho antes de finalizar a compra.',
      )
      return
    }

    if (!selectedEndereco) {
      Alert.alert(
        'Endereço necessário',
        'Por favor, selecione um endereço de entrega ou adicione um novo.',
        [
          {
            text: 'Adicionar Endereço',
            onPress: () => router.push('/profile/addresses/new'),
          },
          { text: 'OK' },
        ],
      )
      return
    }

    if (!selectedCartao) {
      Alert.alert(
        'Cartão necessário',
        'Por favor, selecione um cartão de pagamento ou adicione um novo.',
        [
          {
            text: 'Adicionar Cartão',
            onPress: () => router.push('/profile/cards/new'),
          },
          { text: 'OK' },
        ],
      )
      return
    }

    setIsProcessing(true)

    try {
      const itens = carrinho.itens.map((item) => ({
        produtoId: item.produtoId,
        variacaoId: item.variacaoId || undefined,
        quantidade: item.quantidade,
      }))

      if (!selectedEndereco || !selectedCartao) {
        setIsProcessing(false)
        return
      }

      await criarPedidoMutation.mutateAsync({
        enderecoEntregaId: selectedEndereco,
        cartaoCreditoId: selectedCartao,
        metodoPagamento: 'cartao',
        frete: valorFrete,
        desconto: calcularDesconto(),
        itens,
      })
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      Alert.alert('Erro', 'Falha ao processar o pedido. Tente novamente.')
      setIsProcessing(false)
    }
  }

  if (!carrinho || carrinho.itens.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-white px-6 py-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#9FABB9" />
            </TouchableOpacity>
            <Text className="text-frg900 font-bold text-xl">Checkout</Text>
            <View className="w-6" />
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-frg900 font-bold text-xl mb-2 text-center">
            Carrinho vazio
          </Text>
          <Text className="text-system-text text-center mb-8">
            Adicione produtos ao carrinho para continuar
          </Text>
          <TouchableOpacity
            className="bg-frgprimary rounded-xl py-4 px-8"
            onPress={() => router.replace('/home')}
          >
            <Text className="text-white font-semibold text-lg">
              Continuar Comprando
            </Text>
          </TouchableOpacity>
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
          <Text className="text-frg900 font-bold text-xl">Checkout</Text>
          <View className="w-6" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isLoadingEnderecos || isLoadingCartoes}
            onRefresh={refetch}
          />
        }
      >
        <View className="px-6 pt-4">
          <View className="mb-6">
            <Text className="text-frg900 font-bold text-lg mb-4">
              Itens do Pedido
            </Text>
            {carrinho.itens.map((item) => (
              <View
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4"
              >
                <View className="flex-row">
                  <ProductImage
                    produtoId={item.produtoId}
                    className="w-20 h-20 rounded-xl mr-4"
                    resizeMode="cover"
                    alt={item.produto?.nome || 'Produto'}
                  />

                  <View className="flex-1">
                    <Text
                      className="text-frg900 font-semibold text-base mb-1"
                      numberOfLines={2}
                    >
                      {item.produto?.nome || 'Produto'}
                    </Text>
                    <Text className="text-system-text text-sm mb-2">
                      Quantidade: {item.quantidade}
                    </Text>
                    <Text className="text-frgprimary font-bold text-lg">
                      {formatPrice(item.precoUnitario * item.quantidade)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-frg900 font-bold text-lg">
                Endereço de Entrega
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/profile/addresses/new')}
                className="flex-row items-center"
              >
                <Ionicons name="add-circle-outline" size={20} color="#EF4058" />
                <Text className="text-frgprimary font-semibold ml-1">
                  Adicionar
                </Text>
              </TouchableOpacity>
            </View>

            {renderEnderecos()}
          </View>

          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-frg900 font-bold text-lg">
                Forma de Pagamento
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/profile/cards/new')}
                className="flex-row items-center"
              >
                <Ionicons name="add-circle-outline" size={20} color="#EF4058" />
                <Text className="text-frgprimary font-semibold ml-1">
                  Adicionar
                </Text>
              </TouchableOpacity>
            </View>

            {renderCartoes()}
          </View>

          <View className="mb-6">
            <Text className="text-frg900 font-bold text-lg mb-4">
              Cupom de Desconto
            </Text>
            <View className="bg-white rounded-2xl p-4 border border-gray-200">
              {cupomAplicado ? (
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-frg900 font-semibold text-base mb-1">
                      {cupomAplicado.codigo}
                    </Text>
                    <Text className="text-green-600 text-sm">
                      Desconto aplicado:{' '}
                      {cupomAplicado.tipo === 'percentual'
                        ? `${cupomAplicado.valor}%`
                        : formatPrice(Number.parseFloat(cupomAplicado.valor))}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleRemoverCupom}
                    className="ml-4"
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4058" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-row gap-2">
                  <TextInput
                    className="flex-1 bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Digite o código do cupom"
                    placeholderTextColor="#9FABB9"
                    value={codigoCupom}
                    onChangeText={setCodigoCupom}
                    autoCapitalize="characters"
                    editable={!isValidandoCupom}
                  />
                  <TouchableOpacity
                    className={`bg-frgprimary rounded-xl px-6 py-3 ${
                      isValidandoCupom ? 'opacity-50' : ''
                    }`}
                    onPress={handleValidarCupom}
                    disabled={isValidandoCupom || !codigoCupom.trim()}
                  >
                    {isValidandoCupom ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text className="text-white font-semibold">Aplicar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <Text className="text-frg900 font-bold text-lg mb-4">
              Resumo do Pedido
            </Text>

            <View className="flex-row justify-between mb-2">
              <Text className="text-system-text">Subtotal:</Text>
              <Text className="text-frg900 font-semibold">
                {formatPrice(carrinho.total)}
              </Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center">
                <Text className="text-system-text">Frete:</Text>
                {isCalculandoFrete && (
                  <ActivityIndicator
                    size="small"
                    color="#437C99"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </View>
              <Text className="text-frg900 font-semibold">
                {isCalculandoFrete ? 'Calculando...' : formatPrice(valorFrete)}
              </Text>
            </View>

            {calcularDesconto() > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-system-text">Desconto:</Text>
                <Text className="text-green-600 font-semibold">
                  - {formatPrice(calcularDesconto())}
                </Text>
              </View>
            )}

            <View className="border-t border-gray-200 pt-3 mt-3">
              <View className="flex-row justify-between">
                <Text className="text-frg900 font-bold text-lg">Total:</Text>
                <Text className="text-frgprimary font-bold text-xl">
                  {formatPrice(
                    carrinho.total + valorFrete - calcularDesconto(),
                  )}
                </Text>
              </View>
            </View>
          </View>

          <View className="h-14" />
        </View>
      </ScrollView>

      <View className="bg-white border-t border-gray-200 shadow-lg">
        <View className="px-6 pt-4 pb-2">
          <Text className="text-frg900 font-bold text-lg mb-3">
            Resumo do Pedido
          </Text>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-system-text">Subtotal:</Text>
            <Text className="text-frg900 font-semibold">
              {formatPrice(carrinho.total)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-system-text">Frete:</Text>
            <Text className="text-frg900 font-semibold">
              {formatPrice(valorFrete)}
            </Text>
          </View>
          {calcularDesconto() > 0 && (
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-system-text">Desconto:</Text>
              <Text className="text-green-600 font-semibold">
                - {formatPrice(calcularDesconto())}
              </Text>
            </View>
          )}
          <View className="border-t border-gray-200 mt-3 pt-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-frg900 font-bold text-lg">Total:</Text>
              <Text className="text-frgprimary font-bold text-xl">
                {formatPrice(carrinho.total + valorFrete - calcularDesconto())}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 pb-4 pt-2">
          <TouchableOpacity
            className={`bg-frgprimary rounded-xl py-4 ${
              isProcessing ||
              criarPedidoMutation.isPending ||
              !selectedEndereco ||
              !selectedCartao
                ? 'opacity-50'
                : ''
            }`}
            onPress={handleCheckout}
            disabled={
              isProcessing ||
              criarPedidoMutation.isPending ||
              !selectedEndereco ||
              !selectedCartao
            }
          >
            {isProcessing || criarPedidoMutation.isPending ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="text-white text-center text-lg font-semibold ml-2">
                  Processando...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                {getButtonText()}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
