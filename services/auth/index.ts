import axios from '../'
import {
  LoginReq,
  LoginRes,
  RegisterCustomerReq,
  RegisterSellerReq,
  RegisterSellerRes,
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
