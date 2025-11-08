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
  id: string
  numero: string
  nomeTitular: string
  validade: string
  cvv?: string
  principal: boolean
  usuarioId: string
}

export interface ListaCartoesRes {
  cartoes: CartaoRes[]
}

export interface CriarCartaoReq {
  numero: string
  nomeTitular: string
  validade: string
  cvv: string
  principal?: boolean
}

export interface MessageRes {
  message: string
}
