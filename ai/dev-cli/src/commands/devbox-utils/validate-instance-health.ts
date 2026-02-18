import { run, createLogger, value } from '@/utils'
import type { HealthStatus } from '../../types.js'

const p = '[commands/devbox-utils/validate-instance-health]'
const { debug } = createLogger(p)

export const validateInstanceHealth = async (host: string, user: string): Promise<HealthStatus> => {
  debug('validating health for', value(`${user}@${host}`))
  const issues: string[] = []
  let sshAvailable = false
  
  const pingResult = await run('tailscale', ['ping', '--c', '1', host])
  if (pingResult.code !== 0) {
    issues.push('Cannot ping device via Tailscale')
  }
  
  const sshResult = await run('tailscale', ['ssh', `${user}@${host}`, 'echo', 'health-check'])
  if (sshResult.code === 0 && sshResult.stdout.includes('health-check')) {
    sshAvailable = true
  } else {
    issues.push('SSH is not accessible')
  }
  
  return {
    healthy: issues.length === 0,
    sshAvailable,
    issues
  }
}