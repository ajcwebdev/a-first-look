import { run, createLogger } from '@/utils'
import { ensure } from '../devbox-utils/ensure.js'

const p = '[commands/devbox/status]'
const { l } = createLogger(p)

export const status = async (): Promise<void> => {
  l('getting tailscale status')
  await ensure(['tailscale'])
  
  const { code, stdout, stderr } = await run('tailscale', ['status'])
  if (code !== 0) throw new Error(stderr || stdout)
  process.stdout.write(stdout)
}