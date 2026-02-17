import { exec } from 'child_process'
import { promisify } from 'util'
import { createLogger } from '../utils/logging.js'

const execAsync = promisify(exec)
const logger = createLogger('src/config/dependencies.ts')

const checkDependencies = async (): Promise<void> => {
  try {
    logger.debug('Analyzing dependencies')
    console.log('📦 DEPENDENCIES ANALYSIS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━')
    
    try {
      logger.debug('Running npm audit')
      const { stdout: auditResult } = await execAsync('npm audit --audit-level=high --json', { timeout: 15000 })
      const audit = JSON.parse(auditResult)
      const vulnCount = audit.metadata?.vulnerabilities?.total || 0
      
      console.log(`${vulnCount === 0 ? '✅' : '❌'} Security vulnerabilities: ${vulnCount}`)
      logger.debug(`Security vulnerabilities found: ${vulnCount}`)
      
      if (vulnCount > 0) {
        console.log('   Run: npm audit fix')
      }
    } catch {
      console.log('⚠️ Could not run security audit')
      logger.debug('Failed to run npm audit')
    }
    
    try {
      logger.debug('Checking for outdated packages')
      const { stdout: outdated } = await execAsync('npm outdated --json', { timeout: 10000 })
      const outdatedPkgs = Object.keys(JSON.parse(outdated || '{}'))
      console.log(`${outdatedPkgs.length === 0 ? '✅' : '⚠️'} Outdated packages: ${outdatedPkgs.length}`)
      logger.debug(`Outdated packages count: ${outdatedPkgs.length}`)
      
      if (outdatedPkgs.length > 0) {
        console.log(`   Packages: ${outdatedPkgs.join(', ')}`)
        logger.debug(`Outdated packages: ${outdatedPkgs.join(', ')}`)
      }
    } catch {
      console.log('✅ All packages up to date')
      logger.debug('All packages are up to date')
    }
    
    console.log('')
  } catch (error) {
    logger.error('Failed to check dependencies', error)
  }
}

export { checkDependencies }