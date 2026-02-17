import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile } from 'fs/promises'
import { createLogger } from '../utils/logging.js'

const execAsync = promisify(exec)
const logger = createLogger('src/config/package-name.ts')

const checkPackageName = async (): Promise<void> => {
  try {
    logger.debug('Checking package name availability')
    console.log('🔍 PACKAGE NAME AVAILABILITY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const packageContent = await readFile('package.json', 'utf8')
    const pkg = JSON.parse(packageContent)
    
    if (!pkg.name) {
      console.log('❌ No package name specified')
      logger.debug('No package name found in package.json')
      console.log('')
      return
    }
    
    logger.debug(`Checking availability for package: ${pkg.name}`)
    
    try {
      await execAsync(`npm view ${pkg.name} version`, { timeout: 10000 })
      console.log(`❌ Package name "${pkg.name}" is already taken`)
      console.log('   Consider using a scoped package: @username/package-name')
      logger.debug(`Package name ${pkg.name} is taken`)
    } catch {
      console.log(`✅ Package name "${pkg.name}" appears to be available`)
      logger.success(`Package name ${pkg.name} is available`)
    }
    
    console.log('')
  } catch (error) {
    logger.error('Failed to check package name availability', error)
  }
}

export { checkPackageName }