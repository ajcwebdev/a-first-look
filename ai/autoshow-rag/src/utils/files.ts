import { readFile } from 'fs/promises'
import { glob } from 'glob'
import { join } from 'path'

export interface FileContent {
  filename: string
  content: string
}

export async function readContentFiles(directory: string): Promise<FileContent[]> {
  console.log(`Reading content files from ${directory}`)
  
  const patterns = ['**/*.txt', '**/*.md']
  const files: string[] = []
  
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: directory })
    files.push(...matches.map(f => join(directory, f)))
  }
  
  console.log(`Found ${files.length} files to process`)
  
  const contents = await Promise.all(
    files.map(async (filepath) => {
      const content = await readFile(filepath, 'utf-8')
      return {
        filename: filepath,
        content: content.trim()
      }
    })
  )
  
  return contents.filter(f => f.content.length > 0)
}