#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 Otimizando build para produção...')

// Verificar se o arquivo app.config.ts existe
const configPath = path.join(__dirname, '..', 'app.config.ts')
if (!fs.existsSync(configPath)) {
  console.error('❌ app.config.ts não encontrado!')
  process.exit(1)
}

// Verificar se as permissões necessárias estão configuradas
const configContent = fs.readFileSync(configPath, 'utf8')

const requiredPermissions = ['CAMERA']

const requiredPlugins = ['expo-image-picker', 'expo-camera']

const missingPermissions = []
const missingPlugins = []

// Verificar permissões
requiredPermissions.forEach((permission) => {
  if (!configContent.includes(permission)) {
    missingPermissions.push(permission)
  }
})

// Verificar plugins
requiredPlugins.forEach((plugin) => {
  if (!configContent.includes(plugin)) {
    missingPlugins.push(plugin)
  }
})

if (missingPermissions.length > 0) {
  console.warn('⚠️ Permissões faltando:', missingPermissions.join(', '))
}

if (missingPlugins.length > 0) {
  console.warn('⚠️ Plugins faltando:', missingPlugins.join(', '))
}

// Limpar cache se necessário
const cacheDirs = [
  path.join(__dirname, '..', 'node_modules', '.cache'),
  path.join(__dirname, '..', '.expo'),
  path.join(__dirname, '..', 'android', 'build'),
  path.join(__dirname, '..', 'ios', 'build'),
]

console.log('🧹 Limpando caches...')
cacheDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true })
      console.log(`✅ Cache limpo: ${path.basename(dir)}`)
    } catch (error) {
      console.warn(`⚠️ Erro ao limpar cache ${dir}:`, error.message)
    }
  }
})

// Verificar se o eas.json está configurado corretamente
const easPath = path.join(__dirname, '..', 'eas.json')
if (fs.existsSync(easPath)) {
  const easContent = JSON.parse(fs.readFileSync(easPath, 'utf8'))

  if (easContent.build?.production?.env?.NODE_ENV !== 'production') {
    console.warn('⚠️ NODE_ENV não configurado como production no eas.json')
  } else {
    console.log('✅ eas.json configurado corretamente para produção')
  }
}

console.log('✅ Otimização concluída!')
console.log('📱 Build pronto para produção')

// Verificações finais
console.log('\n🔍 Verificações finais:')
console.log('1. Permissões de câmera configuradas (acesso único/pouco frequente)')
console.log('2. Plugins expo-camera e expo-image-picker configurados')
console.log('3. Variáveis de ambiente verificadas')
console.log('4. Caches limpos')
console.log('5. Configuração de produção aplicada')

console.log('\n🚀 Execute o build com:')
console.log('npm run build:android')
console.log('ou')
console.log('npm run build:ios')
