import Constants from 'expo-constants'

const OTA_VERSION = 0

export const ENV = {
  NODE_ENV: Constants.expoConfig?.extra?.env || process.env.NODE_ENV,
  SECRET_CRYPT:
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SECRET_CRYPT ||
    process.env.EXPO_PUBLIC_SECRET_CRYPT,
  BASE_URL:
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BASE_URL ||
    process.env.EXPO_PUBLIC_BASE_URL,
  CLIENT_ID:
    Constants.expoConfig?.extra?.EXPO_PUBLIC_CLIENT_ID ||
    process.env.EXPO_PUBLIC_CLIENT_ID,
  CLIENT_SECRET:
    Constants.expoConfig?.extra?.EXPO_PUBLIC_CLIENT_SECRET ||
    process.env.EXPO_PUBLIC_CLIENT_SECRET,
}
