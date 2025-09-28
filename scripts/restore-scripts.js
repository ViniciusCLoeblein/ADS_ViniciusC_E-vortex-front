const fs = require('fs')

const packageJson = require('./package.json')

packageJson.scripts.android = 'expo start --android'
packageJson.scripts.ios = 'expo start --ios'

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2))
console.log('✅ Scripts restaurados.')
