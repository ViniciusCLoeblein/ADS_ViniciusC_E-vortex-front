import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Link } from 'expo-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { login } from '@/services/auth'
import { useAuthStore } from '@/stores/auth'
import { useCustomerStore } from '@/stores/customer'
import { Ionicons } from '@expo/vector-icons'

export default function LoginScreen() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { setAuth } = useAuthStore()
  const { clearProfile } = useCustomerStore()

  const { mutate: mutateLogin, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (res) => {
      clearProfile()
      queryClient.clear()
      setAuth(res)
      queryClient.invalidateQueries()
      router.replace('/home')
    },
    onError: () => {
      Alert.alert('Erro', 'Falha no login. Tente novamente.')
    },
  })

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos')
      return
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um email válido')
      return
    }

    mutateLogin({ email, senha: password })
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100/90">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-16">
            <View className="items-center mb-12">
              <View className="w-32 h-32 bg-frgprimary/30 rounded-full items-center justify-center mb-4 border-2 border-frgprimary/30">
                <Image
                  source={require('@/assets/images/favicon2.png')}
                  className="w-28 h-28"
                  resizeMode="contain"
                  alt="E-Vortex Logo"
                />
              </View>
              <Text className="text-lg text-gray-900 text-center">
                Faça login para continuar
              </Text>
            </View>

            <View className="gap-6">
              <View>
                <Text className="text-black font-medium mb-2">Email</Text>
                <View className="relative">
                  <TextInput
                    className="bg-gray-300 border border-gray-400 rounded-xl px-4 py-4 text-base text-black"
                    placeholder="Digite seu email"
                    placeholderTextColor="#6B7280"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#6B7280"
                    style={{ position: 'absolute', right: 16, top: 16 }}
                  />
                </View>
              </View>

              <View className="mt-1">
                <Text className="text-black font-medium mb-2">Senha</Text>
                <View className="relative">
                  <TextInput
                    className="bg-gray-300 border border-gray-400 rounded-xl px-4 py-4 text-base pr-12 text-black"
                    placeholder="Digite sua senha"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 16, top: 16 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                className={`bg-frgprimary rounded-xl py-4 mt-4 ${
                  isPending ? 'opacity-70' : ''
                }`}
                onPress={handleLogin}
                disabled={isPending}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {isPending ? 'Entrando...' : 'Entrar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="self-end mt-4"
                onPress={() => router.push('/forgot-password')}
              >
                <Text className="text-frgprimary font-medium">
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row mt-auto mb-8 items-center justify-center">
              <Text className="text-gray-400">
                Não tem uma conta?{' '}
                <Link className="text-frgprimary font-medium" href="/register">
                  Cadastre-se
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
