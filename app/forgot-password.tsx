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
import { useMutation } from '@tanstack/react-query'
import * as SMS from 'expo-sms'
import { Ionicons } from '@expo/vector-icons'
import {
  requestPasswordResetToken,
  validatePasswordResetToken,
  resetPassword,
} from '@/services/auth'

type Step = 'email' | 'token' | 'newPassword'

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')

  // Solicitar token de recuperação
  const { mutate: mutateRequestToken, isPending: isRequestingToken } =
    useMutation({
      mutationFn: requestPasswordResetToken,
      onSuccess: async (data) => {
        setPhoneNumber(data.telefone)

        // Enviar SMS usando expo-sms
        const isAvailable = await SMS.isAvailableAsync()
        if (isAvailable) {
          const { result } = await SMS.sendSMSAsync(
            [data.telefone],
            `Seu código de recuperação de senha é: ${data.token}. Não compartilhe este código com ninguém.`,
          )

          if (result === 'sent') {
            Alert.alert(
              'SMS Enviado',
              `Token enviado para ${data.telefone}. Verifique sua mensagem.`,
            )
            setStep('token')
          } else {
            Alert.alert(
              'Erro',
              'Não foi possível enviar o SMS. Tente novamente.',
            )
          }
        } else {
          Alert.alert(
            'SMS não disponível',
            'O serviço de SMS não está disponível neste dispositivo.',
          )
        }
      },
      onError: (error: unknown) => {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          'Não foi possível encontrar um usuário com este email.'
        Alert.alert('Erro', errorMessage)
      },
    })

  const { mutate: mutateValidateToken, isPending: isValidatingToken } =
    useMutation({
      mutationFn: validatePasswordResetToken,
      onSuccess: () => {
        setStep('newPassword')
      },
      onError: (error: unknown) => {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Token inválido. Tente novamente.'
        Alert.alert('Erro', errorMessage)
      },
    })

  // Redefinir senha
  const { mutate: mutateResetPassword, isPending: isResettingPassword } =
    useMutation({
      mutationFn: resetPassword,
      onSuccess: () => {
        Alert.alert('Sucesso', 'Senha redefinida com sucesso!', [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ])
      },
      onError: (error: unknown) => {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          'Não foi possível redefinir a senha. Tente novamente.'
        Alert.alert('Erro', errorMessage)
      },
    })

  const handleRequestToken = () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, insira seu email')
      return
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um email válido')
      return
    }

    mutateRequestToken({ email })
  }

  const handleValidateToken = () => {
    if (!token?.length || token.length !== 6) {
      Alert.alert('Erro', 'Por favor, insira o token de 6 dígitos')
      return
    }

    mutateValidateToken({ email, token })
  }

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos')
      return
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem')
      return
    }

    mutateResetPassword({ email, token, novaSenha: newPassword })
  }

  const renderEmailStep = () => (
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

      <TouchableOpacity
        className={`bg-frgprimary rounded-xl py-4 mt-4 ${
          isRequestingToken ? 'opacity-70' : ''
        }`}
        onPress={handleRequestToken}
        disabled={isRequestingToken}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {isRequestingToken ? 'Enviando...' : 'Enviar Token'}
        </Text>
      </TouchableOpacity>
    </View>
  )

  const renderTokenStep = () => (
    <View className="gap-6">
      <View>
        <Text className="text-black font-medium mb-2">
          Token enviado para {phoneNumber}
        </Text>
        <TextInput
          className="bg-gray-300 border border-gray-400 rounded-xl px-4 py-4 text-black text-center text-2xl font-bold tracking-widest"
          placeholder="000000"
          placeholderTextColor="#6B7280"
          value={token}
          onChangeText={(text) =>
            setToken(text.replaceAll(/\D/g, '').slice(0, 6))
          }
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />
      </View>

      <TouchableOpacity
        className={`bg-frgprimary rounded-xl py-4 mt-4 ${
          isValidatingToken ? 'opacity-70' : ''
        }`}
        onPress={handleValidateToken}
        disabled={isValidatingToken}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {isValidatingToken ? 'Validando...' : 'Validar Token'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="self-center mt-4"
        onPress={handleRequestToken}
        disabled={isRequestingToken}
      >
        <Text className="text-frgprimary font-medium">Reenviar token</Text>
      </TouchableOpacity>
    </View>
  )

  const renderNewPasswordStep = () => (
    <View className="gap-6">
      <View>
        <Text className="text-black font-medium mb-2">Nova Senha</Text>
        <View className="relative">
          <TextInput
            className="bg-gray-300 border border-gray-400 rounded-xl px-4 py-4 text-base pr-12 text-black"
            placeholder="Digite sua nova senha"
            placeholderTextColor="#6B7280"
            value={newPassword}
            onChangeText={setNewPassword}
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

      <View>
        <Text className="text-black font-medium mb-2">Confirmar Senha</Text>
        <View className="relative">
          <TextInput
            className="bg-gray-300 border border-gray-400 rounded-xl px-4 py-4 text-base pr-12 text-black"
            placeholder="Confirme sua nova senha"
            placeholderTextColor="#6B7280"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ position: 'absolute', right: 16, top: 16 }}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        className={`bg-frgprimary rounded-xl py-4 mt-4 ${
          isResettingPassword ? 'opacity-70' : ''
        }`}
        onPress={handleResetPassword}
        disabled={isResettingPassword}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {isResettingPassword ? 'Redefinindo...' : 'Redefinir Senha'}
        </Text>
      </TouchableOpacity>
    </View>
  )

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
              <TouchableOpacity
                onPress={() => router.back()}
                className="absolute left-0 top-0 bg-gray-200 rounded-full p-2"
              >
                <Ionicons name="arrow-back" size={24} color="#437C99" />
              </TouchableOpacity>
              <Text className="text-2xl text-gray-900 font-bold text-center">
                Recuperar Senha
              </Text>
              <Text className="text-sm text-gray-600 text-center mt-2">
                {step === 'email' && 'Digite seu email para receber o token'}
                {step === 'token' && 'Digite o token recebido por SMS'}
                {step === 'newPassword' && 'Digite sua nova senha'}
              </Text>
            </View>

            {step === 'email' && renderEmailStep()}
            {step === 'token' && renderTokenStep()}
            {step === 'newPassword' && renderNewPasswordStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
