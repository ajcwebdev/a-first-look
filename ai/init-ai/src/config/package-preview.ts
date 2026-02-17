import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile } from 'fs/promises'
import { createLogger } from '../utils/logging.js'

const execAsync = promisify(exec)
const logger = createLogger('src/config/package-preview.ts')

const checkPackagePreview = async (): Promise<void> => {
  try {
    logger.debug('Generating package preview')
    console.log('📦 PACKAGE PREVIEW')
    console.log('━━━━━━━━━━━━━━━━━━')
    
    let success = false
    
    try {
      logger.debug('Installing npm-packlist temporarily')
      console.log('Installing npm-packlist temporarily...')
      await execAsync('npm install --no-save npm-packlist', { timeout: 30000 })
      
      const { stdout: packlistOutput } = await execAsync('npx npm-packlist', { timeout: 15000 })
      const files = packlistOutput.trim().split('\n').filter(line => line.trim())
      
      console.log('📋 Files to be included in package:')
      files.map(file => console.log(`   ✓ ${file}`))
      console.log(`\n📊 Total files: ${files.length}`)
      logger.success(`Package preview generated with ${files.length} files`)
      success = true
      
      await execAsync('npm uninstall npm-packlist', { timeout: 10000 })
      console.log('Cleaned up temporary npm-packlist installation')
      logger.debug('Cleaned up npm-packlist')
      
    } catch {
      try {
        await execAsync('npm uninstall npm-packlist', { timeout: 5000 })
      } catch {}
      
      logger.debug('Falling back to npm publish --dry-run analysis')
      console.log('Falling back to npm publish --dry-run analysis...')
      
      try {
        const { stdout, stderr } = await execAsync('npm publish --dry-run', { timeout: 15000 })
        const fullOutput = stdout + stderr
        logger.debug('npm publish --dry-run completed successfully')
        
        const lines = fullOutput.split('\n')
        let files: string[] = []
        let inTarballContents = false
        
        lines.map(line => {
          if (line.includes('Tarball Contents')) {
            inTarballContents = true
            logger.debug('Found Tarball Contents section')
            return
          }
          if (line.includes('Tarball Details')) {
            inTarballContents = false
            logger.debug('End of Tarball Contents section')
            return
          }
          if (inTarballContents && line.includes('npm notice') && !line.includes('Tarball')) {
            const match = line.match(/npm notice\s+[\d.]+\w+\s+(.+)/)
            if (match && match[1]) {
              files.push(match[1].trim())
            }
          }
        })
        
        logger.debug(`Files extracted from npm publish --dry-run: ${files.length}`)
        
        if (files.length > 0) {
          console.log('📋 Files to be included in package:')
          files.map(file => console.log(`   ✓ ${file}`))
          console.log(`\n📊 Total files: ${files.length}`)
          logger.success(`Package preview generated with ${files.length} files`)
          success = true
        }
      } catch (publishError) {
        logger.error('npm publish --dry-run failed', publishError)
        console.log('❌ npm publish --dry-run command failed')
      }
    }
    
    if (!success) {
      logger.debug('Using files field from package.json')
      console.log('📋 Package will be created based on files field:')
      const packageContent = await readFile('package.json', 'utf8')
      const pkg = JSON.parse(packageContent)
      
      if (pkg.files) {
        pkg.files.map((pattern: string) => console.log(`   → ${pattern}`))
        console.log('\nPlus package.json and README.md (always included)')
        logger.debug(`Files patterns: ${pkg.files.join(', ')}`)
      } else {
        console.log('   All files except those in .gitignore/.npmignore')
        logger.debug('No files field specified')
      }
    }
    
    console.log('')
  } catch (error) {
    console.log('❌ Could not preview package contents')
    logger.error('Failed to check package preview', error)
    console.log('')
  }
}

export { checkPackagePreview }