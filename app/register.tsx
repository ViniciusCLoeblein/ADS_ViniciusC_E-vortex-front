import { useState, useRef } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import PagerView from 'react-native-pager-view'
import {
  RegisterHeader,
  TabSelector,
  CustomerForm,
  SellerForm,
} from '@/components'

export default function RegisterScreen() {
  const [activeTab, setActiveTab] = useState<'customer' | 'seller'>('customer')
  const pagerRef = useRef<PagerView>(null)

  const handleTabChange = (tab: 'customer' | 'seller') => {
    setActiveTab(tab)
    if (pagerRef.current) {
      pagerRef.current.setPage(tab === 'customer' ? 0 : 1)
    }
  }

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    const page = e.nativeEvent.position
    setActiveTab(page === 0 ? 'customer' : 'seller')
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-8">
          <RegisterHeader />
          <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

          <View className="flex-1">
            <PagerView
              ref={pagerRef}
              style={{ flex: 1 }}
              initialPage={activeTab === 'customer' ? 0 : 1}
              onPageSelected={handlePageSelected}
            >
              <View key="customer" style={{ flex: 1 }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 10 }}
                >
                  <CustomerForm onSuccess={() => {}} />
                  <View className="mt-8 mb-8 items-center">
                    <Text className="text-system-text">
                      Já tem uma conta?{' '}
                      <Link
                        className="text-frgprimary font-medium"
                        href="/login"
                      >
                        Fazer Login
                      </Link>
                    </Text>
                  </View>
                </ScrollView>
              </View>
              <View key="seller" style={{ flex: 1 }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 10 }}
                >
                  <SellerForm onSuccess={() => {}} />
                  <View className="mt-8 mb-8 items-center">
                    <Text className="text-system-text">
                      Já tem uma conta?{' '}
                      <Link
                        className="text-frgprimary font-medium"
                        href="/login"
                      >
                        Fazer Login
                      </Link>
                    </Text>
                  </View>
                </ScrollView>
              </View>
            </PagerView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
