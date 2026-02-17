import { access } from 'fs/promises'
import { createLogger } from '../utils/logging.js'

const logger = createLogger('src/config/files.ts')

const checkRequiredFiles = async (): Promise<void> => {
  try {
    logger.debug('Checking required files')
    console.log('📁 REQUIRED FILES')
    console.log('━━━━━━━━━━━━━━━━━')
    
    const requiredFiles = [
      'bin/init-ai.js',
      'index.ts',
      'README.md',
      'src/init.ts',
      'src/utils/logging.ts',
      'src/utils/file-operations.ts'
    ]
    
    await Promise.all(requiredFiles.map(async file => {
      try {
        await access(file)
        console.log(`✅ ${file}`)
        logger.debug(`File exists: ${file}`)
      } catch {
        console.log(`❌ ${file} - Missing`)
        logger.debug(`File missing: ${file}`)
      }
    }))
    
    console.log('')
  } catch (error) {
    logger.error('Failed to check required files', error)
  }
}

export { checkRequiredFiles }