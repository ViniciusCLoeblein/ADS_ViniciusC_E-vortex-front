import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { cn } from '@/lib/utils'

interface TabSelectorProps {
  activeTab: 'customer' | 'seller'
  onTabChange: (tab: 'customer' | 'seller') => void
}

export default function TabSelector({
  activeTab,
  onTabChange,
}: TabSelectorProps) {
  return (
    <View className="bg-gray-100 rounded-xl p-1 mb-6">
      <View className="flex-row">
        <TouchableOpacity
          className={cn('flex-1 py-3 px-4 rounded-lg', {
            'bg-white': activeTab === 'customer',
          })}
          onPress={() => onTabChange('customer')}
        >
          <View className="items-center">
            <Ionicons
              name="person-outline"
              size={20}
              color={activeTab === 'customer' ? '#437C99' : '#9FABB9'}
            />
            <Text
              className={cn('text-sm font-medium mt-1', {
                'text-frgprimary': activeTab === 'customer',
                'text-system-text': activeTab !== 'customer',
              })}
            >
              Cliente
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={cn('flex-1 py-3 px-4 rounded-lg', {
            'bg-white': activeTab === 'seller',
          })}
          onPress={() => onTabChange('seller')}
        >
          <View className="items-center">
            <Ionicons
              name="storefront-outline"
              size={20}
              color={activeTab === 'seller' ? '#437C99' : '#9FABB9'}
            />
            <Text
              className={cn('text-sm font-medium mt-1', {
                'text-frgprimary': activeTab === 'seller',
                'text-system-text': activeTab !== 'seller',
              })}
            >
              Vendedor
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}
