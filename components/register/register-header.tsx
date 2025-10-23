import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function RegisterHeader() {
  return (
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
      <Text className="text-3xl font-bold text-frg900 mb-2">Criar Conta</Text>
      <Text className="text-lg text-system-text text-center">
        Escolha o tipo de conta que deseja criar
      </Text>
    </View>
  )
}
