import axios from '../index'
import { LoginReq, LoginRes } from './interface'

export async function login(payload: LoginReq): Promise<LoginRes> {
  const response = await axios.post<LoginRes>('/auth/login', payload)
  return response.data
}
