import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CustomerProfileRes } from '@/services/customer/interface'

interface CustomerStoreProps {
  profile: CustomerProfileRes | null
  hydrated: boolean
  setProfile: (profile: CustomerProfileRes) => void
  clearProfile: () => void
  setHydrated: (value: boolean) => void
}

export const useCustomerStore = create<CustomerStoreProps>()(
  persist(
    (set) => ({
      profile: null,
      hydrated: false,

      setProfile: (profile) => {
        set({ profile })
      },

      clearProfile: () => {
        set({ profile: null })
      },

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: 'customer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)

