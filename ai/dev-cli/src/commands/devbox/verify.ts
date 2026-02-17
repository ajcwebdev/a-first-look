import { parseArgs, requireOption, getOption, run, createLogger, value, warning, error as errorStyle, info as infoStyle, l as plainL, err as plainErr } from '@/utils'
import { ensure } from '../devbox-utils/ensure.js'

const p = '[commands/devbox/verify]'
const { l, err } = createLogger(p)

export const verify = async (args: string[]): Promise<void> => {
  await ensure(['tailscale'])
  
  const { options } = parseArgs(args)
  const host = requireOption(options, 'host')
  const user = getOption(options, 'user', 'dev')
  
  l('starting verification for', value(host))
  
  l('checking if device exists in tailnet')
  const { code: statusCode, stdout: statusOutput } = await run('tailscale', ['status'])
  
  if (statusCode !== 0) {
    plainErr(`\n${errorStyle('❌ Cannot get Tailscale status')}`)
    plainErr('Make sure Tailscale is running: tailscale up')
    throw new Error('Tailscale status check failed')
  }
  
  const lines = statusOutput.split('\n')
  let deviceFound = false
  let deviceOffline = false
  let actualHostname = host
  
  for (const line of lines) {
    if (line.toLowerCase().includes(host.toLowerCase())) {
      const parts = line.trim().split(/\s+/)
      const deviceName = parts[1]
      if (deviceName && (deviceName === host || deviceName.startsWith(`${host}-`))) {
        deviceFound = true
        actualHostname = deviceName
        if (line.includes('offline')) {
          deviceOffline = true
        }
        l('found device in tailnet', value(actualHostname), deviceOffline ? warning('(offline)') : '')
        break
      }
    }
  }
  
  if (!deviceFound) {
    plainErr(`\n${errorStyle('❌ Device not found:')} ${value(host)}`)
    plainErr('\nThis device does not exist in your tailnet.')
    plainErr(`\n${infoStyle('Current devices in your tailnet:')}`)
    
    const deviceLines = lines.filter(line => {
      const trimmed = line.trim()
      return trimmed && !trimmed.startsWith('#') && trimmed.includes('.')
    })
    
    if (deviceLines.length === 0) {
      plainErr('  No devices found')
    } else {
      deviceLines.forEach(line => {
        const parts = line.trim().split(/\s+/)
        const name = parts[1]
        if (name) {
          plainErr(`  - ${value(name)}`)
        }
      })
    }
    
    plainErr(`\n${infoStyle('To fix this:')}`)
    plainErr(`1. Make sure you typed the hostname correctly`)
    plainErr(`2. If you haven't created this device yet, run: bun run cli devbox create ...`)
    plainErr(`3. Check available instances with: bun run cli devbox status`)
    
    process.exitCode = 1
    return
  }
  
  if (deviceOffline) {
    plainErr(`\n${warning('⚠️  Device is offline:')} ${value(actualHostname)}`)
    plainErr('\nThe device exists but is not currently connected to Tailscale.')
    plainErr('This usually means:')
    plainErr('1. The instance is stopped or shutting down')
    plainErr('2. The Tailscale auth key was invalid')
    plainErr('3. Network connectivity issues')
    plainErr(`\nTry: vultr-cli instance list`)
  }
  
  l('testing connectivity to', value(actualHostname))
  const { code: pingCode } = await run('tailscale', ['ping', '--c', '1', actualHostname])
  
  if (pingCode !== 0) {
    plainErr(`\n${errorStyle('❌ Cannot reach device:')} ${value(actualHostname)}`)
    plainErr('The device exists but is not reachable.')
    plainErr(`\n${infoStyle('Troubleshooting steps:')}`)
    plainErr('1. Wait a few minutes if the instance was just created')
    plainErr('2. Check if the instance is running: vultr-cli instance list')
    plainErr('3. Try to ping directly: bun run cli devbox ping --host ' + actualHostname)
    
    process.exitCode = 1
    return
  }
  
  const verificationScript = `
#!/bin/bash
set -euo pipefail

echo "=== DEVBOX HEALTH CHECK REPORT ==="
echo "Timestamp: $(date)"
echo "Hostname: $(hostname)"
echo ""

echo "=== Tailscale Status ==="
tailscale status || echo "Failed to get tailscale status"
echo ""

echo "=== Tailscale IPs ==="
tailscale ip || echo "Failed to get tailscale IPs"
echo ""

echo "=== Firewall Status ==="
sudo ufw status verbose || echo "Failed to get firewall status"
echo ""

echo "=== SSH Daemon Status ==="
echo "Checking traditional SSH (should be inactive/not found):"
sudo systemctl status ssh 2>&1 | head -10 || true
sudo systemctl status sshd 2>&1 | head -10 || true
echo ""

echo "=== User Information ==="
echo "Current user: $(whoami)"
echo "Groups: $(groups)"
echo "Sudo privileges:"
sudo -l | head -5
echo ""

echo "=== Installed Tools ==="
echo "Git: $(git --version 2>&1 || echo 'not installed')"
echo "Tmux: $(tmux -V 2>&1 || echo 'not installed')"
echo "GCC: $(gcc --version 2>&1 | head -1 || echo 'not installed')"
echo ""

echo "=== Cloud-init Status ==="
sudo cloud-init status || echo "Failed to get cloud-init status"
echo ""

echo "=== Network Listeners ==="
sudo ss -tulpn | head -20 || echo "Failed to get network listeners"
echo ""

echo "=== System Resources ==="
free -h
echo ""
df -h /
echo ""
echo "CPU: $(lscpu | grep 'Model name' | cut -d: -f2 | xargs)"
echo "Cores: $(nproc)"
echo ""

echo "=== Network Interfaces ==="
ip -brief addr show
echo ""

echo "=== Tailscale Interface ==="
ip addr show tailscale0 2>&1 || echo "Tailscale interface not found"
echo ""

echo "=== Running Processes (SSH-related) ==="
ps aux | grep -E '(ssh|tailscale)' | grep -v grep || true
echo ""

echo "=== VERIFICATION COMPLETE ==="
`.trim()
  
  l('running health checks on', value(actualHostname))
  
  const { code, stdout, stderr } = await run('tailscale', [
    'ssh',
    `${user}@${actualHostname}`,
    'bash'
  ], undefined, undefined, verificationScript)
  
  if (stderr && stderr.trim()) {
    l('verification stderr', warning(stderr))
  }
  
  plainL('\n' + stdout)
  
  if (code !== 0) {
    err('verification completed with errors', errorStyle(`exit code: ${code}`))
    process.exitCode = code
  } else {
    l('verification completed successfully for', value(actualHostname))
  }
}