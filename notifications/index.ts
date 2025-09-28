import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform, Alert, Linking } from 'react-native'

export async function registerForPushNotificationsAsync(
  func: (token: string) => void,
  funcS?: (token: string) => void,
) {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const shouldRequest = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Notificações',
          'Gostaríamos de enviar notificações para manter você informado sobre:\n\n• Pagamentos e vencimentos\n• Promoções exclusivas\n• Ofertas personalizadas\n\nVocê pode desativar a qualquer momento nas configurações.',
          [
            {
              text: 'Agora não',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: 'Permitir',
              style: 'default',
              onPress: () => resolve(true),
            },
          ],
          { cancelable: false },
        )
      })

      if (!shouldRequest) {
        return
      }

      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permissão de Notificações',
        Platform.OS === 'ios'
          ? 'Para receber notificações importantes sobre pagamentos e promoções, você pode ativar as notificações nas Configurações do iPhone > Evortex > Notificações.'
          : 'Para receber notificações importantes sobre pagamentos e promoções, você pode ativar as notificações nas Configurações do Android > Apps > Evortex > Notificações.',
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Abrir Configurações',
            onPress: () => {
              Linking.openSettings()
            },
          },
        ],
      )
      return
    }

    const pushTokenData = await Notifications.getExpoPushTokenAsync()
    func(pushTokenData.data)
    funcS && funcS(pushTokenData.data)

    console.info('✅ Token Expo Push:', pushTokenData.data)
  } else {
    console.warn('⚠️ Deve ser executado em um dispositivo físico')
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      showBadge: true,
      enableVibrate: true,
    })
  }
}
