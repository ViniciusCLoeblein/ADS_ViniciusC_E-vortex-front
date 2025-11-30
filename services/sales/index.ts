import axios from '../'
import {
  CarrinhoRes,
  AdicionarItemCarrinhoReq,
  AtualizarItemCarrinhoReq,
  MessageRes,
  ProdutoListagemRes,
  ProdutoDetalheRes,
  ProdutoCriadoRes,
  CriarProdutoReq,
  ListarProdutosReq,
  FavoritosRes,
  CategoriaRes,
  ListaCategoriasRes,
  CriarCategoriaReq,
  AtualizarCategoriaReq,
  VariacaoRes,
  ListaVariacoesRes,
  CriarVariacaoReq,
  AtualizarVariacaoReq,
  ListaImagensRes,
  CriarImagemReq,
  ImagemUploadRes,
  VendedorPublicoRes,
  CriarAvaliacaoReq,
  AvaliacaoCriadaRes,
  ListaAvaliacoesRes,
} from './interface'

export async function obterCarrinho(): Promise<CarrinhoRes> {
  const response = await axios.get<CarrinhoRes>('/sales/carrinho')
  return response.data
}

export async function adicionarItemCarrinho(
  data: AdicionarItemCarrinhoReq,
): Promise<CarrinhoRes> {
  const response = await axios.post<CarrinhoRes>('/sales/carrinho/itens', data)
  return response.data
}

export async function atualizarItemCarrinho(
  itemId: string,
  data: AtualizarItemCarrinhoReq,
): Promise<CarrinhoRes> {
  const response = await axios.put<CarrinhoRes>(
    `/sales/carrinho/itens/${itemId}`,
    data,
  )
  return response.data
}

export async function removerItemCarrinho(
  itemId: string,
): Promise<CarrinhoRes> {
  const response = await axios.delete<CarrinhoRes>(
    `/sales/carrinho/itens/${itemId}`,
  )
  return response.data
}

export async function limparCarrinho(): Promise<MessageRes> {
  const response = await axios.delete<MessageRes>('/sales/carrinho')
  return response.data
}

export async function criarProduto(
  data: CriarProdutoReq,
): Promise<ProdutoCriadoRes> {
  const response = await axios.post<ProdutoCriadoRes>('/sales/produtos', data)
  return response.data
}

export async function listarProdutos(
  query?: ListarProdutosReq,
): Promise<ProdutoListagemRes> {
  const response = await axios.get<ProdutoListagemRes>('/sales/produtos', {
    params: query,
  })
  return response.data
}

export async function obterProduto(id: string): Promise<ProdutoDetalheRes> {
  const response = await axios.get<ProdutoDetalheRes>(`/sales/produtos/${id}`)
  return response.data
}

export async function listarFavoritos(): Promise<FavoritosRes> {
  const response = await axios.get<FavoritosRes>('/sales/favoritos')
  return response.data
}

export async function adicionarFavorito(
  produtoId: string,
): Promise<MessageRes> {
  const response = await axios.post<MessageRes>(`/sales/favoritos/${produtoId}`)
  return response.data
}

export async function removerFavorito(produtoId: string): Promise<MessageRes> {
  const response = await axios.delete<MessageRes>(
    `/sales/favoritos/${produtoId}`,
  )
  return response.data
}

export async function removerTodosFavoritos(): Promise<MessageRes> {
  const response = await axios.delete<MessageRes>('/sales/favoritos')
  return response.data
}

export async function criarCategoria(
  data: CriarCategoriaReq,
): Promise<CategoriaRes> {
  const response = await axios.post<CategoriaRes>('/sales/categorias', data)
  return response.data
}

export async function listarCategorias(): Promise<ListaCategoriasRes> {
  const response = await axios.get<ListaCategoriasRes>('/sales/categorias')
  return response.data
}

export async function obterCategoria(id: string): Promise<CategoriaRes> {
  const response = await axios.get<CategoriaRes>(`/sales/categorias/${id}`)
  return response.data
}

export async function atualizarCategoria(
  id: string,
  data: AtualizarCategoriaReq,
): Promise<CategoriaRes> {
  const response = await axios.put<CategoriaRes>(
    `/sales/categorias/${id}`,
    data,
  )
  return response.data
}

export async function excluirCategoria(id: string): Promise<MessageRes> {
  const response = await axios.delete<MessageRes>(`/sales/categorias/${id}`)
  return response.data
}

export async function criarVariacao(
  data: CriarVariacaoReq,
): Promise<VariacaoRes> {
  const response = await axios.post<VariacaoRes>('/sales/variacoes', data)
  return response.data
}

export async function listarVariacoesProduto(
  produtoId: string,
): Promise<ListaVariacoesRes> {
  const response = await axios.get<ListaVariacoesRes>(
    `/sales/variacoes/produto/${produtoId}`,
  )
  return response.data
}

export async function obterVariacao(id: string): Promise<VariacaoRes> {
  const response = await axios.get<VariacaoRes>(`/sales/variacoes/${id}`)
  return response.data
}

export async function atualizarVariacao(
  id: string,
  data: AtualizarVariacaoReq,
): Promise<VariacaoRes> {
  const response = await axios.put<VariacaoRes>(`/sales/variacoes/${id}`, data)
  return response.data
}

export async function excluirVariacao(id: string): Promise<MessageRes> {
  const response = await axios.delete<MessageRes>(`/sales/variacoes/${id}`)
  return response.data
}

export async function uploadImagem(
  data: CriarImagemReq,
): Promise<ImagemUploadRes> {
  const formData = new FormData()

  formData.append('file', {
    uri: data.file.uri,
    type: data.file.type || 'image/jpeg',
    name: data.file.name || 'image.jpg',
  } as unknown as File)

  formData.append('produtoId', data.produtoId)
  formData.append('tipo', data.tipo)

  if (data.legenda) {
    formData.append('legenda', data.legenda)
  }

  if (data.ordem !== undefined) {
    formData.append('ordem', data.ordem.toString())
  }

  const response = await axios.post<ImagemUploadRes>(
    '/sales/imagens/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return response.data
}

export async function listarImagensProduto(
  produtoId: string,
): Promise<ListaImagensRes> {
  const response = await axios.get<ListaImagensRes>(
    `/sales/imagens/produto/${produtoId}`,
  )
  return response.data
}

export async function excluirImagem(id: string): Promise<MessageRes> {
  const response = await axios.delete<MessageRes>(`/sales/imagens/${id}`)
  return response.data
}

export async function obterVendedor(id: string): Promise<VendedorPublicoRes> {
  const response = await axios.get<VendedorPublicoRes>(
    `/sales/vendedores/${id}`,
  )
  return response.data
}

export async function obterVendedorUsuario(
  usuarioId: string,
): Promise<VendedorPublicoRes> {
  const response = await axios.get<VendedorPublicoRes>(
    `/sales/vendedores/usuario/${usuarioId}`,
  )
  return response.data
}

export async function criarAvaliacao(
  data: CriarAvaliacaoReq,
): Promise<AvaliacaoCriadaRes> {
  const response = await axios.post<AvaliacaoCriadaRes>('/sales/avaliacoes', {
    pedidoId: data.pedidoId,
    produtoId: data.produtoId,
    nota: data.nota,
    titulo: data.titulo,
    comentario: data.comentario,
  })
  return response.data
}

export async function listarAvaliacoesProduto(
  produtoId: string,
): Promise<ListaAvaliacoesRes> {
  const response = await axios.get<ListaAvaliacoesRes>(
    `/sales/produtos/${produtoId}/avaliacoes`,
  )
  return response.data
}
