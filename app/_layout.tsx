import '../global.css'
import { useEffect, useCallback, useState } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useFonts } from 'expo-font'
import * as Notifications from 'expo-notifications'
import { SystemBars } from 'react-native-edge-to-edge'
import Constants from 'expo-constants'
import { CartProvider } from '@/contexts/CartContext'
import { MannequinProvider } from '@/contexts/MannequinContext'

SplashScreen.preventAutoHideAsync()

SplashScreen.setOptions({
  duration: 500,
  fade: true,
})

if (Constants.executionEnvironment !== 'storeClient') {
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
}

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

  const [isMounted, setIsMounted] = useState(false)

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  useEffect(() => {
    onLayoutRootView()
  }, [onLayoutRootView])

  useEffect(() => {
    if (fontsLoaded) {
      const timer = setTimeout(() => {
        setIsMounted(true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  const screens = [
    'index',
    '+not-found',
    'login',
    'register',
    'home',
    'cart',
    'mannequin',
    'profile',
    'profile/addresses',
    'profile/cards',
    'profile/addresses/new',
    'profile/cards/new',
    'products',
    'favorites',
    'seller/products',
    'seller/products/new',
    'seller/categories',
  ]

  return (
    <>
      <SystemBars style="dark" />
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <MannequinProvider>
            <SafeAreaProvider>
              <Stack
                screenOptions={{
                  animation: 'fade',
                }}
              >
                {screens.map((screen) => (
                  <Stack.Screen
                    key={screen}
                    name={screen}
                    options={{ headerShown: false }}
                  />
                ))}
              </Stack>
            </SafeAreaProvider>
          </MannequinProvider>
        </CartProvider>
      </QueryClientProvider>
      {isMounted && (
        <Toast position="top" topOffset={50} autoHide visibilityTime={5000} />
      )}
    </>
  )
}
