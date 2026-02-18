import { parseArgs, requireOption, getOption, runInteractive, createLogger, value, error as errorStyle, info as infoStyle, success as successStyle, accent, label, muted, l as plainL } from '@/utils'
import { ensure } from '../devbox-utils/ensure.js'
import { testSSHConnection } from '../devbox-utils/test-ssh-connection.js'
import { generateSetupScript } from '../tools/setup-script.js'

const p = '[commands/devbox/setup]'
const { l, err } = createLogger(p)

export const setup = async (args: string[]): Promise<void> => {
  await ensure(['tailscale'])
  
  const { options } = parseArgs(args)
  const host = requireOption(options, 'host')
  const user = getOption(options, 'user', 'dev')
  const repo = getOption(options, 'repo', '')
  const tools = getOption(options, 'tools', 'bun,node')
  
  l(`starting setup for ${value(host)}`)
  l('checking SSH connectivity')
  
  const sshReady = await testSSHConnection(host, user)
  if (!sshReady) {
    err('SSH connection failed after all attempts')
    plainL(`\n${errorStyle('❌ Cannot connect to')} ${value(host)}`)
    plainL(`\n${infoStyle('Troubleshooting:')}`)
    plainL(`1. Check if the devbox appears in: ${accent('bun run cli devbox status')}`)
    plainL(`2. Try pinging: ${accent('bun run cli devbox ping --host')} ${value(host)}`)
    plainL(`3. Wait a bit longer for cloud-init to complete`)
    plainL(`4. Verify the devbox: ${accent('bun run cli devbox verify --host')} ${value(host)}`)
    throw new Error(`Cannot establish SSH connection to ${host}`)
  }
  
  l('SSH connection verified')
  l('tools to install:', value(tools))
  if (repo) l('repository to clone:', value(repo))
  
  const setupScript = generateSetupScript({ host, user, tools, repo })
  
  l(`running setup script on ${value(host)}`)
  
  const maxRetries = 3
  const retryAttempts = Array.from({ length: maxRetries }, (_, i) => i + 1)
  let setupSuccessful = false
  let lastError = ''
  
  for (const attempt of retryAttempts) {
    l('executing setup script', label('attempt:'), value(`${attempt}/${maxRetries}`))
    
    const code = await runInteractive('tailscale', [
      'ssh',
      `${user}@${host}`,
      'bash'
    ], undefined, undefined, setupScript)
    
    if (code === 0) {
      setupSuccessful = true
      l('setup script completed successfully')
      break
    }
    
    lastError = `exit code: ${code}`
    l('setup script failed', errorStyle(lastError))
    
    if (attempt < maxRetries) {
      const waitTime = 10000 * attempt
      l('retrying setup', muted(`waiting ${waitTime / 1000} seconds`))
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  if (!setupSuccessful) {
    err('setup failed after all retries', errorStyle(lastError))
    plainL(`\n${errorStyle('❌ Setup failed after')} ${value(maxRetries)} ${errorStyle('attempts')}`)
    plainL(`\nYou can try:`)
    plainL(`1. SSH manually: ${accent('bun run cli devbox ssh --host')} ${value(host)}`)
    plainL(`2. Run setup again: ${accent('bun run cli devbox setup --host')} ${value(host)}`)
    throw new Error(`Setup failed: ${lastError}`)
  }
  
  l(`setup completed successfully for ${value(host)}`)
  plainL(`\n${successStyle('✅ Your devbox is ready!')}`)
  plainL(`\n${infoStyle('Connect with:')}`)
  plainL(`  ${accent('bun run cli devbox ssh --host')} ${value(host)}`)
  if (repo) {
    const repoName = repo.split('/').pop()?.replace('.git', '')
    plainL(`\nYour repository is at: ${value(`~/projects/${repoName}`)}`)
  }
}