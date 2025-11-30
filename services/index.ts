import { toast } from '@/functions'
import {
  handleFailedError,
  handleGenericError,
  handleNotFoundError,
  handleBadRequestError,
  handleUnauthorizedError,
  handleUnprocessableEntityError,
  handleToManyRequest,
  handleServerError,
  handleBadGatewayError,
  handleTimeoutError,
} from './handle-errors'
import axios from 'axios'
import { ENV } from '@/constants/config'

const instance = axios.create({
  baseURL: ENV.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

instance.interceptors.response.use(
  (response) => Promise.resolve(response),
  (e) => {
    let msgToast: string
    let msgError: string
    const isNetworkError =
      (e?.code && `${e.code}`.toUpperCase() === 'ERR_NETWORK') ||
      /network/i.test(e?.message || '')

    if (!ENV.BASE_URL) {
      const error = 'URL base não configurada'
      msgToast = error
      msgError = error
      toast.error('Erro de configuração!', msgToast)
      return Promise.reject(new Error(msgToast))
    }

    if (e?.response) {
      const validStatus: Record<number, () => string> = {
        0: () => handleFailedError(),
        400: () => handleBadRequestError(e),
        401: () => handleUnauthorizedError(e),
        404: () => handleNotFoundError(e),
        408: () => handleTimeoutError(),
        422: () => handleUnprocessableEntityError(e),
        429: () => handleToManyRequest(),
        500: () => handleServerError(),
        502: () => handleBadGatewayError(),
      }

      const status = validStatus[e.response.status as keyof typeof validStatus]
      msgError = e.response?.data?.message ?? ''
      console.warn('msgError', msgError)
      msgToast = status ? status() : handleGenericError()
    } else {
      msgToast = isNetworkError
        ? 'Falha de rede. Verifique conexão/HTTPS ou cleartext no Android.'
        : 'Erro desconhecido'
      msgError = e?.message || 'Erro desconhecido'
    }

    if (msgToast) {
      console.error(
        'Ocorreu um erro!',
        `${ENV?.BASE_URL}${e?.response?.config?.url} - ${msgToast}`,
      )
    }

    return Promise.reject(new Error(msgError))
  },
)

export default instance
