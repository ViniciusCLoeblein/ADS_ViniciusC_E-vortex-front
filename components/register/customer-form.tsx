import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import {
  formatCPF,
  formatPhone,
  formatDate,
  convertDateToISO,
  validateCustomerForm,
  type CustomerFormData,
} from '@/lib/utils'
import { registerCustomer } from '@/services/auth'
import type { RegisterCustomerReq } from '@/services/auth/interface'

interface CustomerFormProps {
  onSuccess: (credentials?: { email: string; password: string }) => void
}

export default function CustomerForm({ onSuccess }: CustomerFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [form, setForm] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    cpf: '',
    acceptMarketing: false,
  })

  const registerCustomerMutation = useMutation({
    mutationFn: registerCustomer,
    onSuccess: () => {
      onSuccess({
        email: form.email,
        password: form.password,
      })
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Erro ao registrar cliente'
      Alert.alert('Erro', errorMessage)
    },
  })

  const handleValidation = () => {
    const validation = validateCustomerForm(form)

    if (!validation.isValid) {
      Alert.alert('Erro', validation.errors.join('\n'))
      return false
    }

    return true
  }

  const handleRegister = async () => {
    if (handleValidation()) {
      try {
        const payload: RegisterCustomerReq = {
          nome: form.name,
          email: form.email,
          senha: form.password,
          cpf: form.cpf.replace(/\D/g, ''),
          tipo: 'cliente',
          telefone: form.phone.replace(/\D/g, ''),
          dataNascimento: convertDateToISO(form.birthDate),
          aceitaMarketing: form.acceptMarketing,
        }

        registerCustomerMutation.mutate(payload)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao formatar data de nascimento'
        Alert.alert('Erro', errorMessage)
      }
    }
  }

  return (
    <View className="gap-4">
      <View>
        <Text className="text-frg900 font-medium mb-2">Nome Completo</Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="Digite seu nome completo"
          placeholderTextColor="#9FABB9"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">Email</Text>
        <View className="relative">
          <TextInput
            className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
            placeholder="Digite seu email"
            placeholderTextColor="#9FABB9"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
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
        <Text className="text-frg900 font-medium mb-2">Telefone</Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="(11) 99999-9999"
          placeholderTextColor="#9FABB9"
          value={form.phone}
          onChangeText={(text) =>
            setForm({ ...form, phone: formatPhone(text) })
          }
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">CPF</Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="000.000.000-00"
          placeholderTextColor="#9FABB9"
          value={form.cpf}
          onChangeText={(text) => setForm({ ...form, cpf: formatCPF(text) })}
          keyboardType="numeric"
          maxLength={14}
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">Data de Nascimento</Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#9FABB9"
          value={form.birthDate}
          onChangeText={(text) =>
            setForm({ ...form, birthDate: formatDate(text) })
          }
          keyboardType="numeric"
          maxLength={10}
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">Senha</Text>
        <View className="relative">
          <TextInput
            className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base pr-12"
            placeholder="Digite sua senha"
            placeholderTextColor="#9FABB9"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
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

      <View>
        <Text className="text-frg900 font-medium mb-2">Confirmar Senha</Text>
        <View className="relative">
          <TextInput
            className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base pr-12"
            placeholder="Confirme sua senha"
            placeholderTextColor="#9FABB9"
            value={form.confirmPassword}
            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
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
              color="#9FABB9"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-4">
        <Text className="text-frg900 font-medium">
          Aceito receber marketing
        </Text>
        <Switch
          trackColor={{ false: '#E0E0E0', true: '#437C99' }}
          thumbColor={form.acceptMarketing ? '#FFFFFF' : '#F4F4F4'}
          ios_backgroundColor="#E0E0E0"
          onValueChange={(value) =>
            setForm({ ...form, acceptMarketing: value })
          }
          value={form.acceptMarketing}
        />
      </View>

      <TouchableOpacity
        className={`bg-frgprimary rounded-xl py-4 mt-6 ${
          registerCustomerMutation.isPending ? 'opacity-70' : ''
        }`}
        onPress={handleRegister}
        disabled={registerCustomerMutation.isPending}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {registerCustomerMutation.isPending
            ? 'Registrando...'
            : 'Criar Conta de Cliente'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
