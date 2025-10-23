import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'Evortex',
  slug: 'evortex-front-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/favicon.png',
  backgroundColor: '#FFFFFF',
  scheme: 'evortex',
  userInterfaceStyle: 'automatic',
  newArchEnabled: false,
  jsEngine: 'hermes',
  platforms: ['ios', 'android'],
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    buildNumber: '1',
    entitlements: {
      'aps-environment': 'production',
    },
    infoPlist: {
      UIBackgroundModes: ['fetch', 'remote-notification'],
      NSLocationWhenInUseUsageDescription:
        'Usamos sua localização para mostrar sua posição no mapa e exibir lojas próximas enquanto o app estiver em uso.',
      NSPhotoLibraryUsageDescription:
        'Pedimos acesso à galeria para que você selecione imagens de documentos e envie no app.',
      NSCameraUsageDescription:
        'A câmera é usada para capturar fotos de documentos diretamente pelo app.',
      NSUserNotificationUsageDescription:
        'Usamos as notificações para manter você informado sobre pagamentos, promoções exclusivas, status de pedidos e ofertas personalizadas. Você pode desativar a qualquer momento nas configurações.',
      ITSAppUsesNonExemptEncryption: false,
    },
    bundleIdentifier: 'br.com.evortex.app',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  android: {
    versionCode: 1,
    permissions: ['RECEIVE_BOOT_COMPLETED', 'VIBRATE', 'CAMERA'],
    adaptiveIcon: {
      foregroundImage: './assets/images/favicon.png',
      backgroundColor: '#FFFFFF',
    },
    splash: {
      image: './assets/images/favicon.png',
      backgroundColor: '#FFFFFF',
      dark: {
        image: './assets/images/favicon.png',
        backgroundColor: '#000000',
      },
    },
    package: 'com.evortex',
    googleServicesFile: './google-services.json',
    jsEngine: 'hermes',
  },
  plugins: [
    [
      'expo-router',
      {
        origin: false,
        asyncRoutes: 'development',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/favicon.png',
        color: '#FFFFFF',
        enableBackgroundRemoteNotifications: true,
        androidMode: 'default',
        iosDisplayInForeground: true,
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/favicon.png',
        backgroundColor: '#FFFFFF',
        dark: {
          image: './assets/images/favicon.png',
          backgroundColor: '#000000',
        },
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          '$(PRODUCT_NAME) precisa de acesso à câmera para tirar fotos.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          '$(PRODUCT_NAME) precisa acessar sua galeria para selecionar ou enviar fotos.',
        cameraPermission:
          '$(PRODUCT_NAME) precisa acessar a câmera para tirar novas fotos.',
      },
    ],
    [
      'react-native-edge-to-edge',
      {
        android: {
          parentTheme: 'Default',
        },
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '681001f7-1108-46bc-a9ff-cc62de0de5a5',
    },
    env: process.env.NODE_ENV || 'development',
    EXPO_PUBLIC_SECRET_CRYPT: process.env.EXPO_PUBLIC_SECRET_CRYPT,
    EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
    EXPO_PUBLIC_CLIENT_ID: process.env.EXPO_PUBLIC_CLIENT_ID,
    EXPO_PUBLIC_CLIENT_SECRET: process.env.EXPO_PUBLIC_CLIENT_SECRET,
  },
  primaryColor: '#00B2A6',
}

export default config
