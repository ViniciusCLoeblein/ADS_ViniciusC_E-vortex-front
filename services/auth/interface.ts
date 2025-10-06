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
