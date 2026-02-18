import { bold, infoStyle, l as plainL } from '@/utils'

export const showHelp = (): void => {
  plainL(`
${bold('devbox')} - Create and manage private dev boxes on Vultr

${infoStyle('Subcommands:')}
  create    Create a new dev box
  delete    Delete a dev box
  ssh       SSH into a dev box
  status    Show Tailscale status
  ip        Get IP address
  ping      Ping a dev box
  verify    Run comprehensive health checks on a dev box
  setup     Install development tools on a dev box
  provision Create, setup, and connect to a dev box (all-in-one)
  list-os   List available OS options
  list-plans List available plans
  list-regions List available regions
  
${infoStyle('Create options:')}
  --region <region>      Vultr region (required)
  --plan <plan>          Vultr plan slug (required)
  --os <os>              Vultr OS id (required)
  --host <host>          hostname (default: devbox)
  --user <user>          linux user (default: dev)

${infoStyle('Setup options:')}
  --host <host>          hostname (required)
  --user <user>          linux user (default: dev)
  --repo <repo>          git repository to clone
  --tools <tools>        comma-separated tools: bun,node,docker

${infoStyle('Provision options (combines create, setup, ssh):')}
  --region <region>      Vultr region (required for new instances)
  --plan <plan>          Vultr plan slug (required for new instances)
  --os <os>              Vultr OS id (required for new instances)
  --host <host>          hostname (default: devbox)
  --user <user>          linux user (default: dev)
  --tools <tools>        comma-separated tools: bun,node,docker
  --repo <repo>          git repository to clone
  --no-interactive       skip SSH connection after setup

${infoStyle('Environment variables:')}
  TS_AUTHKEY            Tailscale auth key (required)
  VULTR_API_KEY         Vultr API key (required)

${infoStyle('Troubleshooting:')}
  If creation appears stuck, you can:
  1. Cancel (Ctrl+C) and check status with: bun run cli devbox status
  2. Enable debug output: DEBUG=1 bun run cli devbox create ...
  3. Check if the device appears offline (auth key issue)
  4. Verify the instance on Vultr: vultr-cli instance list
  `)
}