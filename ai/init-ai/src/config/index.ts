import { createLogger } from '../utils/logging.js'
import { checkNpmAuth } from './npm-auth.js'
import { checkPackageJson } from './package-json.js'
import { checkRequiredFiles } from './files.js'
import { checkNpmRegistry } from './registry.js'
import { checkPackageName } from './package-name.js'
import { checkVersioning } from './versioning.js'
import { checkDependencies } from './dependencies.js'
import { checkPackagePreview } from './package-preview.js'
import { showPublishingSteps } from './publishing-steps.js'

const logger = createLogger('src/config/index.ts')

const checkConfig = async (): Promise<void> => {
  try {
    logger.info('Analyzing npm publishing configuration...')
    console.log('\n🔍 NPM PUBLISHING READINESS CHECK\n')
    
    await checkNpmAuth()
    await checkPackageJson()
    await checkRequiredFiles()
    await checkNpmRegistry()
    await checkPackageName()
    await checkVersioning()
    await checkDependencies()
    await checkPackagePreview()
    await showPublishingSteps()
    
    console.log('\n✅ Configuration analysis complete!')
  } catch (error) {
    logger.error('Configuration check failed', error)
    throw error
  }
}

export { checkConfig }