import axios from '../'
import {
  LoginReq,
  LoginRes,
  RegisterCustomerReq,
  RegisterSellerReq,
  RegisterSellerRes,
  RequestPasswordResetTokenReq,
  RequestPasswordResetTokenRes,
  ValidatePasswordResetTokenReq,
  ResetPasswordReq,
} from './interface'

export async function login(payload: LoginReq): Promise<LoginRes> {
  const response = await axios.post<LoginRes>('/auth/login', payload)
  return response.data
}

export async function registerCustomer(
  payload: RegisterCustomerReq,
): Promise<{ success: boolean; message: string }> {
  const response = await axios.post('/auth/register', payload)
  return response.data
}

export async function registerSeller(
  payload: RegisterSellerReq,
): Promise<RegisterSellerRes> {
  const response = await axios.post<RegisterSellerRes>(
    '/auth/register/vendedor',
    payload,
  )
  return response.data
}

export async function requestPasswordResetToken(
  payload: RequestPasswordResetTokenReq,
): Promise<RequestPasswordResetTokenRes> {
  const response = await axios.post<RequestPasswordResetTokenRes>(
    '/auth/forgot-password',
    payload,
  )
  return response.data
}

export async function validatePasswordResetToken(
  payload: ValidatePasswordResetTokenReq,
): Promise<{ success: boolean; message: string }> {
  const response = await axios.post('/auth/validate-reset-token', payload)
  return response.data
}

export async function resetPassword(
  payload: ResetPasswordReq,
): Promise<{ success: boolean; message: string }> {
  const response = await axios.post('/auth/reset-password', payload)
  return response.data
}

export async function updateToken(token: string): Promise<{ message: string }> {
  const response = await axios.post('/auth/push-token', { token })
  return response.data
}
