import { parseArgs, requireOption, getBoolOption, run, createLogger, value, muted } from '@/utils'
import { ensure } from '../devbox-utils/ensure.js'

const p = '[commands/devbox/ip]'
const { l } = createLogger(p)

export const ip = async (args: string[]): Promise<void> => {
  l('getting IP address')
  await ensure(['tailscale'])
  
  const { options } = parseArgs(args)
  const host = requireOption(options, 'host')
  const v4 = getBoolOption(options, '4')
  const v6 = getBoolOption(options, '6')
  const flags = v4 ? ['-4'] : v6 ? ['-6'] : []
  
  l(`fetching IP for ${value(host)}`, flags.length > 0 ? muted(flags.join(' ')) : '')
  const { code, stdout, stderr } = await run('tailscale', ['ip', ...flags, host])
  if (code !== 0) throw new Error(stderr || stdout)
  process.stdout.write(stdout)
}