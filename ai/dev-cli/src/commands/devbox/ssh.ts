import { parseArgs, requireOption, getOption, runInteractive, createLogger, value } from '@/utils'
import { ensure } from '../devbox-utils/ensure.js'

const p = '[commands/devbox/ssh]'
const { l } = createLogger(p)

export const ssh = async (args: string[]): Promise<void> => {
  l('starting ssh command')
  await ensure(['tailscale'])
  
  const { options } = parseArgs(args)
  const host = requireOption(options, 'host')
  const user = getOption(options, 'user', 'dev')
  
  l('connecting to', value(`${user}@${host}`))
  const code = await runInteractive('tailscale', ['ssh', `${user}@${host}`])
  process.exitCode = code
}