// Message Response (comum)
export interface MessageRes {
  message: string
}

// Carrinho
export interface ItemCarrinhoRes {
  id: string
  produtoId: string
  variacaoId?: string
  quantidade: number
  precoUnitario: number
  subtotal: number
  produto?: {
    id: string
    nome: string
    imagemPrincipal?: string
  }
  variacao?: {
    id: string
    nome: string
    preco: number
  }
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

export interface ProdutoRes {
  id: string
  nome: string
  descricao?: string
  preco: number
  precoPromocional?: number
  categoriaId: string
  categoria?: {
    id: string
    nome: string
  }
  vendedorId: string
  vendedor?: {
    id: string
    nome: string
  }
  imagemPrincipal?: string
  imagens?: string[]
  estoque: number
  ativo: boolean
  favoritado?: boolean
  createdAt: string
  updatedAt: string
}

export interface ProdutoListagemRes {
  produtos: ProdutoRes[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

export interface VariacaoRes {
  id: string
  produtoId: string
  nome: string
  descricao?: string
  preco: number
  precoPromocional?: number
  estoque: number
  sku?: string
  ativa: boolean
  createdAt: string
  updatedAt: string
}

export interface ImagemRes {
  id: string
  produtoId: string
  url: string
  tipo: 'principal' | 'galeria' | 'miniatura'
  legenda?: string
  ordem: number
  createdAt: string
}

export interface ProdutoDetalheRes extends ProdutoRes {
  variacoes?: VariacaoRes[]
  imagens?: ImagemRes['url'][]
}

export interface CriarProdutoReq {
  nome: string
  descricao?: string
  preco: number
  precoPromocional?: number
  categoriaId: string
  estoque: number
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
  tipo: 'principal' | 'galeria' | 'miniatura'
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
  tipo: 'principal' | 'galeria' | 'miniatura'
  legenda?: string
  ordem: number
  createdAt: string
}
