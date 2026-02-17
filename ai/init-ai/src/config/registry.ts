import { exec } from 'child_process'
import { promisify } from 'util'
import { createLogger } from '../utils/logging.js'

const execAsync = promisify(exec)
const logger = createLogger('src/config/registry.ts')

const checkNpmRegistry = async (): Promise<void> => {
  try {
    logger.debug('Checking npm registry information')
    console.log('🌐 NPM REGISTRY INFO')
    console.log('━━━━━━━━━━━━━━━━━━━')
    
    try {
      const { stdout: registry } = await execAsync('npm config get registry')
      const isOfficial = registry.trim() === 'https://registry.npmjs.org/'
      console.log(`📦 Current registry: ${registry.trim()}`)
      console.log(`${isOfficial ? '✅' : '⚠️'} ${isOfficial ? 'Using official npm registry' : 'Using custom registry'}`)
      logger.debug(`Registry: ${registry.trim()}, Official: ${isOfficial}`)
    } catch {
      console.log('❌ Could not get registry information')
      logger.error('Failed to get registry information')
    }
    
    console.log('')
  } catch (error) {
    logger.error('Failed to check npm registry', error)
  }
}

export { checkNpmRegistry }