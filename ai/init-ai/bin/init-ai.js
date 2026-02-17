#!/usr/bin/env node

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const indexPath = join(__dirname, '..', 'index.ts')

const child = spawn('npx', ['tsx', indexPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true
})

child.on('exit', (code) => {
  process.exit(code || 0)
})

child.on('error', (error) => {
  console.error('Failed to start init-ai:', error.message)
  process.exit(1)
})