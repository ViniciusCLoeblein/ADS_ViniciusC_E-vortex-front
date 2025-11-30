import { useEffect } from 'react'
import { router } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useAuthStore } from '@/stores/auth'
import * as Notifications from 'expo-notifications'

export default function IndexScreen() {
  const { accessToken, hydrated } = useAuthStore()
  const lastNotificationResponse = Notifications.useLastNotificationResponse()

  useEffect(() => {
    if (!hydrated) {
      return
    }

    const checkAuth = () => {
      router.replace(accessToken ? '/home' : '/login')
    }

    if (
      lastNotificationResponse &&
      lastNotificationResponse.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER &&
      lastNotificationResponse.notification.request.content.title
    ) {
      Notifications.clearLastNotificationResponseAsync()
      router.replace('/+not-found')
    } else {
      checkAuth()
    }
  }, [hydrated, accessToken, lastNotificationResponse])

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#437C99" />
    </View>
  )
}
