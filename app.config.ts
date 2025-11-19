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
  jsEngine: 'hermes',
  platforms: ['ios', 'android'],
  assetBundlePatterns: ['**/*'],
  ios: {
    buildNumber: '1',
    entitlements: {
      'aps-environment': 'production',
    },
    bundleIdentifier: 'br.com.evortex.app',
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
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '84a84c92-4dc2-4488-a74f-cf2cb8a850c2',
    },
    env: process.env.NODE_ENV || 'development',
    EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
  },
}

export default config
