# Dev Box CLI for Vultr over Tailscale

Zero-dependency Bun CLI for provisioning and managing private cloud development environments on Vultr, accessible only through Tailscale.

## Overview

### Features

- Create Ubuntu dev boxes on Vultr with one command
- Zero public SSH exposure - access only through Tailscale
- Automatic firewall configuration (UFW with default-deny, no SSH port)
- Built-in development environment setup (Bun, Node.js, Docker)
- Health monitoring and verification tools
- **All-in-one provisioning command that handles create, setup, and SSH**
- **Smart detection of existing instances to avoid duplicates**
- Pure Bun implementation with no NPM dependencies

### Architecture

- **Security**: No public SSH access, UFW firewall with default-deny (no SSH port), access only via Tailscale's WireGuard tunnel
- **Cloud-init**: Automated provisioning using cloud-init user-data with SSH service fully disabled
- **Zero dependencies**: Pure Bun implementation using built-in APIs
- **Cross-platform**: Works on macOS, Linux, and Windows (via WSL)
- **Instance management**: Smart detection and reuse of existing instances

## Prerequisites

### Clone Repo

```bash
git clone https://github.com/yourusername/dev-cli.git
cd dev-cli
bun install
```

### Install Bun and Required CLIs

```bash
curl -fsSL https://bun.sh/install | bash
```

**Tailscale** (for secure networking):
- macOS: Download from [tailscale.com](https://tailscale.com/download) or App Store
- Linux: `curl -fsSL https://tailscale.com/install.sh | sh`

**Vultr CLI** (for cloud infrastructure):
```bash
# macOS
brew install vultr/vultr-cli/vultr-cli

# Linux/WSL
git clone https://github.com/vultr/vultr-cli.git
cd vultr-cli
go build -o vultr-cli
sudo mv vultr-cli /usr/local/bin/
```

### Configure authentication

**Tailscale**: Connect to your tailnet
```bash
tailscale up
```

**Environment Variables**: Create a `.env` file
```bash
# Copy the example and fill in your keys
cp .env.example .env

# Set your API keys in .env:
# VULTR_API_KEY=your-api-key-here
# TS_AUTHKEY=tskey-auth-xxxxxxxx
```

## Quick Start

### All-in-one provisioning (Recommended)

The `provision` command combines instance creation, tool setup, and SSH connection into a single workflow. It also intelligently detects and reuses existing instances:

```bash
# One command to create, setup, and connect to a new dev box
bun run cli devbox provision \
  --region ewr \
  --plan vc2-1c-1gb \
  --os 1743 \
  --host devbox \
  --tools bun,node,docker

# Provision with a git repository to automatically clone
bun run cli devbox provision \
  --region ewr \
  --plan vc2-1c-1gb \
  --os 1743 \
  --host devbox \
  --tools bun,node \
  --repo https://github.com/yourusername/your-project.git

# If the instance already exists, it will validate health and reuse it
bun run cli devbox provision --host devbox

# Skip SSH connection with --no-interactive
bun run cli devbox provision \
  --region ewr \
  --plan vc2-1c-1gb \
  --os 1743 \
  --no-interactive
```

The provision command will:
1. Check if an instance with the given hostname already exists
2. Validate the health of existing instances
3. Create a new instance only if needed
4. Install development tools
5. Clone your repository (if specified)
6. Connect via SSH (unless --no-interactive is used)

### Verify health

```bash
bun run cli devbox verify --host devbox
```

### Building Standalone Binary

Compile to a single executable:

```bash
# For current platform
bun build --compile ./src/cli.ts --outfile dev-cli

# Cross-compile for Linux
bun build --compile --target=bun-linux-x64 ./src/cli.ts --outfile dev-cli-linux

# Cross-compile for Windows
bun build --compile --target=bun-windows-x64 ./src/cli.ts --outfile dev-cli.exe
```

### VS Code Remote Development

After running setup, configure VS Code Remote SSH by adding to `~/.ssh/config`:

```
Host devbox
    HostName devbox
    User dev
    ProxyCommand /Applications/Tailscale.app/Contents/MacOS/Tailscale ssh %h
```

Then connect in VS Code:
1. Install "Remote - SSH" extension
2. `Cmd+Shift+P` → "Remote-SSH: Connect to Host"
3. Select "devbox"