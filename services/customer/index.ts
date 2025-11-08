import axios from '../'
import { CustomerProfileRes } from './interface'

export async function getCustomerProfile(): Promise<CustomerProfileRes> {
  const response = await axios.get<CustomerProfileRes>('/customer/perfil')
  return response.data
}
