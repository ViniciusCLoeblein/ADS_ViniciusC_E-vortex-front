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
  vendedorId: string
  categoriaId: string
  sku: string
  nome: string
  descricao: string
  descricaoCurta: string
  preco: string
  precoPromocional: string
  pesoKg: string
  alturaCm: string
  larguraCm: string
  profundidadeCm: string
  estoque: number
  estoqueMinimo: number
  vendidos: number
  visualizacoes: number
  avaliacaoMedia: string
  totalAvaliacoes: number
  tags: string
  ativo: boolean
  destaque: boolean
  criadoEm: string
  atualizadoEm: string
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

export interface ProdutoDetalheRes extends ProdutoRes {}

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
  ativo: boolean
  atualizado_em: string
  categoria_pai_id: string
  cor_hex: string
  criado_em: string
  descricao: string
  icone: string
  id: string
  nome: string
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

export interface VendedorPublicoRes {
  id: string
  uuid: string
  nomeFantasia: string
  razaoSocial: string
  status: string
  dataAprovacao: Date | null
  criadoEm: Date
}

export interface ListaVendedoresRes {
  vendedores: VendedorPublicoRes[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

export interface CriarAvaliacaoReq {
  pedidoId: string
  produtoId: string
  nota: number
  titulo?: string
  comentario?: string
}

export interface AvaliacaoRes {
  id: string
  produtoId: string
  usuarioId?: string
  usuarioNome?: string
  nota: number
  titulo: string | null
  comentario: string | null
  respostaVendedor: string | null
  dataResposta: Date | null
  criadoEm: Date
}

export interface AvaliacaoCriadaRes {
  id: string
  pedidoId: string
  produtoId: string
  usuarioId: string
  nota: number
  titulo: string | null
  comentario: string | null
  aprovada: boolean | null
  criadoEm: Date
}

export interface ListaAvaliacoesRes {
  avaliacoes: AvaliacaoRes[]
  total: number
}