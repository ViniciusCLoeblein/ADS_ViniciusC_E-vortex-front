import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from '@/services'
import { AuthStoreProps } from './utils/interface'

export const useAuthStore = create<AuthStoreProps>()(
  persist(
    (set, get) => ({
      accessToken: null,
      accessTokenExpiresAt: null,
      userId: null,
      user: null,
      hydrated: false,

      setAuth: (data) => {
        const current = get().accessToken
        if (data.accessToken !== current) {
          axios.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`
        }
        set({
          accessToken: data.accessToken,
          accessTokenExpiresAt: data.accessTokenExpiresAt,
          userId: data.userId,
        })
      },

      clearAuth: () => {
        axios.defaults.headers.common.Authorization = undefined
        set({
          accessToken: null,
          accessTokenExpiresAt: null,
          userId: null,
          user: null,
        })
      },

      updateUser: (user) => {
        set({ user })
      },

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        accessTokenExpiresAt: state.accessTokenExpiresAt,
        userId: state.userId,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          axios.defaults.headers.common.Authorization = `Bearer ${state.accessToken}`
        }
        state?.setHydrated(true)
      },
    },
  ),
)
