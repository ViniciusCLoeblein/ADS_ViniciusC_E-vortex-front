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
