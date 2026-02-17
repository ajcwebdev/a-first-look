import { promises as fs } from 'fs'
import { createLogger } from './logging.js'

const logger = createLogger('src/utils/file-operations.ts')

const ensureDirectory = async (dirPath: string): Promise<void> => {
  try {
    logger.debug(`Ensuring directory exists: ${dirPath}`)
    await fs.mkdir(dirPath, { recursive: true })
    logger.success(`Directory created: ${dirPath}`)
  } catch (error) {
    logger.error(`Failed to create directory: ${dirPath}`, error)
    throw error
  }
}

const writeFile = async (filePath: string, content: string): Promise<void> => {
  try {
    logger.debug(`Writing file: ${filePath}`)
    await fs.writeFile(filePath, content, 'utf8')
    logger.success(`File written: ${filePath}`)
  } catch (error) {
    logger.error(`Failed to write file: ${filePath}`, error)
    throw error
  }
}

const copyFile = async (sourcePath: string, destPath: string): Promise<void> => {
  try {
    logger.debug(`Copying file from ${sourcePath} to ${destPath}`)
    await fs.copyFile(sourcePath, destPath)
    logger.success(`File copied: ${destPath}`)
  } catch (error) {
    logger.error(`Failed to copy file from ${sourcePath} to ${destPath}`, error)
    throw error
  }
}

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const makeExecutable = async (filePath: string): Promise<void> => {
  try {
    logger.debug(`Making file executable: ${filePath}`)
    await fs.chmod(filePath, 0o755)
    logger.success(`File made executable: ${filePath}`)
  } catch (error) {
    logger.error(`Failed to make file executable: ${filePath}`, error)
    throw error
  }
}

export { ensureDirectory, writeFile, copyFile, fileExists, makeExecutable }