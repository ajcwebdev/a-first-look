import { runJson, run, createLogger, value, label, errorStyle } from '@/utils'
import type { ExistingInstance } from '../../types.js'

const p = '[commands/devbox-utils/check-existing-instance]'
const { l, debug } = createLogger(p)

export const checkExistingInstance = async (host: string): Promise<ExistingInstance> => {
  l('checking for existing instances with hostname', value(host))
  const result: ExistingInstance = {}
  
  try {
    const vultrData = await runJson<{ instances: Array<{ id: string; label: string; status: string; main_ip: string }> }>('vultr-cli', ['instance', 'list', '-o', 'json'])
    const matchingInstance = vultrData.instances.find(inst => 
      inst.label === host || inst.label.startsWith(`${host}-`)
    )
    
    if (matchingInstance) {
      result.vultrInstance = matchingInstance
      debug('found vultr instance', value(matchingInstance.id))
    }
  } catch (error) {
    debug('failed to check vultr instances', errorStyle(error instanceof Error ? error.message : String(error)))
  }
  
  try {
    const { code, stdout } = await run('tailscale', ['status'])
    if (code === 0) {
      const lines = stdout.split('\n')
      for (const line of lines) {
        if (line.toLowerCase().includes(host.toLowerCase())) {
          const parts = line.trim().split(/\s+/)
          const ip = parts[0]
          const deviceName = parts[1]
          const status = line.includes('active') ? 'active' : line.includes('idle') ? 'idle' : line.includes('offline') ? 'offline' : 'idle'
          
          if (ip && deviceName && (deviceName === host || deviceName.startsWith(`${host}-`))) {
            result.tailscaleDevice = {
              name: deviceName,
              ip: ip,
              status: status as 'active' | 'idle' | 'offline'
            }
            debug('found tailscale device', value(deviceName), label('status:'), value(status))
            break
          }
        }
      }
    }
  } catch (error) {
    debug('failed to check tailscale status', errorStyle(error instanceof Error ? error.message : String(error)))
  }
  
  return result
}