import { createLogger } from '@/utils'

const p = '[commands/tools/node]'
const { debug } = createLogger(p)

export const getNodeInstallScript = (): string => {
  debug('generating node installation script')
  
  return `
echo "=== Installing Node.js ==="
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt-get install -y nodejs
  echo "Node.js installed: $(node --version)"
  echo "npm installed: $(npm --version)"
else
  echo "Node.js already installed: $(node --version)"
fi
echo ""
`.trim()
}

export const getNodeVersion = (): string => {
  return `node --version 2>/dev/null || echo 'not installed'`
}

export const getNpmVersion = (): string => {
  return `npm --version 2>/dev/null || echo 'not installed'`
}