import { createLogger, value } from '@/utils'
import { getBunInstallScript, getBunVersion } from './bun.js'
import { getNodeInstallScript, getNodeVersion, getNpmVersion } from './node.js'
import { getDockerInstallScript, getDockerVersion } from './docker.js'
import type { SetupScriptArgs } from '../../types.js'

const p = '[commands/tools/setup-script]'
const { l } = createLogger(p)

export const generateSetupScript = (args: SetupScriptArgs): string => {
  l('generating setup script for', value(args.host))
  
  const toolsList = args.tools.split(',').map(t => t.trim())
  l('tools to include', value(toolsList.join(', ')))
  
  const installScripts: string[] = []
  if (toolsList.includes('bun')) installScripts.push(getBunInstallScript())
  if (toolsList.includes('node')) installScripts.push(getNodeInstallScript())
  if (toolsList.includes('docker')) installScripts.push(getDockerInstallScript(args.user))
  
  return `
#!/bin/bash
set -euo pipefail

echo "=== DEVBOX DEVELOPMENT SETUP ==="
echo "Starting setup at $(date)"
echo ""

cd ~

${installScripts.join('\n\n')}

echo "=== Installing additional development tools ==="
sudo apt-get update
sudo apt-get install -y \\
  curl \\
  wget \\
  vim \\
  nano \\
  htop \\
  jq \\
  zip \\
  unzip \\
  ripgrep \\
  fd-find \\
  bat \\
  tree \\
  ncdu \\
  2>&1 | tail -5
echo ""

echo "=== Setting up development directories ==="
mkdir -p ~/projects
mkdir -p ~/scripts
mkdir -p ~/.config
echo ""

${args.repo ? `
echo "=== Cloning repository ==="
cd ~/projects
if [ ! -d "$(basename ${args.repo} .git)" ]; then
  git clone ${args.repo}
  cd "$(basename ${args.repo} .git)"
  if [ -f "package.json" ]; then
    if command -v bun &> /dev/null; then
      echo "Running: bun install"
      bun install
    elif command -v npm &> /dev/null; then
      echo "Running: npm install"
      npm install
    fi
  fi
  echo "Repository cloned to: ~/projects/$(basename ${args.repo} .git)"
else
  echo "Repository already exists: ~/projects/$(basename ${args.repo} .git)"
fi
echo ""
` : ''}

echo "=== Setup VS Code Remote SSH config ==="
echo ""
echo "To connect VS Code to this devbox, add to ~/.ssh/config on your local machine:"
echo ""
echo "Host ${args.host}"
echo "    HostName ${args.host}"
echo "    User ${args.user}"
echo "    ProxyCommand /Applications/Tailscale.app/Contents/MacOS/Tailscale ssh %h"
echo ""

echo "=== Installed Development Tools Summary ==="
echo "Bun: $(${getBunVersion()})"
echo "Node: $(${getNodeVersion()})"
echo "npm: $(${getNpmVersion()})"
echo "Docker: $(${getDockerVersion()})"
echo ""

echo "=== SETUP COMPLETE ==="
echo "Your devbox is ready for development!"
echo "SSH in with: bun run cli devbox ssh --host ${args.host}"
`.trim()
}