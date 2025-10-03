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
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos')
      return
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um email válido')
      return
    }

    setIsLoading(true)

    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1500))

      router.replace('/home')
    } catch (error) {
      Alert.alert('Erro', 'Falha no login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
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

            <View className="space-y-6">
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

              <View>
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

              <TouchableOpacity className="self-end">
                <Text className="text-frgprimary font-medium">
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`bg-frgprimary rounded-xl py-4 ${
                  isLoading ? 'opacity-70' : ''
                }`}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="mx-4 text-system-text">ou</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              <View className="space-y-3">
                <TouchableOpacity className="bg-white border border-gray-200 rounded-xl py-4 flex-row items-center justify-center">
                  <Ionicons name="logo-google" size={20} color="#DB4437" />
                  <Text className="text-frg900 font-medium ml-3">
                    Continuar com Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity className="bg-white border border-gray-200 rounded-xl py-4 flex-row items-center justify-center">
                  <Ionicons name="logo-apple" size={20} color="#000" />
                  <Text className="text-frg900 font-medium ml-3">
                    Continuar com Apple
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-8 items-center">
              <Text className="text-system-text">
                Não tem uma conta?{' '}
                <Text className="text-frgprimary font-medium">Cadastre-se</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
