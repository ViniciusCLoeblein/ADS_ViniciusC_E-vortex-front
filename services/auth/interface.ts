export interface LoginReq {
  email: string
  senha: string
}

export interface LoginRes {
  token: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface RegisterCustomerReq {
  nome: string
  email: string
  senha: string
  cpf: string
  tipo: string
  telefone: string
  dataNascimento: string
  aceitaMarketing: boolean
}

export interface RegisterSellerReq {
  nome: string
  email: string
  senha: string
  cpf: string
  telefone: string
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  inscricaoEstadual: string
  contaBancaria?: {
    banco: string
    agencia: string
    conta: string
  }
}

export interface RegisterSellerRes {
  userId: string
  vendedorId: string
  accessToken: string
  accessTokenExpiresAt: string
  status: string
}
