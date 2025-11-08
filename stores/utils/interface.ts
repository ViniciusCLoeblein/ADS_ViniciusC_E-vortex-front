import { LoginRes } from '@/services/auth/interface'

export interface User {
  id: string
  name: string
  email: string
}

export interface AuthStoreProps {
  accessToken: string | null
  accessTokenExpiresAt: string | null
  userId: string | null
  user: User | null
  hydrated: boolean
  setAuth: (data: LoginRes) => void
  clearAuth: () => void
  updateUser: (user: User) => void
  setHydrated: (value: boolean) => void
}
