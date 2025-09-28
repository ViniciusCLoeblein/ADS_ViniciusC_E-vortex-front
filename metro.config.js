// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

config.resolver.alias = {
  ...config.resolver.alias,
  '@': __dirname,
}

config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
}

config.resolver.platforms = ['ios', 'android', 'native', 'web']

module.exports = withNativeWind(config, { input: './global.css' })
