import { createLogger, value } from '@/utils'

const p = '[commands/tools/docker]'
const { debug } = createLogger(p)

export const getDockerInstallScript = (user: string): string => {
  debug('generating docker installation script for user', value(user))
  
  return `
echo "=== Installing Docker ==="
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker ${user}
  echo "Docker installed: $(docker --version)"
  echo "NOTE: You may need to log out and back in for docker group to take effect"
else
  echo "Docker already installed: $(docker --version)"
fi
echo ""
`.trim()
}

export const getDockerVersion = (): string => {
  return `docker --version 2>/dev/null || echo 'not installed'`
}