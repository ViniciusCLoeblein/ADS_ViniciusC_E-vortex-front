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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Link } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import { login } from '@/services/auth'
import { useAuthStore } from '@/stores/auth'
import { Ionicons } from '@expo/vector-icons'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)

  const { mutate: mutateLogin, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (res) => {
      setAuth(res)
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
    <SafeAreaView className="flex-1 bg-white">
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
              <View className="w-20 h-20 bg-frgprimary rounded-full items-center justify-center mb-4">
                <Ionicons name="storefront" size={40} color="white" />
              </View>
              <Text className="text-3xl font-bold text-frg900 mb-2">
                E-Vortex
              </Text>
              <Text className="text-lg text-system-text text-center">
                Faça login para continuar
              </Text>
            </View>

            <View className="gap-6">
              <View>
                <Text className="text-frg900 font-medium mb-2">Email</Text>
                <View className="relative">
                  <TextInput
                    className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
                    placeholder="Digite seu email"
                    placeholderTextColor="#9FABB9"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#9FABB9"
                    style={{ position: 'absolute', right: 16, top: 16 }}
                  />
                </View>
              </View>

              <View className="mt-1">
                <Text className="text-frg900 font-medium mb-2">Senha</Text>
                <View className="relative">
                  <TextInput
                    className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base pr-12"
                    placeholder="Digite sua senha"
                    placeholderTextColor="#9FABB9"
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
                      color="#9FABB9"
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

              <TouchableOpacity className="self-end mt-4">
                <Text className="text-frgprimary font-medium">
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row mt-auto mb-8 items-center justify-center">
              <Text className="text-system-text">
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
