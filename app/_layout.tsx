import '../global.css'
import { useEffect, useCallback } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useFonts } from 'expo-font'
import * as Notifications from 'expo-notifications'
import { SystemBars } from 'react-native-edge-to-edge'

SplashScreen.preventAutoHideAsync()

SplashScreen.setOptions({
  duration: 500,
  fade: true,
})

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }
  },
})

export default function RootLayout() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 3,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: 1,
      },
    },
  })

  const [fontsLoaded] = useFonts({
    'Fustat-Regular': require('@/assets/fonts/Fustat-Regular.ttf'),
    'Fustat-Bold': require('@/assets/fonts/Fustat-Bold.ttf'),
    'Fustat-Medium': require('@/assets/fonts/Fustat-Medium.ttf'),
  })

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  useEffect(() => {
    onLayoutRootView()
  }, [onLayoutRootView])

  if (!fontsLoaded) {
    return null
  }

  return (
    <>
      <SystemBars style="dark" />
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
            <Stack.Screen name="cart" options={{ headerShown: false }} />
            <Stack.Screen name="mannequin" options={{ headerShown: false }} />
            <Stack.Screen
              name="+not-found"
              options={{
                freezeOnBlur: false,
              }}
            />
          </Stack>
        </SafeAreaProvider>
      </QueryClientProvider>
      <Toast position="top" topOffset={50} autoHide visibilityTime={5000} />
    </>
  )
}
