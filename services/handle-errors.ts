import { AxiosError } from 'axios'
import { ApiErrorResponse } from './interface'
import { Linking } from 'react-native'

export const handleUnauthorizedError = (
  error: AxiosError<ApiErrorResponse>,
): string => {
  const url = error?.response?.config?.url
  const urlIgnore = [
    '/auth/token',
    '/auth/verify-two-factor-code',
    '/auth/verify-already-customer',
  ]

  const message = Array.isArray(error?.response?.data?.message)
    ? error.response.data.message.join(' | ')
    : (error?.response?.data?.message ?? 'Não autorizado!')

  const msg =
    error?.response?.data?.path === '/auth/token'
      ? message
      : 'Sua sessão expirou, faça login novamente!'

  if (urlIgnore.includes(url ?? '')) {
    return ''
  } else {
    Linking.openURL('evortex://login')
    return msg.replace('UnauthorizedException:', '').trim()
  }
}

export const handleNotFoundError = (
  error: AxiosError<ApiErrorResponse>,
): string => {
  const msg = Array.isArray(error.response?.data?.message)
    ? error.response.data.message[0]
    : (error.response?.data?.message ?? 'Recurso não encontrado.')

  return msg.replace('NotFoundException:', '').trim()
}

export const handleBadRequestError = (
  error: AxiosError<ApiErrorResponse>,
): string => {
  const url = error?.response?.config?.url
  const urlIgnore = ['/financial/rules-cpp', '/auth/verify-already-customer']
  const messages = error.response?.data?.message

  let msg = ''

  if (urlIgnore.includes(url ?? '')) {
    return ''
  }

  if (Array.isArray(messages) && messages.length > 0) {
    msg += messages[0]
  } else {
    msg = error.response?.data?.message as string
  }

  return msg || 'Requisição inválida. Verifique os dados enviados.'
}

export const handleUnprocessableEntityError = (
  error: AxiosError<ApiErrorResponse>,
): string => {
  const messages = error.response?.data?.message
  let msg = ''

  if (Array.isArray(messages) && messages.length > 0) {
    msg = messages[0]
  } else {
    msg = error.response?.data?.message as string
  }
  return msg || 'Erro de validação. Verifique os dados fornecidos.'
}

export const handleGenericError = (): string => {
  const msg = 'Ocorreu um erro inesperado, tente novamente mais tarde'
  return msg
}

export const handleFailedError = (): string => {
  return 'Falha ao se comunicar com a ADM!'
}

export const handleToManyRequest = (): string => {
  return 'Ops! Detectamos muitas tentativas. Por favor, aguarde alguns minutos e tente novamente.'
}

export const handleServerError = (): string => {
  return 'Ocorreu um erro no servidor. Por favor, tente novamente mais tarde. Se o problema persistir, entre em contato com o suporte.'
}

export const handleBadGatewayError = (): string => {
  return 'Serviço em manutenção. Por favor, tente novamente mais tarde. Se o problema persistir, entre em contato com o suporte.'
}

export const handleTimeoutError = (): string => {
  return 'Timeout da requisição, verifique sua conexão com a internet'
}
