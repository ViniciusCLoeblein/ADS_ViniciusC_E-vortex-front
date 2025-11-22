// Message Response (comum)
export interface MessageRes {
  message: string
}

// Tipo de Imagem
export type TipoImagem = 'principal' | 'galeria' | 'miniatura'

export interface VariacaoRes {
  id: string
  tipo: string
  valor: string
  sku: string
  precoAdicional: string
  estoque: number
}

export interface ImagemRes {
  id: string
  url: string
  tipo: string
  legenda: string
}

export interface ProdutoRes {
  id: string
  uuid: string
  nome: string
  descricaoCurta: string
  preco: string
  precoPromocional: string
  avaliacaoMedia: string
  totalAvaliacoes: number
  estoque: number
  variacoes: VariacaoRes[]
  imagens: ImagemRes[]
}

export interface ItemCarrinhoRes {
  id: string
  precoUnitario: number
  produto: ProdutoRes
  produtoId: string
  quantidade: number
  variacao: VariacaoRes | null
  variacaoId: string | null
}

export interface CarrinhoRes {
  id: string
  usuarioId: string
  itens: ItemCarrinhoRes[]
  total: number
  quantidadeItens: number
}

export interface AdicionarItemCarrinhoReq {
  produtoId: string
  variacaoId?: string
  quantidade: number
}

export interface AtualizarItemCarrinhoReq {
  quantidade: number
}

export interface ProdutoListagemRes {
  produtos: ProdutoRes[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

export interface ProdutoDetalheRes {
  avaliacaoMedia: string
  descricao: string
  descricaoCurta: string
  estoque: number
  id: string
  imagens: ImagemRes[]
  nome: string
  preco: string
  precoPromocional: string
  sku: string
  totalAvaliacoes: number
  uuid: string
  variacoes: VariacaoRes[]
}

export interface CriarProdutoReq {
  categoriaId: string
  sku: string
  nome: string
  descricao: string
  descricaoCurta: string
  preco: number
  precoPromocional?: number
  pesoKg: number
  alturaCm: number
  larguraCm: number
  profundidadeCm: number
  estoque: number
  estoqueMinimo: number
  tags?: string
  destaque?: boolean
  ativo?: boolean
}

export interface AtualizarProdutoReq {
  nome?: string
  descricao?: string
  preco?: number
  precoPromocional?: number
  categoriaId?: string
  estoque?: number
  ativo?: boolean
}

export interface ListarProdutosReq {
  pagina?: number
  limite?: number
  categoriaId?: string
  vendedorId?: string
  busca?: string
  ordenarPor?: 'nome' | 'preco' | 'data'
  ordem?: 'asc' | 'desc'
  apenasAtivos?: boolean
}

export interface ProdutoCriadoRes {
  id: string
  nome: string
  descricao?: string
  preco: number
  precoPromocional?: number
  categoriaId: string
  vendedorId: string
  estoque: number
  ativo: boolean
  createdAt: string
  updatedAt: string
}

// Favoritos
export interface FavoritosRes {
  favoritos: {
    id: string
    produtoId: string
    produto: ProdutoRes
    createdAt: string
  }[]
  total: number
}

export interface CategoriaRes {
  id: string
  nome: string
  descricao?: string
  imagem?: string
  ativa: boolean
  createdAt: string
  updatedAt: string
}

export interface ListaCategoriasRes {
  categorias: CategoriaRes[]
  total: number
}

export interface CriarCategoriaReq {
  nome: string
  descricao?: string
  imagem?: string
  ativa?: boolean
}

export interface AtualizarCategoriaReq {
  nome?: string
  descricao?: string
  imagem?: string
  ativa?: boolean
}

// Variações

export interface ListaVariacoesRes {
  variacoes: VariacaoRes[]
  total: number
}

export interface CriarVariacaoReq {
  produtoId: string
  nome: string
  descricao?: string
  preco: number
  precoPromocional?: number
  estoque: number
  sku?: string
  ativa?: boolean
}

export interface AtualizarVariacaoReq {
  nome?: string
  descricao?: string
  preco?: number
  precoPromocional?: number
  estoque?: number
  sku?: string
  ativa?: boolean
}

export interface ListaImagensRes {
  imagens: ImagemRes[]
  total: number
}

export interface CriarImagemReq {
  produtoId: string
  tipo: TipoImagem
  legenda?: string
  ordem?: number
  file: {
    uri: string
    type?: string
    name?: string
  }
}

export interface ImagemUploadRes {
  id: string
  produtoId: string
  url: string
  tipo: TipoImagem
  legenda?: string
  ordem: number
  createdAt: string
}
