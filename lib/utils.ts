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
  cpf: string
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
  if (!formData.cpf.trim()) errors.push('CPF é obrigatório')
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

  if (formData.cpf && !isValidCPFFormat(formData.cpf)) {
    errors.push('CPF deve ter 11 dígitos')
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
