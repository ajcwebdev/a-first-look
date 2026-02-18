import { createLogger } from '@/utils'

const p = '[commands/tools/bun]'
const { debug } = createLogger(p)

export const getBunInstallScript = (): string => {
  debug('generating bun installation script')
  
  return `
echo "=== Installing Bun ==="
if ! command -v bun &> /dev/null; then
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
  echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
  echo "Bun installed: $(bun --version)"
else
  echo "Bun already installed: $(bun --version)"
fi
echo ""
`.trim()
}

export const getBunVersion = (): string => {
  return `bun --version 2>/dev/null || echo 'not installed'`
}