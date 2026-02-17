import { run, createLogger, info as infoStyle, muted, l } from '@/utils'
import { ensure } from '../devbox-utils/ensure.js'

const p = '[commands/devbox/list]'
const { l: log } = createLogger(p)

export const listOs = async (_args: string[]): Promise<void> => {
  log('listing available OS options')
  await ensure(['vultr-cli'])
  
  const { code, stdout, stderr } = await run('vultr-cli', ['os', 'list'])
  if (code !== 0) throw new Error(stderr || stdout)
  
  l(`\n${infoStyle('Vultr OS List:')}`)
  l(muted('Look for Ubuntu, Debian, or Rocky Linux IDs'))
  l(muted('---'))
  process.stdout.write(stdout)
}

export const listPlans = async (_args: string[]): Promise<void> => {
  log('listing available plans')
  await ensure(['vultr-cli'])
  
  const { code, stdout, stderr } = await run('vultr-cli', ['plans', 'list'])
  if (code !== 0) throw new Error(stderr || stdout)
  
  l(`\n${infoStyle('Vultr Plans:')}`)
  l(muted('---'))
  process.stdout.write(stdout)
}

export const listRegions = async (_args: string[]): Promise<void> => {
  log('listing available regions')
  await ensure(['vultr-cli'])
  
  const { code, stdout, stderr } = await run('vultr-cli', ['regions', 'list'])
  if (code !== 0) throw new Error(stderr || stdout)
  
  l(`\n${infoStyle('Vultr Regions:')}`)
  l(muted('---'))
  process.stdout.write(stdout)
}