export interface ErrorRes {
  message: string
}

export interface StatusRes {
  status: string
  message: string
}

export interface PixTransaction {
  name: string
  expiration: number
  created: string
  expirationDate: string
  amount: null | string
  qrCode: null | string
}

export interface IdReq {
  id: string | number
}

export interface IdDesc {
  id: number
  description: string
}

export interface Value {
  value: string
}

export interface IdRes {
  id: number
}

export interface ApiErrorResponse {
  status: number
  message: string | string[]
  path: string
  method: string
  error: string
  statusCode: number
}

export interface StatusLinkRes {
  link: string
  message: string
}

export interface TokenRecovery {
  id: number
  name: string
  validate: string
  accessLevel: null | string
}
