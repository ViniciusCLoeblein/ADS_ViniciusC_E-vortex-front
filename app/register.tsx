import React, { useState } from 'react'
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
import { useMutation } from '@tanstack/react-query'
import {
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatDate,
  validateCustomerForm,
  validateSellerForm,
  type CustomerFormData,
  type SellerFormData,
} from '@/lib/utils'

// Mock API functions
const registerCustomer = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return { success: true, message: 'Cliente registrado com sucesso!' }
}

const registerSeller = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return { success: true, message: 'Vendedor registrado com sucesso!' }
}

export default function RegisterScreen() {
  const [activeTab, setActiveTab] = useState<'customer' | 'seller'>('customer')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Customer form state
  const [customerForm, setCustomerForm] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    cpf: '',
  })

  // Seller form state
  const [sellerForm, setSellerForm] = useState<SellerFormData>({
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cnpj: '',
    address: '',
    description: '',
  })

  const { mutate: mutateCustomerRegister, isPending: isCustomerPending } =
    useMutation({
      mutationFn: registerCustomer,
      onSuccess: () => {
        Alert.alert('Sucesso', 'Cliente registrado com sucesso!', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ])
      },
      onError: (error) => {
        Alert.alert(
          'Erro',
          error.message || 'Falha no registro. Tente novamente.',
        )
      },
    })

  const { mutate: mutateSellerRegister, isPending: isSellerPending } =
    useMutation({
      mutationFn: registerSeller,
      onSuccess: () => {
        Alert.alert('Sucesso', 'Vendedor registrado com sucesso!', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ])
      },
      onError: (error) => {
        Alert.alert(
          'Erro',
          error.message || 'Falha no registro. Tente novamente.',
        )
      },
    })

  const handleCustomerValidation = () => {
    const validation = validateCustomerForm(customerForm)

    if (!validation.isValid) {
      Alert.alert('Erro', validation.errors.join('\n'))
      return false
    }

    return true
  }

  const handleSellerValidation = () => {
    const validation = validateSellerForm(sellerForm)

    if (!validation.isValid) {
      Alert.alert('Erro', validation.errors.join('\n'))
      return false
    }

    return true
  }

  const handleCustomerRegister = () => {
    if (handleCustomerValidation()) {
      mutateCustomerRegister()
    }
  }

  const handleSellerRegister = () => {
    if (handleSellerValidation()) {
      mutateSellerRegister()
    }
  }

  const renderCustomerForm = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-frg900 font-medium mb-2">Nome Completo</Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="Digite seu nome completo"
          placeholderTextColor="#9FABB9"
          value={customerForm.name}
          onChangeText={(text) =>
            setCustomerForm({ ...customerForm, name: text })
          }
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">Email</Text>
        <View className="relative">
          <TextInput
            className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
            placeholder="Digite seu email"
            placeholderTextColor="#9FABB9"
            value={customerForm.email}
            onChangeText={(text) =>
              setCustomerForm({ ...customerForm, email: text })
            }
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
          value={customerForm.phone}
          onChangeText={(text) =>
            setCustomerForm({ ...customerForm, phone: formatPhone(text) })
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
          value={customerForm.cpf}
          onChangeText={(text) =>
            setCustomerForm({ ...customerForm, cpf: formatCPF(text) })
          }
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
          value={customerForm.birthDate}
          onChangeText={(text) =>
            setCustomerForm({ ...customerForm, birthDate: formatDate(text) })
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
            value={customerForm.password}
            onChangeText={(text) =>
              setCustomerForm({ ...customerForm, password: text })
            }
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
            value={customerForm.confirmPassword}
            onChangeText={(text) =>
              setCustomerForm({ ...customerForm, confirmPassword: text })
            }
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
          isCustomerPending ? 'opacity-70' : ''
        }`}
        onPress={handleCustomerRegister}
        disabled={isCustomerPending}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {isCustomerPending ? 'Registrando...' : 'Criar Conta de Cliente'}
        </Text>
      </TouchableOpacity>
    </View>
  )

  const renderSellerForm = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-frg900 font-medium mb-2">Nome da Empresa</Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="Digite o nome da sua empresa"
          placeholderTextColor="#9FABB9"
          value={sellerForm.companyName}
          onChangeText={(text) =>
            setSellerForm({ ...sellerForm, companyName: text })
          }
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">Email</Text>
        <View className="relative">
          <TextInput
            className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
            placeholder="Digite seu email"
            placeholderTextColor="#9FABB9"
            value={sellerForm.email}
            onChangeText={(text) =>
              setSellerForm({ ...sellerForm, email: text })
            }
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
          value={sellerForm.phone}
          onChangeText={(text) =>
            setSellerForm({ ...sellerForm, phone: formatPhone(text) })
          }
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">CNPJ</Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="00.000.000/0000-00"
          placeholderTextColor="#9FABB9"
          value={sellerForm.cnpj}
          onChangeText={(text) =>
            setSellerForm({ ...sellerForm, cnpj: formatCNPJ(text) })
          }
          keyboardType="numeric"
          maxLength={18}
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">Endereço</Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="Digite o endereço da empresa"
          placeholderTextColor="#9FABB9"
          value={sellerForm.address}
          onChangeText={(text) =>
            setSellerForm({ ...sellerForm, address: text })
          }
          multiline
          numberOfLines={2}
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">
          Descrição da Empresa
        </Text>
        <TextInput
          className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base"
          placeholder="Descreva sua empresa e produtos"
          placeholderTextColor="#9FABB9"
          value={sellerForm.description}
          onChangeText={(text) =>
            setSellerForm({ ...sellerForm, description: text })
          }
          multiline
          numberOfLines={3}
        />
      </View>

      <View>
        <Text className="text-frg900 font-medium mb-2">Senha</Text>
        <View className="relative">
          <TextInput
            className="bg-inputbg border border-gray-200 rounded-xl px-4 py-4 text-base pr-12"
            placeholder="Digite sua senha"
            placeholderTextColor="#9FABB9"
            value={sellerForm.password}
            onChangeText={(text) =>
              setSellerForm({ ...sellerForm, password: text })
            }
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
            value={sellerForm.confirmPassword}
            onChangeText={(text) =>
              setSellerForm({ ...sellerForm, confirmPassword: text })
            }
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
          isSellerPending ? 'opacity-70' : ''
        }`}
        onPress={handleSellerRegister}
        disabled={isSellerPending}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {isSellerPending ? 'Registrando...' : 'Criar Conta de Vendedor'}
        </Text>
      </TouchableOpacity>
    </View>
  )

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
          <View className="flex-1 px-6 pt-8">
            {/* Header */}
            <View className="items-center mb-8">
              <TouchableOpacity
                onPress={() => router.back()}
                className="absolute left-0 top-0"
              >
                <Ionicons name="arrow-back" size={24} color="#9FABB9" />
              </TouchableOpacity>

              <View className="w-20 h-20 bg-frgprimary rounded-full items-center justify-center mb-4">
                <Ionicons name="person-add-outline" size={40} color="white" />
              </View>
              <Text className="text-3xl font-bold text-frg900 mb-2">
                Criar Conta
              </Text>
              <Text className="text-lg text-system-text text-center">
                Escolha o tipo de conta que deseja criar
              </Text>
            </View>

            {/* Tab Selector */}
            <View className="bg-gray-100 rounded-xl p-1 mb-6">
              <View className="flex-row">
                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-lg ${
                    activeTab === 'customer' ? 'bg-white shadow-sm' : ''
                  }`}
                  onPress={() => setActiveTab('customer')}
                >
                  <View className="items-center">
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={activeTab === 'customer' ? '#437C99' : '#9FABB9'}
                    />
                    <Text
                      className={`text-sm font-medium mt-1 ${
                        activeTab === 'customer'
                          ? 'text-frgprimary'
                          : 'text-system-text'
                      }`}
                    >
                      Cliente
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-lg ${
                    activeTab === 'seller' ? 'bg-white shadow-sm' : ''
                  }`}
                  onPress={() => setActiveTab('seller')}
                >
                  <View className="items-center">
                    <Ionicons
                      name="storefront-outline"
                      size={20}
                      color={activeTab === 'seller' ? '#437C99' : '#9FABB9'}
                    />
                    <Text
                      className={`text-sm font-medium mt-1 ${
                        activeTab === 'seller'
                          ? 'text-frgprimary'
                          : 'text-system-text'
                      }`}
                    >
                      Vendedor
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Content */}
            <View className="mb-6">
              {activeTab === 'customer'
                ? renderCustomerForm()
                : renderSellerForm()}
            </View>

            {/* Footer */}
            <View className="mt-8 items-center">
              <Text className="text-system-text">
                Já tem uma conta?{' '}
                <TouchableOpacity onPress={() => router.back()}>
                  <Text className="text-frgprimary font-medium">
                    Fazer Login
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
