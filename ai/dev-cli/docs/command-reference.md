# Command Reference

## `devbox provision` (All-in-one)
Create, setup, and connect to a dev box in one command. Automatically detects and reuses existing instances.

```bash
bun run cli devbox provision \
  [--region <region-id>] \      # Required for new instances
  [--plan <plan-id>] \           # Required for new instances
  [--os <os-id>] \               # Required for new instances
  [--host <hostname>] \          # Default: devbox
  [--user <username>] \          # Default: dev
  [--tools <tools>] \            # Comma-separated: bun,node,docker
  [--repo <git-url>] \           # Git repository to clone
  [--no-interactive]             # Skip SSH connection after setup
```

Features:
- **Smart instance detection**: Won't create duplicates if instance exists
- **Health validation**: Checks if existing instances are properly configured
- **Automatic recovery**: Attempts to fix configuration issues on existing instances
- **Single command workflow**: Handles all steps from creation to connection

## `devbox create`
Create a new dev box on Vultr.

```bash
bun run cli devbox create \
  --region <region-id> \
  --plan <plan-id> \
  --os <os-id> \
  --host <hostname> \
  [--user <username>]
```

## `devbox setup`
Install development tools on an existing dev box.

```bash
bun run cli devbox setup \
  --host <hostname> \
  [--user <username>] \
  [--tools <comma-separated-list>] \
  [--repo <git-url>]
```

Available tools: `bun`, `node`, `docker`

## `devbox verify`
Run comprehensive health checks.

```bash
bun run cli devbox verify --host <hostname>
```

Checks:
- Tailscale connectivity
- Firewall configuration (SSH port should be blocked)
- SSH daemon status (should be masked/disabled)
- Installed tools
- System resources
- Network configuration

## `devbox ssh`
Connect via Tailscale SSH.

```bash
bun run cli devbox ssh --host <hostname> [--user <username>]
```

## `devbox delete`
Remove a dev box.

```bash
bun run cli devbox delete --id <instance-id>
# or
bun run cli devbox delete --label <hostname>
```

## Network utilities

```bash
# Get Tailscale status
bun run cli devbox status

# Get IP addresses
bun run cli devbox ip --host <hostname>

# Ping over Tailscale
bun run cli devbox ping --host <hostname>
```

## Resource discovery

```bash
# List available OS images
bun run cli devbox list-os

# List available plans
bun run cli devbox list-plans

# List available regions
bun run cli devbox list-regions
```

## Environment Variables

Required environment variables:
- `TS_AUTHKEY` - Tailscale auth key (get from https://login.tailscale.com/admin/settings/keys)
- `VULTR_API_KEY` - Vultr API key (get from Vultr dashboard)