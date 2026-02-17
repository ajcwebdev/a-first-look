# Manual step-by-step setup

If you prefer to run each step separately:

## Create a dev box

```bash
# List available OS, plans, and regions
bun run cli devbox list-os
bun run cli devbox list-plans
bun run cli devbox list-regions

# Create Ubuntu 22.04 dev box in New Jersey
bun run cli devbox create \
  --region ewr \
  --plan vc2-1c-1gb \
  --os 1743 \
  --host devbox
```

Common OS IDs:
- `1743` - Ubuntu 22.04 LTS
- `2284` - Ubuntu 24.04 LTS
- `2136` - Debian 12
- `1869` - Rocky Linux 9

## Set up development tools

```bash
# Install Bun and Node.js (default)
bun run cli devbox setup --host devbox

# Install specific tools
bun run cli devbox setup --host devbox --tools bun,node,docker

# Setup with repository clone
bun run cli devbox setup \
  --host devbox \
  --tools bun,node,docker \
  --repo https://github.com/yourusername/your-project.git
```

## Connect to your dev box

```bash
bun run cli devbox ssh --host devbox --user dev
```