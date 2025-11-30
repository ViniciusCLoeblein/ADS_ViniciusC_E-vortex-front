import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import PagerView from 'react-native-pager-view'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarEnderecos,
  excluirEndereco,
  obterEndereco,
  atualizarEndereco,
} from '@/services/customer'
import type {
  AtualizarEnderecoReq,
  EnderecoRes,
} from '@/services/customer/interface'
import { maskCEP } from '@/constants/masks'
import { buscarCep } from '@/services/brasilapi'
import { useBackHandler } from '@/hooks/indext'
import { useAuthStore } from '@/stores/auth'

export default function AddressesScreen() {
  const queryClient = useQueryClient()
  const { userId } = useAuthStore()
  const pagerRef = useRef<PagerView>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [formData, setFormData] = useState<AtualizarEnderecoReq>({
    apelido: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'BR',
    principal: false,
  })

  const handleCepChange = async (text: string) => {
    const masked = maskCEP(text)
    setFormData({ ...formData, cep: masked })

    // Buscar CEP quando tiver 8 dígitos
    const cepNumbers = masked.replace(/\D/g, '')
    if (cepNumbers.length === 8) {
      setIsLoadingCep(true)
      try {
        const cepData = await buscarCep(cepNumbers)
        setFormData((prev) => ({
          ...prev,
          cep: masked,
          logradouro: cepData.street || prev.logradouro,
          bairro: cepData.neighborhood || prev.bairro,
          cidade: cepData.city || prev.cidade,
          estado: cepData.state || prev.estado,
        }))
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao buscar CEP'
        Alert.alert('Aviso', errorMessage)
      } finally {
        setIsLoadingCep(false)
      }
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ['enderecos', userId],
    queryFn: listarEnderecos,
    enabled: !!userId,
  })

  const { data: enderecoEdit, isLoading: isLoadingEdit } = useQuery({
    queryKey: ['endereco', userId, editingId],
    queryFn: () => obterEndereco(editingId!),
    enabled: !!editingId && !!userId,
  })

  useEffect(() => {
    if (enderecoEdit) {
      setFormData({
        apelido: enderecoEdit.apelido || '',
        cep: enderecoEdit.cep,
        logradouro: enderecoEdit.logradouro,
        numero: enderecoEdit.numero,
        complemento: enderecoEdit.complemento || '',
        bairro: enderecoEdit.bairro,
        cidade: enderecoEdit.cidade,
        estado: enderecoEdit.estado,
        pais: enderecoEdit.pais || 'BR',
        principal: enderecoEdit.principal,
      })
    }
  }, [enderecoEdit])

  const deleteMutation = useMutation({
    mutationFn: excluirEndereco,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enderecos', userId] })
      Alert.alert('Sucesso', 'Endereço excluído com sucesso!')
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível excluir o endereço.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: AtualizarEnderecoReq) =>
      atualizarEndereco(editingId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enderecos', userId] })
      queryClient.invalidateQueries({ queryKey: ['endereco', userId, editingId] })
      Alert.alert('Sucesso', 'Endereço atualizado com sucesso!')
      handleBackToList()
    },
    onError: () => {
      Alert.alert('Erro', 'Não foi possível atualizar o endereço.')
    },
  })

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este endereço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ],
    )
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    if (pagerRef.current) {
      pagerRef.current.setPage(1)
    }
  }

  const handleBackToList = () => {
    setEditingId(null)
    setFormData({
      apelido: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      pais: 'BR',
      principal: false,
    })
    if (pagerRef.current) {
      pagerRef.current.setPage(0)
    }
  }

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    const page = e.nativeEvent.position
    setCurrentPage(page)
    if (page === 0) {
      handleBackToList()
    }
  }

  useBackHandler(() => {
    if (currentPage === 1) {
      handleBackToList()
      return true
    }
    return false
  })

  const handleSubmit = () => {
    if (formData.cep) {
      const cepNumbers = formData.cep.replace(/\D/g, '')
      if (cepNumbers.length !== 8) {
        Alert.alert('Erro', 'CEP deve conter 8 dígitos.')
        return
      }
    }

    if (formData.estado && formData.estado.length !== 2) {
      Alert.alert('Erro', 'Estado deve conter 2 caracteres (UF).')
      return
    }

    if (formData.pais && formData.pais.length !== 2) {
      Alert.alert('Erro', 'País deve conter 2 caracteres (código).')
      return
    }

    if (formData.apelido && formData.apelido.length > 50) {
      Alert.alert('Erro', 'Apelido deve ter no máximo 50 caracteres.')
      return
    }

    if (formData.logradouro && formData.logradouro.length > 255) {
      Alert.alert('Erro', 'Logradouro deve ter no máximo 255 caracteres.')
      return
    }

    if (formData.numero && formData.numero.length > 20) {
      Alert.alert('Erro', 'Número deve ter no máximo 20 caracteres.')
      return
    }

    if (formData.complemento && formData.complemento.length > 100) {
      Alert.alert('Erro', 'Complemento deve ter no máximo 100 caracteres.')
      return
    }

    if (formData.bairro && formData.bairro.length > 100) {
      Alert.alert('Erro', 'Bairro deve ter no máximo 100 caracteres.')
      return
    }

    if (formData.cidade && formData.cidade.length > 100) {
      Alert.alert('Erro', 'Cidade deve ter no máximo 100 caracteres.')
      return
    }

    const dataToUpdate: AtualizarEnderecoReq = { ...formData }

    if (dataToUpdate.cep) {
      dataToUpdate.cep = dataToUpdate.cep.replace(/\D/g, '')
    }

    if (!dataToUpdate.complemento) {
      delete dataToUpdate.complemento
    }

    updateMutation.mutate(dataToUpdate)
  }

  const formatAddress = (endereco: EnderecoRes) => {
    return `${endereco.logradouro}, ${endereco.numero}${
      endereco.complemento ? ` - ${endereco.complemento}` : ''
    } - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado} - CEP: ${endereco.cep}`
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="bg-white rounded-2xl p-6 items-center">
          <Text className="text-system-text">Carregando endereços...</Text>
        </View>
      )
    }

    if (data?.enderecos && data.enderecos.length > 0) {
      return data.enderecos.map((endereco) => (
        <View
          key={endereco.id}
          className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
        >
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              {endereco.principal && (
                <View className="bg-frgprimary/10 rounded-full px-3 py-1 self-start mb-2">
                  <Text className="text-frgprimary text-xs font-semibold">
                    Principal
                  </Text>
                </View>
              )}
              <Text className="text-frg900 font-semibold text-base mb-2">
                {formatAddress(endereco)}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 bg-frgprimary/10 rounded-xl py-3 flex-row items-center justify-center"
              onPress={() => handleEdit(endereco.id)}
            >
              <Ionicons name="create-outline" size={18} color="#437C99" />
              <Text className="text-frgprimary font-medium ml-2">Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-50 rounded-xl py-3 px-4"
              onPress={() => handleDelete(endereco.id)}
              disabled={deleteMutation.isPending}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4058" />
            </TouchableOpacity>
          </View>
        </View>
      ))
    }

    return (
      <View className="bg-white rounded-2xl p-6 items-center">
        <Ionicons name="location-outline" size={64} color="#9FABB9" />
        <Text className="text-system-text text-center mt-4 mb-6">
          Nenhum endereço cadastrado
        </Text>
        <TouchableOpacity
          className="bg-frgprimary rounded-xl py-3 px-6"
          onPress={() => router.push('/profile/addresses/new')}
        >
          <Text className="text-white font-semibold">Adicionar Endereço</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => {
              if (currentPage === 1) {
                handleBackToList()
              } else {
                router.back()
              }
            }}
            className="bg-gray-100 rounded-full p-2"
          >
            <Ionicons name="arrow-back" size={20} color="#9FABB9" />
          </TouchableOpacity>
          <Text className="text-frg900 font-bold text-xl">
            {editingId ? 'Editar Endereço' : 'Meus Endereços'}
          </Text>
          {!editingId ? (
            <TouchableOpacity
              onPress={() => router.push('/profile/addresses/new')}
              className="bg-frgprimary rounded-full p-2"
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}
        </View>
      </View>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        <View key="list" style={{ flex: 1 }}>
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 pt-6">{renderContent()}</View>
          </ScrollView>
        </View>

        <View key="edit" style={{ flex: 1 }}>
          {isLoadingEdit ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-system-text">Carregando...</Text>
            </View>
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <View className="px-6 pt-6">
                  <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <View className="mb-4">
                      <Text className="text-frg900 font-medium mb-2">
                        Apelido
                      </Text>
                      <TextInput
                        className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                        placeholder="Casa, Trabalho, etc."
                        value={formData.apelido}
                        onChangeText={(text) =>
                          setFormData({ ...formData, apelido: text })
                        }
                        maxLength={50}
                      />
                    </View>
                    <View className="mb-4">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-frg900 font-medium">CEP</Text>
                        {isLoadingCep && (
                          <ActivityIndicator size="small" color="#437C99" />
                        )}
                      </View>
                      <TextInput
                        className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                        placeholder="00000000"
                        value={formData.cep}
                        onChangeText={handleCepChange}
                        keyboardType="numeric"
                        maxLength={8}
                      />
                      <Text className="text-gray-500 text-xs mt-1">
                        Apenas números (8 dígitos) - Preenchimento automático
                      </Text>
                    </View>
                    <View className="mb-4">
                      <Text className="text-frg900 font-medium mb-2">
                        Logradouro
                      </Text>
                      <TextInput
                        className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                        placeholder="Rua, Avenida, etc."
                        value={formData.logradouro}
                        onChangeText={(text) =>
                          setFormData({ ...formData, logradouro: text })
                        }
                        maxLength={255}
                      />
                    </View>
                    <View className="mb-4">
                      <Text className="text-frg900 font-medium mb-2">
                        Número
                      </Text>
                      <TextInput
                        className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                        placeholder="123"
                        value={formData.numero}
                        onChangeText={(text) =>
                          setFormData({ ...formData, numero: text })
                        }
                        maxLength={20}
                      />
                    </View>
                    <View className="mb-4">
                      <Text className="text-frg900 font-medium mb-2">
                        Complemento
                      </Text>
                      <TextInput
                        className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                        placeholder="Apto, Bloco, etc."
                        value={formData.complemento}
                        onChangeText={(text) =>
                          setFormData({ ...formData, complemento: text })
                        }
                        maxLength={100}
                      />
                    </View>
                    <View className="mb-4">
                      <Text className="text-frg900 font-medium mb-2">
                        Bairro
                      </Text>
                      <TextInput
                        className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                        placeholder="Nome do bairro"
                        value={formData.bairro}
                        onChangeText={(text) =>
                          setFormData({ ...formData, bairro: text })
                        }
                        maxLength={100}
                      />
                    </View>
                    <View className="mb-4">
                      <Text className="text-frg900 font-medium mb-2">
                        Cidade
                      </Text>
                      <TextInput
                        className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                        placeholder="Nome da cidade"
                        value={formData.cidade}
                        onChangeText={(text) =>
                          setFormData({ ...formData, cidade: text })
                        }
                        maxLength={100}
                      />
                    </View>
                    <View className="mb-4">
                      <Text className="text-frg900 font-medium mb-2">
                        Estado
                      </Text>
                      <TextInput
                        className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                        placeholder="UF"
                        value={formData.estado}
                        onChangeText={(text) =>
                          setFormData({
                            ...formData,
                            estado: text.toUpperCase(),
                          })
                        }
                        maxLength={2}
                      />
                      <Text className="text-gray-500 text-xs mt-1">
                        2 caracteres (ex: RS, SP)
                      </Text>
                    </View>
                    <View className="mb-4">
                      <Text className="text-frg900 font-medium mb-2">País</Text>
                      <TextInput
                        className="bg-inputbg border border-gray-200 rounded-xl px-4 py-3 text-base"
                        placeholder="BR"
                        value={formData.pais}
                        onChangeText={(text) =>
                          setFormData({
                            ...formData,
                            pais: text.toUpperCase(),
                          })
                        }
                        maxLength={2}
                      />
                      <Text className="text-gray-500 text-xs mt-1">
                        2 caracteres (código do país, ex: BR)
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="flex-row items-center mb-4"
                      onPress={() =>
                        setFormData({
                          ...formData,
                          principal: !formData.principal,
                        })
                      }
                    >
                      <View
                        className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                          formData.principal
                            ? 'bg-frgprimary border-frgprimary'
                            : 'border-gray-300'
                        }`}
                      >
                        {formData.principal && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </View>
                      <Text className="text-frg900">
                        Definir como endereço principal
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    className="bg-frgprimary rounded-xl py-4 mb-6"
                    onPress={handleSubmit}
                    disabled={updateMutation.isPending}
                  >
                    <Text className="text-white text-center text-lg font-semibold">
                      {updateMutation.isPending
                        ? 'Salvando...'
                        : 'Salvar Alterações'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </View>
      </PagerView>
    </SafeAreaView>
  )
}
