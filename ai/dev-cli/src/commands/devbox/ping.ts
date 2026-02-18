import { parseArgs, requireOption, getOption, runInteractive, createLogger, value, label } from '@/utils'
import { ensure } from '../devbox-utils/ensure.js'

const p = '[commands/devbox/ping]'
const { l } = createLogger(p)

export const ping = async (args: string[]): Promise<void> => {
  l('starting ping command')
  await ensure(['tailscale'])
  
  const { options } = parseArgs(args)
  const host = requireOption(options, 'host')
  const count = getOption(options, 'count', '5')
  
  l(`pinging ${value(host)}`, label('count:'), value(count))
  const code = await runInteractive('tailscale', ['ping', '--c', count, host])
  process.exitCode = code
}