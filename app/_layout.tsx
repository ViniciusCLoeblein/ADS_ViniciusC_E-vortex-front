import '../global.css'
import 'react-native-reanimated'
import { useEffect, useCallback } from 'react'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'

import { QueryClient } from '@tanstack/react-query'
import { AuthProvider } from '@/providers/auth'
import { QueryClientProvider } from '@tanstack/react-query'
import { HeaderProvider } from '@/providers/header'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { TabsProvider } from '@/providers/tabs'
import Toast from 'react-native-toast-message'
import { useFonts } from 'expo-font'
import { NotificationProvider } from '@/providers/notifications'
import * as Notifications from 'expo-notifications'
import { SystemBars } from 'react-native-edge-to-edge'
import AnimatedHeader from '@/components/header'

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
          <AuthProvider>
            <HeaderProvider>
              <TabsProvider>
                <NotificationProvider>
                  <Stack
                    screenOptions={{
                      animation: 'fade',
                      header: () => <AnimatedHeader />,
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen
                      name="+not-found"
                      options={{
                        freezeOnBlur: false,
                      }}
                    />
                  </Stack>
                </NotificationProvider>
              </TabsProvider>
            </HeaderProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
      <Toast position="top" topOffset={50} autoHide visibilityTime={5000} />
    </>
  )
}
