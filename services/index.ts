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
      msgToast = status ? status() : handleGenericError()
    } else {
      msgToast = 'Erro desconhecido'
      msgError = 'Erro desconhecido'
    }

    if (msgToast) {
      toast.error('Ocorreu um erro!', msgToast)
    }

    return Promise.reject(new Error(msgError, { cause: { message: msgError } }))
  },
)

export default instance
