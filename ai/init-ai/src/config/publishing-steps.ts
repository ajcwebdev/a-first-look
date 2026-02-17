import { createLogger } from '../utils/logging.js'

const logger = createLogger('src/config/publishing-steps.ts')

const showPublishingSteps = async (): Promise<void> => {
  try {
    logger.debug('Displaying publishing steps')
    console.log('🚀 NEXT STEPS FOR PUBLISHING')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('1. Ensure you are logged in: npm login')
    console.log('2. Test package locally: npm install -g .')
    console.log('3. Test the command: init-ai --help')
    console.log('4. Uninstall local test: npm uninstall -g init-ai')
    console.log('5. Preview package: npm pack --dry-run')
    console.log('6. Publish package: npm publish')
    console.log('7. Verify at: https://www.npmjs.com/package/init-ai')
    console.log('')
    console.log('For updates:')
    console.log('• npm version patch  (1.0.0 → 1.0.1)')
    console.log('• npm version minor  (1.0.0 → 1.1.0)')
    console.log('• npm version major  (1.0.0 → 2.0.0)')
    console.log('• npm publish')
    console.log('')
    logger.success('Publishing steps displayed')
  } catch (error) {
    logger.error('Failed to show publishing steps', error)
  }
}

export { showPublishingSteps }