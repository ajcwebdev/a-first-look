import { Command } from 'commander'
import { resolve } from 'path'
import { initProject } from './src/init.js'
import { checkConfig } from './src/config/index.js'
import { createLogger } from './src/utils/logging.js'

const logger = createLogger('index.ts')
const program = new Command()

program
  .name('init-ai')
  .description('Initialize a TypeScript project with AI development setup')
  .version('1.0.0')

program
  .argument('[project-name]', 'Name of the project directory to create')
  .description('Initialize a new TypeScript project')
  .action(async (projectName?: string): Promise<void> => {
    try {
      const targetPath = projectName ? resolve(projectName) : process.cwd()
      logger.info(`Starting initialization for: ${targetPath}`)
      await initProject(targetPath)
    } catch (error) {
      logger.error('Initialization failed', error)
      process.exit(1)
    }
  })

program
  .command('config')
  .description('Analyze npm publishing configuration and readiness')
  .action(async (): Promise<void> => {
    try {
      await checkConfig()
    } catch (error) {
      logger.error('Configuration analysis failed', error)
      process.exit(1)
    }
  })

program.parse()