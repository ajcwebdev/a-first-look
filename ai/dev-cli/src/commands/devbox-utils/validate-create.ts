import { run, createLogger, error as errorStyle, info as infoStyle, warning as warningStyle, underline, value, l as plainL, err as plainErr } from '@/utils'
import { validateAuthKey } from './validate-auth-key.js'

const p = '[commands/devbox-utils/validate-create]'
const { l, debug } = createLogger(p)

export const validateTailscaleAuthKey = async (envAuthKey: string | undefined): Promise<string> => {
  l('validating tailscale auth key presence')
  
  const authKey = envAuthKey || ''
  
  if (!authKey) {
    plainErr(`\n${errorStyle('❌ Missing Tailscale auth key')}`)
    plainErr('\nYou need to set the Tailscale auth key as an environment variable:')
    plainErr('1. Create a .env file with: TS_AUTHKEY=tskey-auth-...')
    plainErr('2. Or export it: export TS_AUTHKEY=tskey-auth-...')
    plainErr(`\n${infoStyle('Generate a key at:')} ${underline('https://login.tailscale.com/admin/settings/keys')}`)
    plainErr('Make sure to create a reusable key if you plan to use it multiple times.')
    throw new Error('missing tailscale auth key')
  }
  
  l('validating auth key format')
  const authValidation = await validateAuthKey(authKey)
  
  if (!authValidation.valid) {
    plainErr(`\n${errorStyle('❌ Invalid auth key:')} ${authValidation.error}`)
    plainErr('\nAuth keys should:')
    plainErr('- Start with "tskey-auth-" or "tskey-"')
    plainErr('- Be generated from https://login.tailscale.com/admin/settings/keys')
    plainErr('- Not be expired')
    plainErr('- Be marked as reusable if used before')
    throw new Error(`Invalid auth key: ${authValidation.error}`)
  }
  
  debug('auth key validation successful')
  return authKey
}

export const checkLocalTailscaleConnectivity = async (): Promise<{ connected: boolean, deviceCount: number }> => {
  l('checking local tailscale connectivity')
  
  const localCheck = await run('tailscale', ['status'])
  
  if (localCheck.code !== 0) {
    l('local tailscale may not be running', 'ensure tailscale is connected')
    plainErr(`\n${warningStyle('⚠️  Local Tailscale may not be running')}`)
    plainErr('Make sure you are connected to Tailscale: tailscale up')
    return { connected: false, deviceCount: 0 }
  }
  
  l('local tailscale is running')
  const localLines = localCheck.stdout.split('\n')
  const deviceCount = localLines.filter(line => line.trim()).length - 1
  l('devices in tailnet:', value(deviceCount))
  
  return { connected: true, deviceCount }
}

export const handleTailscaleConnectionError = (error: unknown, instanceId: string | undefined): void => {
  l('handling tailscale connection error')
  
  if (error instanceof Error && error.message.includes('offline')) {
    plainErr(`\n${errorStyle('❌ Device is offline in Tailscale')}`)
    plainErr('\nThis typically means the auth key is invalid. Please check:')
    plainErr('1. The auth key is not expired')
    plainErr('2. The auth key is marked as reusable (if used before)')
    plainErr('3. The auth key has proper permissions')
    plainErr('\nTo fix this:')
    plainErr(`1. Delete this instance: ${infoStyle('bun run cli devbox delete --id')} ${value(instanceId || 'unknown')}`)
    plainErr('2. Generate a new auth key at https://login.tailscale.com/admin/settings/keys')
    plainErr('3. Update your TS_AUTHKEY environment variable')
    plainErr('4. Try creating again')
  }
}

export const performFallbackVerification = async (host: string): Promise<{ success: boolean, actualHostname: string }> => {
  l('performing fallback verification for', value(host))
  
  let actualHostname = host
  
  const fallbackChecks = [
    async () => {
      l('fallback: checking with FQDN variations')
      const domains = ['tail', 'tailscale.com', 'tailnet']
      for (const domain of domains) {
        const fqdn = `${host}.${domain}`
        debug('trying FQDN', value(fqdn))
        const { code } = await run('tailscale', ['ping', '--c', '1', fqdn])
        if (code === 0) {
          l('success with FQDN', value(fqdn))
          actualHostname = fqdn
          return true
        }
      }
      return false
    },
    async () => {
      l('fallback: listing all devices')
      const { stdout } = await run('tailscale', ['status'])
      plainL(`\n${infoStyle('Current Tailscale devices:')}`)
      plainL(stdout)
      const hasOfflineDevice = stdout.toLowerCase().includes('offline')
      if (hasOfflineDevice) {
        plainErr(`\n${warningStyle('⚠️  Device appears offline - auth key is likely invalid')}`)
      }
      const lines = stdout.split('\n')
      for (const line of lines) {
        if (line.toLowerCase().includes(host.toLowerCase())) {
          const parts = line.trim().split(/\s+/)
          const deviceName = parts[1]
          if (deviceName) {
            l('found device in status', value(deviceName))
            actualHostname = deviceName
          }
        }
      }
      return false
    },
    async () => {
      l('fallback: checking instance status on Vultr')
      const { stdout } = await run('vultr-cli', ['instance', 'list'])
      const lines = stdout.split('\n')
      for (const line of lines) {
        if (line.includes(host)) {
          debug('found instance in vultr list', line.slice(0, 100))
        }
      }
      return false
    }
  ]
  
  let connected = false
  for (const check of fallbackChecks) {
    if (await check()) {
      connected = true
      break
    }
  }
  
  return { success: connected, actualHostname }
}

export const verifyFinalDeviceStatus = async (host: string, actualHostname: string): Promise<{ verified: boolean, isOffline: boolean }> => {
  l('verifying final device status')
  
  const finalStatus = await run('tailscale', ['status'])
  
  if (finalStatus.code !== 0) {
    return { verified: false, isOffline: false }
  }
  
  const lines = finalStatus.stdout.split('\n')
  const deviceLine = lines.find(line => 
    line.toLowerCase().includes(host.toLowerCase()) || 
    line.toLowerCase().includes(actualHostname.toLowerCase())
  )
  
  if (deviceLine) {
    l('device confirmed in tailnet', value(deviceLine.trim()))
    const isOffline = deviceLine.includes('offline')
    
    if (isOffline) {
      plainErr(`\n${warningStyle('⚠️  Warning: Device is showing as offline')}`)
      plainErr('The auth key may be invalid or expired')
    }
    
    return { verified: true, isOffline }
  }
  
  return { verified: false, isOffline: false }
}

export const displayCreationSummary = (host: string, actualHostname: string, instanceId: string | undefined, user: string): void => {
  l('displaying creation summary')
  
  plainL(`\n${infoStyle('✅ Devbox created successfully!')}`)
  plainL(`${infoStyle('Requested hostname:')} ${value(host)}`)
  plainL(`${infoStyle('Actual hostname:')} ${value(actualHostname)}`)
  plainL(`${infoStyle('Instance ID:')} ${value(instanceId || 'unknown')}`)
  
  if (actualHostname !== host) {
    plainL(`\n${warningStyle('Note:')} Tailscale assigned hostname ${value(actualHostname)} instead of ${value(host)}`)
    plainL('This usually happens when the requested hostname already exists in your tailnet')
  }
  
  plainL(`\n${infoStyle('Connect with:')}`)
  plainL(`  ${infoStyle('bun run cli devbox ssh --host')} ${value(actualHostname)} ${infoStyle('--user')} ${value(user)}`)
  plainL(`\n${infoStyle('Setup development tools:')}`)
  plainL(`  ${infoStyle('bun run cli devbox setup --host')} ${value(actualHostname)}`)
}

export const displayConnectionInstructions = (actualHostname: string, instanceId: string | undefined): void => {
  l('displaying connection troubleshooting instructions')
  
  plainL(`\n${warningStyle('⚠️  Instance created but not yet accessible via Tailscale')}`)
  plainL(`${infoStyle('Instance ID:')} ${value(instanceId || 'unknown')}`)
  plainL(`\nPossible reasons:`)
  plainL(`1. Cloud-init is still running (wait 2-3 more minutes)`)
  plainL(`2. Tailscale auth key is invalid or expired`)
  plainL(`3. Network connectivity issues`)
  plainL(`\nTry these commands:`)
  plainL(`  ${infoStyle('bun run cli devbox ping --host')} ${value(actualHostname)}`)
  plainL(`  ${infoStyle('bun run cli devbox status')}`)
  plainL(`  ${infoStyle('vultr-cli instance get')} ${value(instanceId || 'unknown')}`)
  plainL(`\n${infoStyle('To see what the script is doing:')}`)
  plainL(`  ${infoStyle('DEBUG=1 bun run cli devbox create')} ...`)
}