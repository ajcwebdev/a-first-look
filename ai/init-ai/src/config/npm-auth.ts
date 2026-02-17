import { exec } from 'child_process'
import { promisify } from 'util'
import { createLogger } from '../utils/logging.js'

const execAsync = promisify(exec)
const logger = createLogger('src/config/npm-auth.ts')

const checkNpmAuth = async (): Promise<void> => {
  try {
    logger.debug('Checking npm authentication')
    console.log('📋 NPM AUTHENTICATION')
    console.log('━━━━━━━━━━━━━━━━━━━━━━')
    
    try {
      const { stdout: whoami } = await execAsync('npm whoami')
      console.log(`✅ Logged in as: ${whoami.trim()}`)
      logger.success(`User authenticated: ${whoami.trim()}`)
    } catch {
      console.log('❌ Not logged in to npm')
      console.log('   Run: npm login')
      logger.debug('User not authenticated')
    }
    
    try {
      const { stdout: registry } = await execAsync('npm config get registry')
      console.log(`📦 Registry: ${registry.trim()}`)
      logger.debug(`Registry: ${registry.trim()}`)
    } catch {
      console.log('❌ Could not get npm registry')
      logger.error('Failed to get npm registry')
    }
    
    console.log('')
  } catch (error) {
    logger.error('Failed to check npm auth', error)
  }
}

export { checkNpmAuth }