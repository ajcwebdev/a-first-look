Absolutely—here’s the same “dev box over Tailscale” workflow rewritten for **Vultr** and **Tailscale**, keeping everything CLI‑first and avoiding dashboards unless there’s no other way.

---

## What you’ll end up with

* A **Vultr** VM you can SSH into **only** over Tailscale (no public SSH).
* OS firewall locked down to tailnet traffic only.
* One‑command provisioning using **cloud‑init** + `vultr-cli`’s `--userdata` flag. ([Tailscale][1], [Vultr Docs][2])

---

## 0) One‑time prerequisites (the only unavoidable UI)

1. **Vultr API key** – create/retrieve it in your Vultr account, then export as an env var locally:

```bash
export VULTR_API_KEY="paste-your-key"
```

`vultr-cli` reads this variable for auth. ([GitHub][3])

2. **Tailscale auth key** – generate one in the Tailscale Admin console (you can make it reusable/ephemeral/pre‑authorized to taste). We’ll reference it as `TS_AUTHKEY` below. Tailscale’s cloud‑init guide uses an auth key as the simplest way to auto‑join. ([Tailscale][1])

---

## 1) Install the CLIs (pick one method each)

**Vultr CLI**

```bash
# macOS
brew install vultr/vultr-cli/vultr-cli

# Linux (examples)
pacman -S vultr-cli           # Arch
dnf install vultr-cli         # Fedora

# Or Docker
docker pull vultr/vultr-cli:latest
```

All commands below assume a native install. If you prefer Docker, prefix them with:

```bash
docker run --rm -e VULTR_API_KEY -it vultr/vultr-cli:latest <command...>
```

(That container reads `VULTR_API_KEY` from your current shell.) ([Docker Hub][4])

**Tailscale (local machine)**
Install Tailscale on the device you’ll connect **from** (macOS/Linux/Windows). You’ll use the `tailscale` CLI to reach the new VM and to run `tailscale ssh`. ([Tailscale][5])

---

## 2) Pick your region, plan, and OS **IDs** via CLI

```bash
vultr-cli regions list
vultr-cli plans list
vultr-cli os list
```

* Choose a **Linux** image that supports **cloud‑init** (Ubuntu, Debian, Rocky, etc.). Vultr switched Linux images to cloud‑init; Windows/BSD use a different mechanism. ([Vultr Docs][2])

Keep the following handy for the create step:

```bash
REGION="ewr"            # example: New Jersey
PLAN="vc2-1c-1gb"       # example: 1 vCPU / 1 GB
OSID="448"              # example: Rocky or use your preferred Linux ID
HOST="devbox"           # your hostname / machine name
```

---

## 3) Create a cloud‑init file that installs & locks down Tailscale

Create `devbox.cloud-init.yml` locally:

```yaml
#cloud-config
package_update: true
package_upgrade: true

users:
  - name: dev
    groups: sudo
    shell: /bin/bash
    sudo: "ALL=(ALL) NOPASSWD:ALL"
    lock_passwd: true
    passwd: "*"

runcmd:
  # Install Tailscale
  - curl -fsSL https://tailscale.com/install.sh | sh

  # Bring the node up on your tailnet with SSH enabled and a friendly hostname
  - tailscale up --auth-key=${TS_AUTHKEY} --ssh --hostname=${HOST}

  # Optional: add a couple of handy packages
  - |
    if command -v apt-get >/dev/null 2>&1; then
      apt-get update && apt-get install -y ufw git tmux build-essential
    elif command -v dnf >/dev/null 2>&1; then
      dnf install -y ufw git tmux make gcc
    elif command -v yum >/dev/null 2>&1; then
      yum install -y ufw git tmux make gcc
    fi

  # OS firewall: allow only tailnet traffic inbound
  - ufw default deny incoming || true
  - ufw default allow outgoing || true
  - ufw allow in on tailscale0 || true
  - ufw --force enable || true

  # Disable the distro SSH daemon so only Tailscale SSH is used
  - systemctl disable --now ssh || systemctl disable --now sshd || true
```

Why this works:

* We enable **Tailscale SSH** with `--ssh` so you don’t need public keys or port 22 exposed. Access is authorized by your tailnet ACLs (defaults usually allow **you** onto your own devices). ([Tailscale][6])
* We restrict inbound to the **`tailscale0`** interface, so the server isn’t reachable from the public Internet—even if some port were listening.

> Tip: Tailscale publish a sample cloud‑init for auto‑join + SSH; the approach above follows that pattern. ([Tailscale][1])

---

## 4) Create the instance with **user‑data** (no dashboard)

`vultr-cli` accepts the **cloud‑init payload** directly via a `--userdata` flag. That means you can pass the file contents from your shell when creating the VM:

```bash
# Make your auth key and host available to the subshell that expands the file
export TS_AUTHKEY="tskey-xxxxxxxxxxxxxxxx"
export HOST="${HOST}"

# Create the instance
vultr-cli instance create \
  --region "${REGION}" \
  --plan   "${PLAN}" \
  --os     "${OSID}" \
  --host   "${HOST}" \
  --userdata "$(envsubst < devbox.cloud-init.yml)"
```

That `--userdata` flag is explicitly supported for Vultr when using the CLI, and is the recommended way to feed cloud‑init without touching the UI. ([Tailscale][1])

> Cloud‑init runs at first boot. If you’re curious, its logs live at `/var/log/cloud-init.log` and `/var/log/cloud-init-output.log`. The `cloud-init status` and `cloud-init analyze` commands are handy if you ever need to debug. ([Cloud-init][7])

---

## 5) Confirm the node is up and on your tailnet

On **your local machine**:

```bash
tailscale status | grep "${HOST}" || true
tailscale ip "${HOST}"
tailscale ping "${HOST}"
```

You should see the new hostname, its 100.x and fd7a:… IPs, and pings succeeding (direct or via DERP). ([Tailscale][5])

---

## 6) SSH in (over Tailscale)

Use Tailscale SSH (no public keys required):

```bash
tailscale ssh dev@"${HOST}"
# or
tailscale ssh root@"${HOST}"   # if you prefer, but the cloud-config creates 'dev'
```

Tailscale authenticates with your tailnet identity and authorizes per your ACLs; the connection is carried over the encrypted WireGuard tunnel. ([Tailscale][6])

---

## 7) Daily driver tips (all CLI)

* **Start/Stop/Destroy** the VM from your laptop:

  ```bash
  vultr-cli instance list
  vultr-cli instance stop    <INSTANCE_ID>
  vultr-cli instance start   <INSTANCE_ID>
  vultr-cli instance delete  <INSTANCE_ID>
  ```

  (Add `-o json` to any command for machine‑readable output.) ([Fig][8])

* **Update Tailscale** on the VM when you feel like it:

  ```bash
  tailscale update --yes
  tailscale version --daemon
  ```

  (Or enable auto‑updates for devices; see Tailscale’s docs.) ([Tailscale][5])

* **Troubleshoot networking** if something feels off:

  ```bash
  tailscale netcheck
  tailscale status
  ```

  Then re‑run `tailscale up` or `tailscale set` with any flags you want to change. ([Tailscale][5])

---

## 8) Hardening & notes

* You **don’t** need to open any public ports on Vultr for this workflow. Tailscale can operate fully outbound; if inbound UDP is filtered, it falls back to relays. For the most private setup, leave provider firewalls as‑is and rely on the OS UFW rules (already included) so only tailnet traffic reaches services.
* If you later want to expose a service **only** to your tailnet, just bind to `100.x.y.z` or use Tailscale Serve instead of opening public ports. ([Tailscale][5])
* If you ever try **non‑Linux** images on Vultr: be aware that cloud‑init is primarily for Linux; Windows/BSD use different mechanisms. Stick to Linux for this flow. ([Vultr Docs][2])

---

## 9) Clean up

```bash
# Find the instance ID and delete it
vultr-cli instance list
vultr-cli instance delete <INSTANCE_ID>
```

---

## Appendix: minimal end‑to‑end demo (copy/paste)

```bash
# 1) Prereqs
export VULTR_API_KEY="paste"
export TS_AUTHKEY="tskey-...replace..."
export REGION="ewr"
export PLAN="vc2-1c-1gb"
export HOST="devbox"

# 2) Pick an OS ID (example shows Ubuntu LTS)
vultr-cli os list | grep -i ubuntu
export OSID="<paste an Ubuntu/Debian/Rocky id from list>"

# 3) Cloud-init file
cat > devbox.cloud-init.yml <<'YAML'
#cloud-config
package_update: true
package_upgrade: true
users:
  - name: dev
    groups: sudo
    shell: /bin/bash
    sudo: "ALL=(ALL) NOPASSWD:ALL"
    lock_passwd: true
    passwd: "*"
runcmd:
  - curl -fsSL https://tailscale.com/install.sh | sh
  - tailscale up --auth-key=${TS_AUTHKEY} --ssh --hostname=${HOST}
  - |
    if command -v apt-get >/dev/null 2>&1; then
      apt-get update && apt-get install -y ufw git tmux build-essential
    elif command -v dnf >/dev/null 2>&1; then
      dnf install -y ufw git tmux make gcc
    elif command -v yum >/dev/null 2>&1; then
      yum install -y ufw git tmux make gcc
    fi
  - ufw default deny incoming || true
  - ufw default allow outgoing || true
  - ufw allow in on tailscale0 || true
  - ufw --force enable || true
  - systemctl disable --now ssh || systemctl disable --now sshd || true
YAML

# 4) Create the instance with user-data (no dashboard)
vultr-cli instance create \
  --region "${REGION}" \
  --plan   "${PLAN}" \
  --os     "${OSID}" \
  --host   "${HOST}" \
  --userdata "$(envsubst < devbox.cloud-init.yml)"

# 5) Connect when it appears in your tailnet
tailscale ping "${HOST}"
tailscale ssh dev@"${HOST}"
```

---

### References you can rely on later

* **Tailscale cloud‑init** (shows the `--userdata` approach for Vultr, plus a ready‑to‑use template). ([Tailscale][1])
* **Vultr: cloud‑init on Vultr** (how user‑data works on Vultr Linux images). ([Vultr Docs][2])
* **cloud‑init CLI docs** (status, logs, analyze). ([Cloud-init][7])
* **Vultr CLI repo & usage** (install, auth, common commands). ([GitHub][3])
* **Tailscale CLI & SSH** (what `tailscale up --ssh` does & daily commands). ([Tailscale][5])

If you want this tuned for a specific distro/plan/region, tell me what you picked and I’ll drop in the exact `--os`/`--plan` values and a trimmed cloud‑init for that base image.

[1]: https://tailscale.com/kb/1293/cloud-init "Install Tailscale with cloud-init · Tailscale Docs"
[2]: https://docs.vultr.com/how-to-deploy-a-vultr-server-with-cloudinit-userdata?utm_source=chatgpt.com "Deploy a Vultr Server with Cloud-Init User-Data"
[3]: https://github.com/vultr/vultr-cli?utm_source=chatgpt.com "vultr/vultr-cli: Official command line tool for Vultr services"
[4]: https://hub.docker.com/r/vultr/vultr-cli?utm_source=chatgpt.com "vultr-cli"
[5]: https://tailscale.com/kb/1080/cli?utm_source=chatgpt.com "Tailscale CLI"
[6]: https://tailscale.com/kb/1193/tailscale-ssh?utm_source=chatgpt.com "Tailscale SSH"
[7]: https://cloudinit.readthedocs.io/en/latest/reference/cli.html?utm_source=chatgpt.com "CLI commands - cloud-init 25.2 documentation"
[8]: https://fig.io/manual/vultr-cli/instance/create "vultr-cli instance create | Fig"
