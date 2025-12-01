import { buscarCep } from '@/services/brasilapi'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ==================== FORMATADORES ====================

/**
 * Formata CPF no padrão XXX.XXX.XXX-XX
 */
export const formatCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formata CNPJ no padrão XX.XXX.XXX/XXXX-XX
 */
export const formatCNPJ = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Formata telefone no padrão (XX) XXXXX-XXXX
 */
export const formatPhone = (value: string): string => {
  return value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

/**
 * Formata data no padrão DD/MM/AAAA
 */
export const formatDate = (value: string): string => {
  return value.replace(/\D/g, '').replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3')
}

/**
 * Converte data de DD/MM/AAAA para formato ISO 8601 (AAAA-MM-DD)
 * @param date Data no formato DD/MM/AAAA ou DDMMAAAA
 * @returns Data no formato ISO 8601 (AAAA-MM-DD)
 */
export const convertDateToISO = (date: string): string => {
  const cleanDate = date.replace(/\D/g, '')
  if (cleanDate.length !== 8) {
    throw new Error('Data deve ter 8 dígitos no formato DDMMAAAA')
  }

  const day = cleanDate.substring(0, 2)
  const month = cleanDate.substring(2, 4)
  const year = cleanDate.substring(4, 8)

  const dayNum = parseInt(day, 10)
  const monthNum = parseInt(month, 10)
  const yearNum = parseInt(year, 10)

  if (
    dayNum < 1 ||
    dayNum > 31 ||
    monthNum < 1 ||
    monthNum > 12 ||
    yearNum < 1900
  ) {
    throw new Error('Data inválida')
  }

  // Retorna no formato ISO 8601: AAAA-MM-DD
  return `${year}-${month}-${day}`
}

/**
 * Formata CEP no padrão XXXXX-XXX
 */
export const formatCEP = (value: string): string => {
  return value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2')
}

// ==================== VALIDADORES ====================

/**
 * Valida se o email tem formato válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida se o CPF tem formato válido (apenas formato, não dígitos verificadores)
 */
export const isValidCPFFormat = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '')
  return cleanCPF.length === 11
}

/**
 * Valida se o CNPJ tem formato válido (apenas formato, não dígitos verificadores)
 */
export const isValidCNPJFormat = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '')
  return cleanCNPJ.length === 14
}

/**
 * Valida se o telefone tem formato válido
 */
export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '')
  return cleanPhone.length === 11
}

/**
 * Valida se a data tem formato válido DD/MM/AAAA
 */
export const isValidDateFormat = (date: string): boolean => {
  const cleanDate = date.replace(/\D/g, '')
  if (cleanDate.length !== 8) return false

  const day = parseInt(cleanDate.substring(0, 2))
  const month = parseInt(cleanDate.substring(2, 4))
  const year = parseInt(cleanDate.substring(4, 8))

  if (day < 1 || day > 31) return false
  if (month < 1 || month > 12) return false
  if (year < 1900 || year > new Date().getFullYear()) return false

  return true
}

/**
 * Valida se a senha atende aos critérios mínimos
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6
}

/**
 * Valida se as senhas coincidem
 */
export const doPasswordsMatch = (
  password: string,
  confirmPassword: string,
): boolean => {
  return password === confirmPassword
}

// ==================== VALIDADORES DE FORMULÁRIO ====================

export interface CustomerFormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  birthDate: string
  cpf: string
  acceptMarketing: boolean
}

export interface SellerFormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  cnpj: string
  companyName: string
  tradeName: string
  stateRegistration: string
  bankAccount?: {
    bank: string
    agency: string
    account: string
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Valida formulário de cliente
 */
export const validateCustomerForm = (
  formData: CustomerFormData,
): ValidationResult => {
  const errors: string[] = []

  // Campos obrigatórios
  if (!formData.name.trim()) errors.push('Nome é obrigatório')
  if (!formData.email.trim()) errors.push('Email é obrigatório')
  if (!formData.phone.trim()) errors.push('Telefone é obrigatório')
  if (!formData.password) errors.push('Senha é obrigatória')
  if (!formData.confirmPassword) {
    errors.push('Confirmação de senha é obrigatória')
  }
  if (!formData.birthDate.trim()) {
    errors.push('Data de nascimento é obrigatória')
  }
  if (!formData.cpf.trim()) errors.push('CPF é obrigatório')

  // Validações de formato
  if (formData.email && !isValidEmail(formData.email)) {
    errors.push('Email deve ter formato válido')
  }

  if (formData.cpf && !isValidCPFFormat(formData.cpf)) {
    errors.push('CPF deve ter 11 dígitos')
  }

  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.push('Telefone deve ter formato válido')
  }

  if (formData.birthDate && !isValidDateFormat(formData.birthDate)) {
    errors.push('Data de nascimento deve ter formato DD/MM/AAAA')
  }

  if (formData.password && !isValidPassword(formData.password)) {
    errors.push('Senha deve ter pelo menos 6 caracteres')
  }

  if (
    formData.password &&
    formData.confirmPassword &&
    !doPasswordsMatch(formData.password, formData.confirmPassword)
  ) {
    errors.push('As senhas não coincidem')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida formulário de vendedor
 */
export const validateSellerForm = (
  formData: SellerFormData,
): ValidationResult => {
  const errors: string[] = []

  // Campos obrigatórios
  if (!formData.name.trim()) errors.push('Nome é obrigatório')
  if (!formData.email.trim()) errors.push('Email é obrigatório')
  if (!formData.phone.trim()) errors.push('Telefone é obrigatório')
  if (!formData.password) errors.push('Senha é obrigatória')
  if (!formData.confirmPassword) {
    errors.push('Confirmação de senha é obrigatória')
  }
  if (!formData.cnpj.trim()) errors.push('CNPJ é obrigatório')
  if (!formData.companyName.trim()) {
    errors.push('Razão social é obrigatória')
  }
  if (!formData.tradeName.trim()) {
    errors.push('Nome fantasia é obrigatório')
  }
  if (!formData.stateRegistration.trim()) {
    errors.push('Inscrição estadual é obrigatória')
  }

  // Validações de formato
  if (formData.email && !isValidEmail(formData.email)) {
    errors.push('Email deve ter formato válido')
  }

  if (formData.cnpj && !isValidCNPJFormat(formData.cnpj)) {
    errors.push('CNPJ deve ter 14 dígitos')
  }

  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.push('Telefone deve ter formato válido')
  }

  if (formData.password && !isValidPassword(formData.password)) {
    errors.push('Senha deve ter pelo menos 6 caracteres')
  }

  if (
    formData.password &&
    formData.confirmPassword &&
    !doPasswordsMatch(formData.password, formData.confirmPassword)
  ) {
    errors.push('As senhas não coincidem')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ==================== UTILITÁRIOS DE FORMATAÇÃO ====================

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export const removeNonNumeric = (value: string): string => {
  return value.replace(/\D/g, '')
}

/**
 * Limita o comprimento de uma string
 */
export const limitLength = (value: string, maxLength: number): string => {
  return value.substring(0, maxLength)
}

/**
 * Capitaliza a primeira letra de cada palavra
 */
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Converte string para título (primeira letra maiúscula)
 */
export const toTitleCase = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 * @param lat1 Latitude do ponto 1
 * @param lon1 Longitude do ponto 1
 * @param lat2 Latitude do ponto 2
 * @param lon2 Longitude do ponto 2
 * @returns Distância em quilômetros
 */
export const calcularDistanciaKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distancia = R * c
  return Math.round(distancia * 100) / 100
}

/**
 * Calcula o frete baseado na distância entre dois CEPs
 * @param cepOrigem CEP de origem (loja/vendedor)
 * @param cepDestino CEP de destino (cliente)
 * @returns Valor do frete em reais (R$ 5,00 por km)
 */
export const calcularFrete = async (
  cepOrigem: string,
  cepDestino: string,
): Promise<number> => {
  try {
    const cepOrigemLimpo = cepOrigem.replace(/\D/g, '')
    const cepDestinoLimpo = cepDestino.replace(/\D/g, '')
    const valorFretePorKm = 5

    if (cepOrigemLimpo.length !== 8 || cepDestinoLimpo.length !== 8) {
      throw new Error('CEPs devem conter 8 dígitos')
    }

    const [origemData, destinoData] = await Promise.all([
      buscarCep(cepOrigemLimpo),
      buscarCep(cepDestinoLimpo),
    ])

    if (
      !origemData.location?.coordinates?.latitude ||
      !origemData.location?.coordinates?.longitude ||
      !destinoData.location?.coordinates?.latitude ||
      !destinoData.location?.coordinates?.longitude
    ) {
      throw new Error('Coordenadas não encontradas para um ou ambos os CEPs')
    }

    const latOrigem = parseFloat(origemData.location.coordinates.latitude)
    const lonOrigem = parseFloat(origemData.location.coordinates.longitude)
    const latDestino = parseFloat(destinoData.location.coordinates.latitude)
    const lonDestino = parseFloat(destinoData.location.coordinates.longitude)

    const distanciaKm = calcularDistanciaKm(
      latOrigem,
      lonOrigem,
      latDestino,
      lonDestino,
    )

    const valorFrete = distanciaKm * valorFretePorKm

    return Math.round(valorFrete * 100) / 100
  } catch (error) {
    console.error('Erro ao calcular frete:', error)
    throw error
  }
}
