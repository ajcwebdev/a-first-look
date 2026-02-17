import { readFile } from 'fs/promises'
import { createLogger } from '../utils/logging.js'

const logger = createLogger('src/config/package-json.ts')

const checkPackageJson = async (): Promise<void> => {
  try {
    logger.debug('Checking package.json configuration')
    console.log('📄 PACKAGE.JSON CONFIGURATION')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const packageContent = await readFile('package.json', 'utf8')
    const pkg = JSON.parse(packageContent)
    logger.debug('Package.json loaded successfully')
    
    const checks = [
      { field: 'name', value: pkg.name, required: true },
      { field: 'version', value: pkg.version, required: true },
      { field: 'description', value: pkg.description, required: true },
      { field: 'main', value: pkg.main, required: true },
      { field: 'bin', value: pkg.bin ? JSON.stringify(pkg.bin) : undefined, required: true },
      { field: 'files', value: pkg.files ? pkg.files.join(', ') : undefined, required: true },
      { field: 'keywords', value: pkg.keywords ? pkg.keywords.join(', ') : undefined, required: false },
      { field: 'author', value: pkg.author, required: true },
      { field: 'license', value: pkg.license, required: true },
      { field: 'engines', value: pkg.engines ? JSON.stringify(pkg.engines) : undefined, required: true }
    ]
    
    checks.map(check => {
      const status = check.value ? '✅' : (check.required ? '❌' : '⚠️')
      const value = check.value || 'Not set'
      console.log(`${status} ${check.field}: ${value}`)
      logger.debug(`${check.field}: ${status} - ${value}`)
    })
    
    console.log('')
  } catch (error) {
    console.log('❌ Could not read package.json')
    logger.error('Failed to check package.json', error)
  }
}

export { checkPackageJson }