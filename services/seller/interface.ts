export interface SellerProfileRes {
  id: string
  uuid: string
  nome: string
  email: string
  cpf: string
  telefone: string
  emailVerificado: boolean
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

