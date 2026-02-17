import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { homedir } from 'os'
import { createLogger } from './utils/logging.js'
import { ensureDirectory, writeFile, copyFile, fileExists, makeExecutable } from './utils/file-operations.js'
import { tsconfigTemplate } from './templates/tsconfig.template.js'
import { repomixScriptTemplate } from './templates/repomix-script.template.js'
import { repomixInstructionTemplate } from './templates/repomix-instruction.template.js'

const execAsync = promisify(exec)
const logger = createLogger('src/init.ts')

const initProject = async (projectPath: string): Promise<void> => {
  try {
    logger.info(`Initializing TypeScript project at: ${projectPath}`)
    
    await ensureDirectory(projectPath)
    process.chdir(projectPath)
    
    await runNpmInit()
    const projectName = await getProjectName()
    await createProjectFiles(projectName)
    await installDependencies()
    await updatePackageJson()
    await copyAiConfig()
    await openInVSCode()
    
    logger.success('TypeScript project initialized successfully!')
  } catch (error) {
    logger.error('Failed to initialize project', error)
    throw error
  }
}

const runNpmInit = async (): Promise<void> => {
  try {
    logger.debug('Running npm init -y')
    await execAsync('npm init -y')
    logger.success('npm init completed')
  } catch (error) {
    logger.error('npm init failed', error)
    throw error
  }
}

const getProjectName = async (): Promise<string> => {
  try {
    logger.debug('Reading project name from package.json')
    const { stdout } = await execAsync('node -p "require(\'./package.json\').name"')
    const projectName = stdout.trim()
    logger.success(`Project name: ${projectName}`)
    return projectName
  } catch (error) {
    logger.error('Failed to get project name', error)
    throw error
  }
}

const createProjectFiles = async (projectName: string): Promise<void> => {
  try {
    logger.debug('Creating project files')
    
    const files = [
      { name: 'README.md', content: `# ${projectName}\n` },
      { name: 'index.ts', content: 'console.log("Hello World")\n' },
      { name: 'tsconfig.json', content: tsconfigTemplate() },
      { name: 'repomix.sh', content: repomixScriptTemplate() },
      { name: 'repomix-instruction.md', content: repomixInstructionTemplate() },
      { name: '.gitignore', content: '.DS_Store\nnode_modules\ndist\n*.env*\nnew-*.*\nTODO.md\n' }
    ]
    
    await Promise.all(files.map(async file => {
      await writeFile(file.name, file.content)
      file.name === 'repomix.sh' && await makeExecutable(file.name)
    }))
    
    logger.success('All project files created')
  } catch (error) {
    logger.error('Failed to create project files', error)
    throw error
  }
}

const installDependencies = async (): Promise<void> => {
  try {
    logger.debug('Installing dependencies')
    
    const commands = [
      'npm i -E commander',
      'npm i -DE repomix tsx typescript @types/node'
    ]
    
    for (const command of commands) {
      logger.debug(`Running: ${command}`)
      await execAsync(command)
    }
    
    logger.success('Dependencies installed')
  } catch (error) {
    logger.error('Failed to install dependencies', error)
    throw error
  }
}

const updatePackageJson = async (): Promise<void> => {
  try {
    logger.debug('Updating package.json')
    
    const updates = [
      'npm pkg set type=module',
      'npm pkg set scripts.repo="bash repomix.sh"',
      'npm pkg set scripts.dev="tsx --env-file=.env --no-warnings index.ts"',
      'npm pkg set scripts.check="npx tsc --noEmit"'
    ]
    
    for (const update of updates) {
      logger.debug(`Running: ${update}`)
      await execAsync(update)
    }
    
    logger.success('package.json updated')
  } catch (error) {
    logger.error('Failed to update package.json', error)
    throw error
  }
}

const copyAiConfig = async (): Promise<void> => {
  try {
    const aiConfigPath = join(homedir(), '.aiconfig')
    const envPath = '.env'
    
    logger.debug(`Checking for AI config at: ${aiConfigPath}`)
    
    const configExists = await fileExists(aiConfigPath)
    configExists && await copyFile(aiConfigPath, envPath)
    
    logger.success(configExists ? 'AI config copied to .env' : 'No AI config found, skipping')
  } catch (error) {
    logger.error('Failed to copy AI config', error)
  }
}

const openInVSCode = async (): Promise<void> => {
  try {
    logger.debug('Opening project in VS Code')
    await execAsync('code .')
    logger.success('Project opened in VS Code')
  } catch (error) {
    logger.error('Failed to open VS Code (code command not found)', error)
  }
}

export { initProject }