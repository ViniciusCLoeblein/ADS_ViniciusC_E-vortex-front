import { useEffect } from 'react'
import { router } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useAuthStore } from '@/stores/auth'

export default function IndexScreen() {
  const { accessToken, hydrated } = useAuthStore()

  useEffect(() => {
    if (!hydrated) {
      return
    }

    const checkAuth = () => {
      router.replace(accessToken ? '/home' : '/login')
    }

    checkAuth()
  }, [hydrated, accessToken])

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#437C99" />
    </View>
  )
}
