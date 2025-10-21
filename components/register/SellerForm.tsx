import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import {
  formatCPF,
  formatCNPJ,
  formatPhone,
  validateSellerForm,
  type SellerFormData,
} from '@/lib/utils'

interface SellerFormProps {
  onSuccess: () => void
}

export default function SellerForm({ onSuccess }: SellerFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const [form, setForm] = useState<SellerFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    cnpj: '',
    companyName: '',
    tradeName: '',
    stateRegistration: '',
  })

  const handleValidation = () => {
    const validation = validateSellerForm(form)

    if (!validation.isValid) {
      Alert.alert('Erro', validation.errors.join('\n'))
      return false
    }

    return true
  }

  const handleRegister = async () => {
    if (handleValidation()) {
      setIsPending(true)

      // Simular chamada de API
      setTimeout(() => {
        setIsPending(false)
        Alert.alert('Sucesso', 'Vendedor registrado com sucesso!', [
          {
            text: 'OK',
            onPress: () => {
              try {
                router.replace('/login')
              } catch (error) {
                console.log('Navigation error:', error)
              }
            },
          },
        ])
      }, 2000)
    }
  }

  return (
    <View className="space-y-4 gap-4">
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
        <Text className="text-frg900 font-medium mb-2">CNPJ</Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="00.000.000/0000-00"
          placeholderTextColor="#9FABB9"
          value={form.cnpj}
          onChangeText={(text) => setForm({ ...form, cnpj: formatCNPJ(text) })}
          keyboardType="numeric"
          maxLength={18}
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">Razão Social</Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="Digite a razão social da empresa"
          placeholderTextColor="#9FABB9"
          value={form.companyName}
          onChangeText={(text) => setForm({ ...form, companyName: text })}
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">Nome Fantasia</Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="Digite o nome fantasia da empresa"
          placeholderTextColor="#9FABB9"
          value={form.tradeName}
          onChangeText={(text) => setForm({ ...form, tradeName: text })}
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">Inscrição Estadual</Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="Digite a inscrição estadual"
          placeholderTextColor="#9FABB9"
          value={form.stateRegistration}
          onChangeText={(text) => setForm({ ...form, stateRegistration: text })}
        />
      </View>

      <View className="mt-4">
        <Text className="text-frg900 font-bold text-base mb-3">
          Dados Bancários (Opcional)
        </Text>

        <View className="mb-3">
          <Text className="text-frg900 font-medium mb-2">Banco</Text>
          <TextInput
            className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
            placeholder="Ex: 001"
            placeholderTextColor="#9FABB9"
            value={form.bankAccount?.bank || ''}
            onChangeText={(text) =>
              setForm({
                ...form,
                bankAccount: {
                  bank: text,
                  agency: form.bankAccount?.agency || '',
                  account: form.bankAccount?.account || '',
                },
              })
            }
          />
        </View>

        <View className="mb-3">
          <Text className="text-frg900 font-medium mb-2">Agência</Text>
          <TextInput
            className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
            placeholder="Ex: 1234"
            placeholderTextColor="#9FABB9"
            value={form.bankAccount?.agency || ''}
            onChangeText={(text) =>
              setForm({
                ...form,
                bankAccount: {
                  bank: form.bankAccount?.bank || '',
                  agency: text,
                  account: form.bankAccount?.account || '',
                },
              })
            }
          />
        </View>

        <View>
          <Text className="text-frg900 font-medium mb-2">Conta</Text>
          <TextInput
            className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
            placeholder="Ex: 12345-6"
            placeholderTextColor="#9FABB9"
            value={form.bankAccount?.account || ''}
            onChangeText={(text) =>
              setForm({
                ...form,
                bankAccount: {
                  bank: form.bankAccount?.bank || '',
                  agency: form.bankAccount?.agency || '',
                  account: text,
                },
              })
            }
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

      <TouchableOpacity
        className={`bg-frgprimary rounded-xl py-4 mt-6 ${
          isPending ? 'opacity-70' : ''
        }`}
        onPress={handleRegister}
        disabled={isPending}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {isPending ? 'Registrando...' : 'Criar Conta de Vendedor'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
