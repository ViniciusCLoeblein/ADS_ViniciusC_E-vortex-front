import axios from '../'
import {
  CustomerProfileRes,
  EnderecoRes,
  ListaEnderecosRes,
  CartaoRes,
  ListaCartoesRes,
  MessageRes,
  CriarEnderecoReq,
  AtualizarEnderecoReq,
  CriarCartaoReq,
  CriarPedidoReq,
  PedidoDetalheRes,
  ListaPedidosRes,
  AtualizarStatusPedidoReq,
  PedidoStatusAtualizadoRes,
} from './interface'

export async function getCustomerProfile(): Promise<CustomerProfileRes> {
  const response = await axios.get<CustomerProfileRes>('/customer/perfil')
  return response.data
}

export async function criarEndereco(
  data: CriarEnderecoReq,
): Promise<EnderecoRes> {
  const response = await axios.post<EnderecoRes>('/customer/enderecos', data)
  return response.data
}

export async function listarEnderecos(): Promise<ListaEnderecosRes> {
  const response = await axios.get<ListaEnderecosRes>('/customer/enderecos')
  return response.data
}

export async function listarEnderecosVendedor(
  vendedorId: string,
): Promise<ListaEnderecosRes> {
  const response = await axios.get<ListaEnderecosRes>(
    `/customer/enderecos/vendedor/${vendedorId}`,
  )
  return response.data
}

export async function obterEndereco(id: string): Promise<EnderecoRes> {
  const response = await axios.get<EnderecoRes>(`/customer/enderecos/${id}`)
  return response.data
}

export async function atualizarEndereco(
  id: string,
  data: AtualizarEnderecoReq,
): Promise<EnderecoRes> {
  const response = await axios.put<EnderecoRes>(
    `/customer/enderecos/${id}`,
    data,
  )
  return response.data
}

export async function excluirEndereco(id: string): Promise<MessageRes> {
  const response = await axios.delete<MessageRes>(`/customer/enderecos/${id}`)
  return response.data
}

export async function criarCartao(data: CriarCartaoReq): Promise<CartaoRes> {
  const response = await axios.post<CartaoRes>('/customer/cartoes', data)
  return response.data
}

export async function listarCartoes(): Promise<ListaCartoesRes> {
  const response = await axios.get<ListaCartoesRes>('/customer/cartoes')
  return response.data
}

export async function excluirCartao(id: string): Promise<MessageRes> {
  const response = await axios.delete<MessageRes>(`/customer/cartoes/${id}`)
  return response.data
}

export async function criarPedido(
  data: CriarPedidoReq,
): Promise<PedidoDetalheRes> {
  const response = await axios.post<PedidoDetalheRes>('/customer/pedidos', data)
  return response.data
}

export async function listarPedidos(): Promise<ListaPedidosRes> {
  const response = await axios.get<ListaPedidosRes>('/customer/pedidos')
  return response.data
}

export async function obterPedido(id: string): Promise<PedidoDetalheRes> {
  const response = await axios.get<PedidoDetalheRes>(`/customer/pedidos/${id}`)
  return response.data
}

export async function atualizarStatusPedido(
  id: string,
  data: AtualizarStatusPedidoReq,
): Promise<PedidoStatusAtualizadoRes> {
  const response = await axios.put<PedidoStatusAtualizadoRes>(
    `/sales/pedidos/${id}/status`,
    data,
  )
  return response.data
}
