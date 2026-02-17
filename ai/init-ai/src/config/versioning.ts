import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile } from 'fs/promises'
import { createLogger } from '../utils/logging.js'

const execAsync = promisify(exec)
const logger = createLogger('src/config/versioning.ts')

const checkVersioning = async (): Promise<void> => {
  try {
    logger.debug('Checking versioning information')
    console.log('🏷️  VERSIONING INFO')
    console.log('━━━━━━━━━━━━━━━━━')
    
    const packageContent = await readFile('package.json', 'utf8')
    const pkg = JSON.parse(packageContent)
    
    console.log(`📋 Current version: ${pkg.version || 'Not set'}`)
    logger.debug(`Package version: ${pkg.version}`)
    
    try {
      const { stdout: gitStatus } = await execAsync('git status --porcelain')
      const hasChanges = gitStatus.trim().length > 0
      console.log(`${hasChanges ? '⚠️' : '✅'} Git working directory ${hasChanges ? 'has uncommitted changes' : 'is clean'}`)
      logger.debug(`Git status: ${hasChanges ? 'has changes' : 'clean'}`)
    } catch {
      console.log('⚠️ Not a git repository or git not available')
      logger.debug('Git not available or not a repository')
    }
    
    console.log('')
  } catch (error) {
    logger.error('Failed to check versioning info', error)
  }
}

export { checkVersioning }