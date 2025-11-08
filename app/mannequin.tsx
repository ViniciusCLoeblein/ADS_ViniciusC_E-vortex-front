import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useMannequin } from '@/contexts/MannequinContext'
import { useCart } from '@/contexts/CartContext'
import { Mannequin3D } from '@/components/Mannequin3D'

const equippableItems = [
  {
    id: '5',
    name: 'Camiseta Premium',
    price: 'R$ 89,00',
    originalPrice: 'R$ 129,00',
    image:
      'https://w7.pngwing.com/pngs/33/974/png-transparent-t-shirts-t-shirts-mens-white.png',
    rating: 4.5,
    reviews: 156,
    discount: '31%',
    category: 'Moda',
    isEquippable: true as const,
    equipSlot: 'torso' as const,
  },
  {
    id: '6',
    name: 'Óculos de Sol',
    price: 'R$ 199,00',
    originalPrice: 'R$ 299,00',
    image:
      'https://www.pikpng.com/pngl/m/457-4576142_oculos-de-sol-png-oculos-escuro-em-png.png',
    rating: 4.8,
    reviews: 89,
    discount: '33%',
    category: 'Moda',
    isEquippable: true as const,
    equipSlot: 'face' as const,
  },
  {
    id: '7',
    name: 'Tênis Esportivo',
    price: 'R$ 399,00',
    originalPrice: 'R$ 599,00',
    image: 'https://via.placeholder.com/200x200/45B7D1/FFFFFF?text=Tênis',
    rating: 4.7,
    reviews: 234,
    discount: '33%',
    category: 'Moda',
    isEquippable: true as const,
    equipSlot: 'feet' as const,
  },
  {
    id: '8',
    name: 'Jaqueta Jeans',
    price: 'R$ 249,00',
    originalPrice: 'R$ 349,00',
    image: 'https://via.placeholder.com/200x200/96CEB4/FFFFFF?text=Jaqueta',
    rating: 4.6,
    reviews: 178,
    discount: '29%',
    category: 'Moda',
    isEquippable: true as const,
    equipSlot: 'torso' as const,
  },
]

export default function MannequinScreen() {
  const { equippedItems, equipItem, unequipItem, isEquipped } = useMannequin()
  const { addToCart } = useCart()

  const handleEquipItem = (item: (typeof equippableItems)[0]) => {
    if (isEquipped(item.id)) {
      unequipItem(item.equipSlot)
      Alert.alert('Item removido', `${item.name} foi removido do manequim.`)
    } else {
      equipItem(item)
      Alert.alert('Item equipado', `${item.name} foi equipado no manequim.`)
    }
  }

  const handleAddToCart = (item: (typeof equippableItems)[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      rating: item.rating,
      reviews: item.reviews,
      discount: item.discount,
    })
    Alert.alert(
      'Adicionado ao carrinho',
      `${item.name} foi adicionado ao carrinho.`,
    )
  }

  const getSlotName = (slot: string) => {
    const slotNames: Record<string, string> = {
      torso: 'Torso',
      face: 'Rosto',
      feet: 'Pés',
      head: 'Cabeça',
      hands: 'Mãos',
    }
    return slotNames[slot] || slot
  }

  const getSlotIcon = (slot: string) => {
    const slotIcons: Record<string, string> = {
      torso: 'shirt-outline',
      face: 'eye-outline',
      feet: 'footsteps-outline',
      head: 'person-outline',
      hands: 'hand-left-outline',
    }
    return slotIcons[slot] || 'help-outline'
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#9FABB9" />
          </TouchableOpacity>
          <Text className="text-frg900 font-bold text-xl">
            Manequim Virtual
          </Text>
          <View className="w-6" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 3D Mannequin Display */}
        <View className="items-center py-4">
          <View className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <Mannequin3D size={180} />
          </View>

          {/* Equipped Items Summary */}
          <View className="bg-white rounded-2xl shadow-sm p-4 mb-6 w-full mx-6">
            <Text className="text-frg900 font-bold text-lg mb-4 text-center">
              Itens Equipados
            </Text>
            {Object.entries(equippedItems).map(([slot, item]) => (
              <View
                key={slot}
                className="flex-row items-center justify-between py-2"
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={getSlotIcon(slot) as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color="#9FABB9"
                  />
                  <Text className="text-frg900 font-medium ml-2">
                    {getSlotName(slot)}:
                  </Text>
                </View>
                <Text className="text-system-text">
                  {item ? item.name : 'Nenhum item'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Available Items */}
        <View className="px-6 mb-6">
          <Text className="text-frg900 font-bold text-lg mb-4">
            Itens Disponíveis para Teste
          </Text>
          <View className="gap-4">
            {equippableItems.map((item) => (
              <View
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
              >
                <View className="flex-row">
                  <Image
                    source={{ uri: item.image }}
                    className="w-20 h-20 rounded-xl mr-4"
                    resizeMode="cover"
                    alt={item.name}
                  />

                  <View className="flex-1">
                    <Text className="text-frg900 font-semibold text-base mb-1">
                      {item.name}
                    </Text>

                    <View className="flex-row items-center mb-2">
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text className="text-xs text-system-text ml-1">
                        {item.rating}
                      </Text>
                      <Text className="text-xs text-system-text ml-1">
                        ({item.reviews})
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-frgprimary font-bold text-base">
                          {item.price}
                        </Text>
                        <Text className="text-system-text text-sm">
                          {getSlotName(item.equipSlot)}
                        </Text>
                      </View>

                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          className={`rounded-lg px-4 py-2 ${
                            isEquipped(item.id)
                              ? 'bg-red-100 border border-red-300'
                              : 'bg-frgprimary'
                          }`}
                          onPress={() => handleEquipItem(item)}
                        >
                          <Text
                            className={`font-semibold text-sm ${
                              isEquipped(item.id)
                                ? 'text-red-600'
                                : 'text-white'
                            }`}
                          >
                            {isEquipped(item.id) ? 'Remover' : 'Testar'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="bg-gray-100 rounded-lg px-4 py-2"
                          onPress={() => handleAddToCart(item)}
                        >
                          <Text className="text-frg900 font-semibold text-sm">
                            Comprar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  )
}
