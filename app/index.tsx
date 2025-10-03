import { useEffect } from 'react'
import { router } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'

export default function IndexScreen() {
  useEffect(() => {
    const checkAuth = async () => {
      setTimeout(() => {
        router.replace('/login')
      }, 1000)
    }

    checkAuth()
  }, [])

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#437C99" />
    </View>
  )
}
