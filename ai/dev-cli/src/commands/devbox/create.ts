import { parseArgs, requireOption, getOption, buildCloudInit, createInstance, createLogger, info as infoStyle, value, label, muted, l as plainL } from '@/utils'
import { ensure } from '../devbox-utils/ensure.js'
import { waitForTailscale } from '../devbox-utils/wait-for-tailscale.js'
import { 
  validateTailscaleAuthKey, 
  checkLocalTailscaleConnectivity,
  handleTailscaleConnectionError,
  performFallbackVerification,
  verifyFinalDeviceStatus,
  displayCreationSummary,
  displayConnectionInstructions
} from '../devbox-utils/validate-create.js'

const p = '[commands/devbox/create]'
const { l, err, debug } = createLogger(p)

export const create = async (args: string[]): Promise<void> => {
  l('starting create command')
  await ensure(['tailscale', 'vultr-cli'])
  
  const { options } = parseArgs(args)
  
  const envAuthKey = process.env['TS_AUTHKEY'] ?? process.env['TAILSCALE_AUTHKEY'] ?? ''
  const tsAuthKey = await validateTailscaleAuthKey(envAuthKey)
  
  const host = getOption(options, 'host', 'devbox')
  const user = getOption(options, 'user', 'dev')
  const userData = buildCloudInit({ tsAuthKey, host, user })
  
  const region = requireOption(options, 'region')
  const plan = requireOption(options, 'plan')
  const os = requireOption(options, 'os')
  
  l(`creating vultr instance ${value(host)}`, label('region:'), value(region), label('plan:'), value(plan), label('os:'), value(os))
  const res = await createInstance({ region, plan, os, host, userData })
  const instanceId = res?.instance?.id
  const mainIp = res?.instance?.main_ip
  
  l('instance created', label('id:'), value(instanceId), label('IP:'), value(mainIp || 'pending'))
  debug('vultr response details', JSON.stringify(res))
  
  await checkLocalTailscaleConnectivity()
  
  l(`waiting for cloud-init and tailscale setup for ${value(host)}`)
  plainL(`\n${infoStyle('⏳ Waiting for instance to initialize...')}`)
  plainL('This typically takes 2-4 minutes as the instance:')
  plainL('  1. Boots and runs cloud-init')
  plainL('  2. Installs Tailscale')
  plainL('  3. Joins your tailnet')
  plainL('  4. Configures firewall and disables SSH')
  plainL(`\n${muted('Tip: If this appears stuck, run with DEBUG=1 for detailed output')}`)
  
  let actualHostname: string = host
  try {
    actualHostname = await waitForTailscale(host)
    l('tailscale registered hostname', value(actualHostname))
  } catch (error) {
    err('failed to establish tailscale connection', error instanceof Error ? error.message : String(error))
    
    handleTailscaleConnectionError(error, instanceId)
    
    if (error instanceof Error && error.message.includes('offline')) {
      throw error
    }
    
    l('attempting fallback verification methods')
    
    const fallbackResult = await performFallbackVerification(host)
    
    if (fallbackResult.success) {
      actualHostname = fallbackResult.actualHostname
    } else {
      displayConnectionInstructions(actualHostname, instanceId)
      throw new Error(`Could not verify Tailscale connectivity. See above for troubleshooting steps.`)
    }
  }
  
  const { verified, isOffline } = await verifyFinalDeviceStatus(host, actualHostname)
  
  if (!verified) {
    l('device verification failed in final check')
  }
  
  if (isOffline) {
    l('warning: device is showing as offline, auth key may be invalid')
  }
  
  l(`devbox ready and accessible: ${value(actualHostname)}`)
  displayCreationSummary(host, actualHostname, instanceId, user)
}