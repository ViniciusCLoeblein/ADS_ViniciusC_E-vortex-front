import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { usePathname, router } from 'expo-router'
import { useAuthStore } from '@/stores/auth'

export default function NotFoundScreen() {
  const { accessToken } = useAuthStore()
  const pathname = usePathname?.() ?? ''

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(accessToken ? '/home' : '/login')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center mb-8">
          <View className="w-32 h-32 bg-frgprimary/10 rounded-full items-center justify-center mb-6">
            <Ionicons name="alert-circle-outline" size={64} color="#437C99" />
          </View>

          <Text className="text-frg900 font-bold text-4xl mb-3">404</Text>
          <Text className="text-frg900 font-bold text-2xl mb-3 text-center">
            Página não encontrada
          </Text>
          <Text className="text-system-text text-base text-center mb-2">
            Ops! A página que você está procurando não existe.
          </Text>
          <Text className="text-system-text text-sm text-center opacity-75 mb-2">
            Verifique o endereço e tente novamente.
          </Text>
          {pathname ? (
            <Text className="text-system-text text-xs text-center opacity-90 italic">
              Você tentou acessar:{' '}
              <Text className="font-semibold text-frgprimary break-all">
                {pathname}
              </Text>
            </Text>
          ) : null}
        </View>

        <View className="w-full gap-3">
          <TouchableOpacity
            className="bg-frgprimary rounded-xl py-4 flex-row items-center justify-center"
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              Voltar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border-2 border-gray-200 rounded-xl py-4 flex-row items-center justify-center"
            onPress={() => {
              if (accessToken) {
                router.replace('/home')
              } else {
                router.replace('/login')
              }
            }}
          >
            <Ionicons name="home-outline" size={20} color="#437C99" />
            <Text className="text-frgprimary font-semibold text-lg ml-2">
              Ir para {accessToken ? 'Home' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
