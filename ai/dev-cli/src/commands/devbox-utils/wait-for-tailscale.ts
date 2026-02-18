import { run, createLogger, value, label, muted, errorStyle, warning, successStyle, infoStyle, l as plainL } from '@/utils'

const p = '[commands/devbox-utils/wait-for-tailscale]'
const { l, err, debug, trace } = createLogger(p)

export const waitForTailscale = async (host: string, maxAttempts = 60, delayMs = 10000): Promise<string> => {
  l(`waiting for tailscale connectivity to ${value(host)}`, label('max attempts:'), value(maxAttempts))
  
  l('initial wait for instance to boot', muted('60 seconds'))
  plainL(`${infoStyle('⏱  Waiting 60 seconds for instance to boot...')}`)
  await new Promise(resolve => setTimeout(resolve, 60000))
  
  const attempts = Array.from({ length: maxAttempts }, (_, i) => i + 1)
  let foundHostname: string | null = null
  let lastStatusOutput = ''
  let deviceIsOffline = false
  let offlineDetectedAttempt = 0
  let lastProgressReport = 0
  
  for (const attempt of attempts) {
    debug('connectivity check', label('attempt:'), value(`${attempt}/${maxAttempts}`))
    
    if (attempt - lastProgressReport >= 3) {
      plainL(`${infoStyle('⏱')}  Checking for device... (attempt ${attempt}/${maxAttempts})`)
      lastProgressReport = attempt
    }
    
    trace('fetching tailscale status')
    const statusResult = await run('tailscale', ['status'])
    lastStatusOutput = statusResult.stdout
    
    if (statusResult.code !== 0) {
      l('tailscale status command failed', errorStyle(statusResult.stderr || 'no error details'))
      if (attempt < maxAttempts) {
        debug('waiting before retry', muted(`${delayMs}ms`))
        await new Promise(resolve => setTimeout(resolve, delayMs))
        continue
      }
    }
    
    const statusLines = statusResult.stdout.split('\n')
    trace('tailscale status lines count:', value(statusLines.length))
    
    const devicesFound = statusLines.filter(line => line.trim() && !line.includes('# Health check') && line.includes('.')).length
    if (devicesFound > 0 && attempt % 3 === 0) {
      plainL(`${infoStyle('📡')}  ${devicesFound} device(s) in tailnet, looking for ${value(host)}...`)
    }
    
    const hostPatterns = [
      host,
      `${host}-`,
      `${host}.`,
      `${host}.tail`,
    ]
    
    trace('searching for host with patterns', muted(hostPatterns.join(', ')))
    
    let deviceLine = ''
    let actualHostname = ''
    for (const line of statusLines) {
      const lowerLine = line.toLowerCase()
      for (const pattern of hostPatterns) {
        if (lowerLine.includes(pattern.toLowerCase())) {
          deviceLine = line
          const parts = line.trim().split(/\s+/)
          const hostPart = parts[1]
          if (hostPart && (hostPart.startsWith(host) || hostPart.includes(host))) {
            actualHostname = hostPart
          }
          debug('found matching device line', value(line.trim()))
          debug('extracted hostname', value(actualHostname))
          plainL(`${successStyle('✓')}  Found device: ${value(actualHostname || hostPart)}`)
          break
        }
      }
      if (deviceLine) break
    }
    
    if (deviceLine) {
      if (deviceLine.includes('offline')) {
        if (!deviceIsOffline) {
          deviceIsOffline = true
          offlineDetectedAttempt = attempt
          l(warning('DEVICE IS OFFLINE'), 'Tailscale auth key may be invalid or expired')
          plainL(`${warning('⚠️')}  Device found but showing as OFFLINE - auth key may be invalid`)
        }
        
        if (attempt - offlineDetectedAttempt > 6) {
          err('device remains offline after multiple attempts', 'auth key is likely invalid')
          throw new Error(`Device is offline in Tailscale. This usually means:
1. The Tailscale auth key is invalid or expired
2. The auth key doesn't have proper permissions
3. The key has already been used (if not reusable)

Please check your auth key and try again with a valid key.`)
        }
        
        l('device is offline, waiting for it to come online', label('attempt:'), value(`${attempt - offlineDetectedAttempt + 1}/6`))
        plainL(`${infoStyle('⏱')}  Waiting for device to come online... (${attempt - offlineDetectedAttempt + 1}/6)`)
        
        if (attempt % 3 === 0) {
          debug('checking if cloud-init is still running')
          const cloudInitCheck = await run('vultr-cli', ['instance', 'get', host])
          if (cloudInitCheck.stdout.includes('running')) {
            debug('instance is running, but tailscale is offline')
          }
        }
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs * 2))
          continue
        }
      }
      
      const parts = deviceLine.trim().split(/\s+/)
      const possibleHostnames = [
        actualHostname,
        parts[1],
        `${host}`,
        parts.find(p => p?.includes(host)),
        parts.find(p => p?.includes('.tail')),
      ].filter(Boolean)
      
      trace('extracted possible hostnames', muted(possibleHostnames.join(', ')))
      
      for (const testHost of possibleHostnames) {
        if (!testHost) continue
        
        debug('testing ping to', value(testHost))
        plainL(`${infoStyle('🏓')}  Testing connectivity to ${value(testHost)}...`)
        const pingResult = await run('tailscale', ['ping', '--c', '1', testHost])
        
        if (pingResult.code === 0) {
          l('successful ping to', value(testHost))
          plainL(`${successStyle('✅')}  Successfully connected to ${value(testHost)}!`)
          foundHostname = testHost
          break
        } else {
          const errorMsg = pingResult.stderr?.slice(0, 100) || 'timeout'
          debug('ping failed to', value(testHost), errorStyle(errorMsg))
          
          if (errorMsg.includes('no reply') && deviceLine.includes('offline')) {
            l('device is reachable but offline', 'likely auth key issue')
          }
        }
      }
      
      if (foundHostname) {
        l('connectivity confirmed to', value(foundHostname))
        l('waiting for SSH to be ready', muted('10 seconds'))
        plainL(`${infoStyle('⏱')}  Waiting 10 seconds for SSH to initialize...`)
        await new Promise(resolve => setTimeout(resolve, 10000))
        return foundHostname
      }
    } else {
      if (attempt % 6 === 1) {
        plainL(`${infoStyle('🔍')}  Device not found in tailnet yet, cloud-init may still be running...`)
      }
    }
    
    debug('device not found or not reachable yet')
    
    if (attempt % 6 === 0) {
      debug('attempting direct IP lookup')
      plainL(`${infoStyle('🔍')}  Attempting direct IP lookup...`)
      const ipResult = await run('tailscale', ['ip', '-4', host])
      if (ipResult.code === 0 && ipResult.stdout.trim()) {
        const ip = ipResult.stdout.trim()
        debug('got tailscale IP', value(ip))
        plainL(`${infoStyle('📍')}  Found IP ${value(ip)}, testing connectivity...`)
        
        const ipPingResult = await run('tailscale', ['ping', '--c', '1', ip])
        if (ipPingResult.code === 0) {
          l('successful ping to IP', value(ip))
          plainL(`${successStyle('✅')}  Successfully connected via IP!`)
          l('waiting for hostname propagation', muted('10 seconds'))
          await new Promise(resolve => setTimeout(resolve, 10000))
          return host
        } else {
          l('ping to IP failed', 'device may be offline')
          plainL(`${warning('⚠️')}  Cannot reach IP yet, device may still be initializing...`)
        }
      }
    }
    
    if (attempt % 10 === 0) {
      debug('extended diagnostics', label('attempt:'), value(attempt))
      trace('current tailscale status output preview', lastStatusOutput.slice(0, 500))
      
      plainL(`${infoStyle('📊')}  Running extended diagnostics (attempt ${attempt})...`)
      const netcheckResult = await run('tailscale', ['netcheck'])
      if (netcheckResult.code === 0) {
        const netcheckLines = netcheckResult.stdout.split('\n').slice(0, 5)
        trace('netcheck preview', netcheckLines.join(' | '))
      }
    }
    
    if (attempt < maxAttempts) {
      const waitTime = attempt > 30 ? delayMs * 2 : delayMs
      debug('waiting before next attempt', muted(`${waitTime}ms`))
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  err('exhausted all attempts', `failed to connect to ${value(host)}`)
  err('last status output', lastStatusOutput.slice(0, 1000))
  
  if (deviceIsOffline) {
    throw new Error(`Device ${host} is offline in Tailscale. The auth key is likely invalid, expired, or has already been used.`)
  }
  
  throw new Error(`Failed to connect to ${host} via Tailscale after ${maxAttempts} attempts`)
}