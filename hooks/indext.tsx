import { useEffect } from 'react'
import { BackHandler } from 'react-native'

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
