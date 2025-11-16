import Constants from 'expo-constants'

export const ENV = {
  NODE_ENV: Constants.expoConfig?.extra?.env || process.env.NODE_ENV,
  BASE_URL:
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BASE_URL ||
    process.env.EXPO_PUBLIC_BASE_URL,
}
