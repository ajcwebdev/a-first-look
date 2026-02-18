import { parseArgs, getOption, createLogger, error as errorStyle, info as infoStyle, success as successStyle, warning as warningStyle, accent, value, label, l as plainL, err as plainErr } from '@/utils'
import { ensure } from '../devbox-utils/ensure.js'
import { checkExistingInstance } from '../devbox-utils/check-existing-instance.js'
import { validateInstanceHealth } from '../devbox-utils/validate-instance-health.js'
import { create } from './create.js'
import { setup } from './setup.js'
import { ssh } from './ssh.js'

const p = '[commands/devbox/provision]'
const { l, err } = createLogger(p)

export const provision = async (args: string[]): Promise<void> => {
  l('starting provision workflow')
  await ensure(['tailscale', 'vultr-cli'])
  
  const { options } = parseArgs(args)
  
  const host = getOption(options, 'host', 'devbox')
  const user = getOption(options, 'user', 'dev')
  const interactive = getOption(options, 'no-interactive', 'false') !== 'true'
  
  l('checking for existing instances', label('host:'), value(host))
  
  const existing = await checkExistingInstance(host)
  
  if (existing.vultrInstance || existing.tailscaleDevice) {
    l('found existing resources')
    
    if (existing.vultrInstance) {
      plainL(`\n${infoStyle('📦 Found existing Vultr instance:')}`)
      plainL(`  ${label('ID:')} ${value(existing.vultrInstance.id)}`)
      plainL(`  ${label('Label:')} ${value(existing.vultrInstance.label)}`)
      plainL(`  ${label('Status:')} ${value(existing.vultrInstance.status)}`)
      plainL(`  ${label('IP:')} ${value(existing.vultrInstance.main_ip || 'none')}`)
    }
    
    if (existing.tailscaleDevice) {
      plainL(`\n${infoStyle('🔐 Found existing Tailscale device:')}`)
      plainL(`  ${label('Name:')} ${value(existing.tailscaleDevice.name)}`)
      plainL(`  ${label('IP:')} ${value(existing.tailscaleDevice.ip)}`)
      plainL(`  ${label('Status:')} ${value(existing.tailscaleDevice.status)}`)
      
      if (existing.tailscaleDevice.status === 'offline') {
        plainErr(`\n${warningStyle('⚠️  Device is offline in Tailscale')}`)
        plainErr('This usually means the auth key was invalid or the instance needs to be restarted')
      }
    }
    
    if (existing.tailscaleDevice && existing.tailscaleDevice.status !== 'offline') {
      l('validating health of existing instance')
      plainL(`\n${infoStyle('🔍 Validating existing instance health...')}`)
      
      const health = await validateInstanceHealth(existing.tailscaleDevice.name, user)
      
      if (health.healthy) {
        plainL(`${successStyle('✅ Existing instance is healthy!')}`)
        
        if (health.sshAvailable) {
          plainL(`\n${infoStyle('📋 Running setup to ensure tools are installed...')}`)
          
          try {
            await setup([
              '--host', existing.tailscaleDevice.name,
              '--user', user,
              ...args.filter(arg => arg.startsWith('--tools') || arg.startsWith('--repo'))
            ])
          } catch (error) {
            err('setup failed but continuing', error instanceof Error ? error.message : String(error))
            plainErr(`\n${warningStyle('⚠️  Setup encountered issues but continuing')}`)
          }
          
          if (interactive) {
            plainL(`\n${infoStyle('🚀 Connecting to existing instance...')}`)
            await ssh(['--host', existing.tailscaleDevice.name, '--user', user])
          } else {
            plainL(`\n${successStyle('✅ Instance is ready!')}`)
            plainL(`${infoStyle('Connect with:')} ${accent('bun run cli devbox ssh --host')} ${value(existing.tailscaleDevice.name)}`)
          }
          return
        } else {
          plainErr(`\n${warningStyle('⚠️  Instance exists but SSH is not accessible')}`)
          plainErr('The instance may still be initializing or have configuration issues')
        }
      } else {
        plainErr(`\n${errorStyle('❌ Existing instance failed health checks:')}`)
        health.issues.forEach(issue => plainErr(`  - ${issue}`))
      }
    }
    
    if (existing.vultrInstance && (!existing.tailscaleDevice || existing.tailscaleDevice.status === 'offline')) {
      plainErr(`\n${errorStyle('❌ Instance exists in Vultr but not accessible via Tailscale')}`)
      plainErr(`\nYou can either:`)
      plainErr(`1. Delete and recreate: ${accent('bun run cli devbox delete --id')} ${value(existing.vultrInstance.id)}`)
      plainErr(`2. Debug the existing instance manually via Vultr console`)
      throw new Error('Instance exists but is not properly configured')
    }
  } else {
    l('no existing instance found, creating new one')
    plainL(`\n${infoStyle('🆕 No existing instance found. Creating new devbox...')}`)
  }
  
  const region = getOption(options, 'region', '')
  const plan = getOption(options, 'plan', '')
  const os = getOption(options, 'os', '')
  
  if (!existing.vultrInstance && (!region || !plan || !os)) {
    plainErr(`\n${errorStyle('❌ Missing required options for creating new instance')}`)
    plainErr('\nRequired options:')
    plainErr('  --region <region-id>  (e.g., ewr for New Jersey)')
    plainErr('  --plan <plan-id>      (e.g., vc2-1c-1gb)')
    plainErr('  --os <os-id>          (e.g., 1743 for Ubuntu 22.04)')
    plainErr(`\n${infoStyle('List available options:')}`)
    plainErr('  bun run cli devbox list-regions')
    plainErr('  bun run cli devbox list-plans')
    plainErr('  bun run cli devbox list-os')
    throw new Error('Missing required options for instance creation')
  }
  
  if (!existing.vultrInstance) {
    l('creating new instance')
    const createArgs = [
      '--region', region,
      '--plan', plan,
      '--os', os,
      '--host', host,
      '--user', user
    ]
    
    await create(createArgs)
  }
  
  l('running setup')
  plainL(`\n${infoStyle('🔧 Installing development tools...')}`)
  
  const setupArgs = ['--host', host, '--user', user]
  
  const tools = getOption(options, 'tools', '')
  if (tools) setupArgs.push('--tools', tools)
  
  const repo = getOption(options, 'repo', '')
  if (repo) setupArgs.push('--repo', repo)
  
  try {
    await setup(setupArgs)
  } catch (error) {
    err('setup failed but continuing to SSH', error instanceof Error ? error.message : String(error))
    plainErr(`\n${warningStyle('⚠️  Setup encountered issues but the instance is accessible')}`)
  }
  
  if (interactive) {
    l('connecting via SSH')
    plainL(`\n${infoStyle('🚀 Connecting to your devbox...')}`)
    await ssh(['--host', host, '--user', user])
  } else {
    plainL(`\n${successStyle('✅ Provision complete!')}`)
    plainL(`${infoStyle('Connect with:')} ${accent('bun run cli devbox ssh --host')} ${value(host)}`)
  }
}