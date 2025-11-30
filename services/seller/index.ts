import axios from '../'
import { SellerProfileRes } from './interface'

export async function getSellerProfile(): Promise<SellerProfileRes> {
  const response = await axios.get<SellerProfileRes>('/seller/perfil')
  return response.data
}




