# Troubleshooting

## Provision command finds existing instance
The `provision` command automatically detects existing instances by hostname. If found, it will:
1. Validate the instance health
2. Attempt to complete setup if needed
3. Connect if healthy, or report issues if not

## Tailscale not found on macOS
The CLI automatically detects Tailscale at `/Applications/Tailscale.app/Contents/MacOS/Tailscale` on macOS.

## Vultr OS ID not available
Run `bun run cli devbox list-os` to see current OS IDs. Ubuntu 22.04 (`1743`) is recommended.

## Cannot connect to devbox
1. Check Tailscale status: `bun run cli devbox status`
2. Verify the devbox appears in your tailnet
3. Wait 2-3 minutes after creation for cloud-init to complete
4. Run verification: `bun run cli devbox verify --host devbox`
5. Try the provision command which handles recovery: `bun run cli devbox provision --host devbox`

## SSH service still showing in verify
The traditional SSH service should be masked and disabled. If it shows as loaded but inactive, that's expected - the important thing is that:
- Port 22 is not in the firewall rules
- The service is masked (cannot be started)
- Only Tailscale SSH is active

## Instance exists but provision fails
If the provision command detects an existing instance but can't connect:
1. Check if the instance is running in Vultr: `vultr-cli instance list`
2. Verify Tailscale auth key is valid (reusable keys required for multiple uses)
3. Delete and recreate if needed: `bun run cli devbox delete --label <hostname>`

## Tailscale auth key issues
If your devbox appears offline in Tailscale:
1. Ensure TS_AUTHKEY environment variable is set
2. Check that the key is not expired
3. Verify the key is marked as "reusable" if using multiple times
4. Generate a new key at https://login.tailscale.com/admin/settings/keys