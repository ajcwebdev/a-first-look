import { run, createLogger, value, label, muted, errorStyle } from '@/utils'

const p = '[commands/devbox-utils/test-ssh-connection]'
const { l, debug, trace } = createLogger(p)

export const testSSHConnection = async (host: string, user: string, maxAttempts = 3): Promise<boolean> => {
  debug('testing SSH connection', value(`${user}@${host}`))
  
  const statusResult = await run('tailscale', ['status'])
  let discoveredHost: string | null = null
  
  if (statusResult.code === 0) {
    const lines = statusResult.stdout.split('\n')
    for (const line of lines) {
      if (line.toLowerCase().includes(host.toLowerCase())) {
        const parts = line.trim().split(/\s+/)
        const deviceName = parts[1]
        if (deviceName && (deviceName.startsWith(host) || deviceName.includes(host))) {
          discoveredHost = deviceName
          debug('found actual hostname in tailscale status', value(discoveredHost))
          break
        }
      }
    }
  }
  
  const hostVariants = [
    discoveredHost,
    host,
    `${host}-1`,
    `${host}-2`,
    `${host}.tail`,
    `${host}.tailnet`,
  ].filter(Boolean)
  
  for (const variant of hostVariants) {
    if (!variant) continue
    debug('trying SSH to variant', value(variant))
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      trace('SSH attempt', label('attempt:'), value(`${attempt}/${maxAttempts}`), label('variant:'), value(variant))
      
      const { code, stdout, stderr } = await run('tailscale', [
        'ssh',
        `${user}@${variant}`,
        'echo',
        'connected'
      ])
      
      if (code === 0) {
        l('SSH connection successful to', value(variant))
        return true
      }
      
      debug('SSH failed', label('code:'), value(code), errorStyle(stderr?.slice(0, 100) || stdout?.slice(0, 100) || 'no output'))
      
      if (attempt < maxAttempts) {
        const waitTime = 3000 * attempt
        debug('waiting before SSH retry', muted(`${waitTime}ms`))
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  return false
}