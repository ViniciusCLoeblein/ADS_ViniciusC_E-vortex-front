export interface CepResponse {
  cep: string
  state: string
  city: string
  neighborhood: string
  street: string
  location: {
    type: string
    coordinates: {
      longitude: string
      latitude: string
    }
  }
}

export async function buscarCep(cep: string): Promise<CepResponse> {
  // Remove formatação do CEP (apenas números)
  const cepNumbers = cep.replace(/\D/g, '')

  if (cepNumbers.length !== 8) {
    throw new Error('CEP deve conter 8 dígitos')
  }

  const response = await fetch(
    `https://brasilapi.com.br/api/cep/v2/${cepNumbers}`,
  )

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('CEP não encontrado')
    }
    throw new Error('Erro ao buscar CEP')
  }

  return response.json()
}

export interface CnpjResponse {
  uf: string
  cep: string
  qsa: Array<{
    pais: string | null
    nome_socio: string
    codigo_pais: number | null
    faixa_etaria: string
    cnpj_cpf_do_socio: string
    qualificacao_socio: string
    codigo_faixa_etaria: number
    data_entrada_sociedade: string
    identificador_de_socio: number
    cpf_representante_legal: string
    nome_representante_legal: string
    codigo_qualificacao_socio: number
    qualificacao_representante_legal: string
    codigo_qualificacao_representante_legal: number
  }>
  cnpj: string
  pais: string | null
  email: string | null
  porte: string
  bairro: string
  numero: string
  ddd_fax: string
  municipio: string
  logradouro: string
  cnae_fiscal: number
  codigo_pais: number | null
  complemento: string
  codigo_porte: number
  razao_social: string
  nome_fantasia: string
  capital_social: number
  ddd_telefone_1: string
  ddd_telefone_2: string
  opcao_pelo_mei: string | null
  descricao_porte: string
  codigo_municipio: number
  cnaes_secundarios: Array<{
    codigo: number
    descricao: string
  }>
  natureza_juridica: string
  regime_tributario: Array<{
    ano: number
    cnpj_da_scp: string | null
    forma_de_tributacao: string
    quantidade_de_escrituracoes: number
  }>
  situacao_especial: string
  opcao_pelo_simples: string | null
  situacao_cadastral: number
  data_opcao_pelo_mei: string | null
  data_exclusao_do_mei: string | null
  cnae_fiscal_descricao: string
  codigo_municipio_ibge: number
  data_inicio_atividade: string
  data_situacao_especial: string | null
  data_opcao_pelo_simples: string | null
  data_situacao_cadastral: string
  nome_cidade_no_exterior: string
  codigo_natureza_juridica: number
  data_exclusao_do_simples: string | null
  motivo_situacao_cadastral: number
  ente_federativo_responsavel: string
  identificador_matriz_filial: number
  qualificacao_do_responsavel: number
  descricao_situacao_cadastral: string
  descricao_tipo_de_logradouro: string
  descricao_motivo_situacao_cadastral: string
  descricao_identificador_matriz_filial: string
}

export async function buscarCnpj(cnpj: string): Promise<CnpjResponse> {
  // Remove formatação do CNPJ (apenas números)
  const cnpjNumbers = cnpj.replace(/\D/g, '')

  if (cnpjNumbers.length !== 14) {
    throw new Error('CNPJ deve conter 14 dígitos')
  }

  const response = await fetch(
    `https://brasilapi.com.br/api/cnpj/v1/${cnpjNumbers}`,
  )

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('CNPJ não encontrado')
    }
    throw new Error('Erro ao buscar CNPJ')
  }

  return response.json()
}

