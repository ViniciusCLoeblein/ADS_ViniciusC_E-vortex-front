export interface CustomerProfileRes {
  id: string
  uuid: string
  nome: string
  email: string
  cpf: string
  tipo: string
  telefone: string
  emailVerificado: boolean
}

export interface EnderecoRes {
  id: string
  apelido?: string
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  pais?: string
  principal: boolean
  usuarioId: string
}

export interface ListaEnderecosRes {
  enderecos: EnderecoRes[]
}

export interface CriarEnderecoReq {
  apelido: string
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  pais: string
  principal?: boolean
}

export interface AtualizarEnderecoReq {
  apelido?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  pais?: string
  principal?: boolean
}

export interface CartaoRes {
  ano_validade: number
  ativo: boolean
  bandeira: string
  criado_em: string
  id: string
  mes_validade: number
  principal: boolean
  titular: string
  ultimos_digitos: string
  uuid: string
}

export interface ListaCartoesRes {
  cartoes: CartaoRes[]
  total: number
}

export interface CriarCartaoReq {
  titular: string
  numero: string
  bandeira: string
  mesValidade: number
  anoValidade: number
  cvv: string
  principal?: boolean
}

export interface MessageRes {
  message: string
}

export interface ItemCriarPedidoReq {
  produtoId: string
  variacaoId?: string
  quantidade: number
}

export interface CriarPedidoReq {
  enderecoEntregaId: string
  cartaoCreditoId?: string
  metodoPagamento: string
  frete: number
  desconto?: number
  itens: ItemCriarPedidoReq[]
}

export interface PedidoItemRes {
  id: string
  pedido_id: string
  produto_id: string
  variacao_id: string
  quantidade: number
  preco_unitario: string
  nome_produto: string
  variacao_descricao: string
}

export interface PedidoRes {
  id: string
  uuid: string
  usuario_id: string
  endereco_entrega_id: string
  cartao_credito_id: string
  status: string
  subtotal: string
  desconto: number
  frete: number
  total: number
  metodo_pagamento: string
  dados_pagamento: string | null
  codigo_rastreamento: string | null
  transportadora: string | null
  previsao_entrega: string | null
  data_pagamento: string | null
  data_envio: string | null
  data_entrega: string | null
  data_cancelamento: string | null
  motivo_cancelamento: string | null
  criado_em: string
  atualizado_em: string
}

export interface PedidoDetalheRes extends PedidoRes {
  itens: PedidoItemRes[]
}

export interface ListaPedidosRes {
  pedidos: PedidoRes[]
  total: number
}
