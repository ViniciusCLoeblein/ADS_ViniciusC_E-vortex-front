import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCart } from '@/contexts/CartContext'

const mockProducts = [
  {
    id: '1',
    name: 'Smartphone Galaxy S24',
    price: 'R$ 2.999,00',
    originalPrice: 'R$ 3.499,00',
    image: 'https://via.placeholder.com/200x200/437C99/FFFFFF?text=Galaxy+S24',
    rating: 4.8,
    reviews: 124,
    discount: '14%',
  },
  {
    id: '2',
    name: 'Fone Bluetooth Premium',
    price: 'R$ 299,00',
    originalPrice: 'R$ 399,00',
    image: 'https://via.placeholder.com/200x200/00B2A6/FFFFFF?text=Fone+BT',
    rating: 4.6,
    reviews: 89,
    discount: '25%',
  },
  {
    id: '3',
    name: 'Notebook Gamer RTX 4060',
    price: 'R$ 4.999,00',
    originalPrice: 'R$ 5.999,00',
    image: 'https://via.placeholder.com/200x200/EF4058/FFFFFF?text=Notebook',
    rating: 4.9,
    reviews: 67,
    discount: '17%',
  },
  {
    id: '4',
    name: 'Smartwatch Series 9',
    price: 'R$ 1.299,00',
    originalPrice: 'R$ 1.599,00',
    image: 'https://via.placeholder.com/200x200/234158/FFFFFF?text=Watch',
    rating: 4.7,
    reviews: 203,
    discount: '19%',
  },
]

const categories = [
  { id: '1', name: 'Eletrônicos', icon: 'phone-portrait-outline' as const },
  { id: '2', name: 'Moda', icon: 'shirt-outline' as const },
  { id: '3', name: 'Casa', icon: 'home-outline' as const },
  { id: '4', name: 'Esportes', icon: 'fitness-outline' as const },
  { id: '5', name: 'Livros', icon: 'book-outline' as const },
]

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('1')
  const { addToCart, getTotalItems } = useCart()

  const handleLogout = () => {
    router.replace('/login')
  }

  const handleAddToCart = (product: (typeof mockProducts)[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      rating: product.rating,
      reviews: product.reviews,
      discount: product.discount,
    })
  }

  const renderProduct = ({ item }: { item: (typeof mockProducts)[0] }) => (
    <TouchableOpacity className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mr-4 w-48">
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="w-full h-32 rounded-xl mb-3"
          resizeMode="cover"
          alt={item.name}
        />
        <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-lg">
          <Text className="text-white text-xs font-bold">-{item.discount}</Text>
        </View>
        <TouchableOpacity className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm">
          <Ionicons name="heart-outline" size={16} color="#EF4058" />
        </TouchableOpacity>
      </View>

      <Text
        className="text-frg900 font-semibold text-sm mb-1"
        numberOfLines={2}
      >
        {item.name}
      </Text>

      <View className="flex-row items-center mb-2">
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text className="text-xs text-system-text ml-1">{item.rating}</Text>
        <Text className="text-xs text-system-text ml-1">({item.reviews})</Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-frgprimary font-bold text-base">
            {item.price}
          </Text>
          <Text className="text-system-text text-xs line-through">
            {item.originalPrice}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-frgprimary rounded-lg p-2"
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="add" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const renderCategory = ({ item }: { item: (typeof categories)[0] }) => (
    <TouchableOpacity
      className={`items-center p-4 rounded-xl mr-3 ${
        selectedCategory === item.id ? 'bg-frgprimary' : 'bg-gray-100'
      }`}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons
        name={item.icon}
        size={24}
        color={selectedCategory === item.id ? 'white' : '#9FABB9'}
      />
      <Text
        className={`text-xs mt-2 font-medium ${
          selectedCategory === item.id ? 'text-white' : 'text-system-text'
        }`}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-frg900 font-bold text-xl">E-Vortex</Text>
            <Text className="text-system-text">Bem-vindo de volta!</Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity className="bg-gray-100 rounded-full p-2">
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#9FABB9"
              />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-full p-2 relative">
              <Ionicons name="cart-outline" size={20} color="#9FABB9" />
              {getTotalItems() > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {getTotalItems() > 99 ? '99+' : getTotalItems()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-gray-100 rounded-full p-2"
            >
              <Ionicons name="log-out-outline" size={20} color="#9FABB9" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#9FABB9" />
          <TextInput
            className="flex-1 ml-3 text-base"
            placeholder="Buscar produtos..."
            placeholderTextColor="#9FABB9"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity>
            <Ionicons name="filter-outline" size={20} color="#9FABB9" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mx-6 mt-4 mb-6">
          <View className="bg-gradient-to-r from-frgprimary to-frgsecondary rounded-2xl p-6">
            <Text className="text-white text-xl font-bold mb-2">
              Oferta Especial!
            </Text>
            <Text className="text-white text-sm mb-4 opacity-90">
              Até 50% de desconto em eletrônicos
            </Text>
            <TouchableOpacity className="bg-white rounded-xl py-3 px-6 self-start">
              <Text className="text-frgprimary font-semibold">Ver Ofertas</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-frg900 font-bold text-lg mb-4">Categorias</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-frg900 font-bold text-lg">
              Produtos em Destaque
            </Text>
            <TouchableOpacity>
              <Text className="text-frgprimary font-medium">Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mockProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-frg900 font-bold text-lg">Mais Vendidos</Text>
            <TouchableOpacity>
              <Text className="text-frgprimary font-medium">Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mockProducts.slice(0, 2)}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  )
}
