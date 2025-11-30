import { useEffect } from 'react'
import { BackHandler } from 'react-native'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'

export function useNotificationClickHandler() {
  const router = useRouter()

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (r) => {
        if (r.notification.request.content.title) {
          router.push('/+not-found')
        }
      },
    )

    return () => {
      subscription.remove()
    }
  }, [router])
}

export function useBackHandler(callback: () => boolean) {
  useEffect(() => {
    const onBackPress = () => {
      return callback()
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    )

    return () => {
      subscription.remove()
    }
  }, [callback])
}
