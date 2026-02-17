# Tailscale CLI

Product

Meet Tailscale

- [How it works](https://tailscale.com/blog/how-tailscale-works)
- [Why Tailscale](https://tailscale.com/why-tailscale)
- [WireGuard® for Enterprises](https://tailscale.com/wireguard-vpn)
- [Bring Tailscale to Work](https://tailscale.com/bring-tailscale-to-work)

Explore

- [Integrations](https://tailscale.com/integrations)
- [Features](https://tailscale.com/features)
- [Compare Tailscale](https://tailscale.com/compare)
- [Community Projects](https://tailscale.com/community/community-projects)
- [Partnerships](https://tailscale.com/partnerships)

Solutions

By use-case

- [Homelab](https://tailscale.com/use-cases/homelab)
- [Remote Access](https://tailscale.com/use-cases/remote-access)
- [Business VPN](https://tailscale.com/use-cases/business-vpn)
- [Zero Trust Networking](https://tailscale.com/use-cases/zero-trust-networking)
- [Site-to-site Networking](https://tailscale.com/use-cases/site-to-site-networking)

By role

- [DevOps](https://tailscale.com/solutions/devops)
- [IT](https://tailscale.com/solutions/it)
- [Security](https://tailscale.com/solutions/security)

[Enterprise](https://tailscale.com/enterprise)

[Customers](https://tailscale.com/customers)

Nav heading here

- [![Alt text ](https://cdn.sanity.io/images/w77i7m8x/production/a06dc612b1e3e4f4df53a72030002600639a8738-300x120.png?w=640&q=75&fit=clip&auto=format)\\
\\
Title here\\
\\
How Cribl Enables Secure Work From Anywhere with Tailscale](https://tailscale.com/customers)

[Docs](https://tailscale.com/kb/1017/install)

[Blog](https://tailscale.com/blog)

[Pricing](https://tailscale.com/pricing)

[Download](https://tailscale.com/download)

[Contact sales](https://tailscale.com/contact/sales)

[Get started - it's free!](https://login.tailscale.com/start) [Log in](https://login.tailscale.com/welcome)

© 2025

## Tailscale CLI

The Tailscale client includes a built-in command-line interface (CLI) you can use to manage and troubleshoot your device within your Tailscale network (known as a tailnet).

The Tailscale CLIis available for [all plans](https://tailscale.com/pricing).

### [Using the Tailscale CLI](https://tailscale.com/kb/1080/cli?tab=macos\#using-the-tailscale-cli)

The location of the CLI varies depending on your platform:

[Linux](https://tailscale.com/kb/1080/cli?tab=linux) [macOS](https://tailscale.com/kb/1080/cli?tab=macos) [Windows](https://tailscale.com/kb/1080/cli?tab=windows)

If you use the Standalone variant of the macOS client, you can install the CLI integration from the client settings. This feature requires macOS version 13.0 or later.

1. From the Tailscale client, select **Settings**.
2. Locate CLI integration section, then select **Show me how**.
3. Select **Install Now** and provide the macOS administrator password.

This installs a `tailscale` CLI launcher to `/usr/local/bin/tailscale`, letting you type `tailscale` in the Terminal, without specifying the full path.

If you installed the macOS client through the App Store, the CLI is bundled inside the Tailscale app. Run commands with:

```shell
/Applications/Tailscale.app/Contents/MacOS/Tailscale <command>

```

If you frequently access the Tailscale CLI, you might find it convenient to add an alias to your `.bashrc`, `.zshrc`, or shell config to make it easier.

```shell
alias tailscale="/Applications/Tailscale.app/Contents/MacOS/Tailscale"

```

Tailscale for macOS includes its CLI within the application executable. When you launch the Tailscale executable, it checks for specific environment variables (like `SHLVL`, `TERM`, `TERM_PROGRAM`, and `PS1`) to decide whether to launch as a macOS app with a windowed interface or as a CLI tool.

If you're using the Tailscale CLI in a script (for instance, to parse the output of `tailscale status`), ensure you set the correct environment variables. If your script accidentally opens the macOS app version of Tailscale, you can force your script to run Tailscale as a CLI (instead of the macOS app) by setting the environment variable `TAILSCALE_BE_CLI=1`.

There is no CLI support for iOS and Android.

#### [Tab completion](https://tailscale.com/kb/1080/cli?tab=macos\#tab-completion)

The Tailscale CLI supports tab-completion for commands, flags, and arguments. You can configure tab-completion with the [`completion` command](https://tailscale.com/kb/1080/cli?tab=macos#completion).

```shell
tailscale completion <shell> [--flags] [--descs]

```

Select your shell, then follow the instructions to load Tailscale CLI completions.

[Bash](https://tailscale.com/kb/1080/cli?tab=bash) [Zsh](https://tailscale.com/kb/1080/cli?tab=zsh) [Fish](https://tailscale.com/kb/1080/cli?tab=fish) [PowerShell](https://tailscale.com/kb/1080/cli?tab=powershell)

### [Command Reference](https://tailscale.com/kb/1080/cli?tab=macos\#command-reference)

#### [up](https://tailscale.com/kb/1080/cli?tab=macos\#up)

Connect your device to Tailscale and authenticate if needed.

```shell
tailscale up [flags]

```

Running `tailscale up` without any flags connects to Tailscale.

Common flags:

- `--accept-routes` Accept [subnet routes](https://tailscale.com/kb/1019/subnets) that other nodes advertise. Linux devices default to not accepting routes.
- `--advertise-exit-node` Offer to be an [exit node](https://tailscale.com/kb/1103/exit-nodes) for outbound internet traffic from the Tailscale network. Defaults to not offering to be an exit node.
- `--advertise-routes=<ip>` Expose physical [subnet routes](https://tailscale.com/kb/1019/subnets) to your entire Tailscale network.
- `--exit-node=<ip|name>` Provide a [Tailscale IP](https://tailscale.com/kb/1033/ip-and-dns-addresses) or [machine name](https://tailscale.com/kb/1098/machine-names) to use as an exit node. To disable the use of an exit node, pass the flag with an empty argument: `--exit-node=`.
- `--exit-node-allow-lan-access` Allow the client node access to its own LAN while connected to an exit node. Defaults to not allowing access while connected to an exit node.
- `--force-reauth` Force re-authentication.
- `--snat-subnet-routes` (Linux only) Disable source NAT. In normal operations, a subnet device sees the traffic originating from the subnet router. This simplifies routing, but does not allow traversing multiple networks. By disabling source NAT, the end machine sees the LAN IP address of the originating machine as the source.
- `--stateful-filtering` Enable stateful filtering for [subnet routers](https://tailscale.com/kb/1019/subnets) and [exit nodes](https://tailscale.com/kb/1103/exit-nodes). When enabled, inbound packets with another node's destination IP are dropped, unless they are a part of a tracked outbound connection from that node. Defaults to disabled.
- `--shields-up` [Block incoming connections](https://tailscale.com/kb/1072/client-preferences) from other devices on your Tailscale network. Useful for personal devices that only make outgoing connections.
- `--ssh` Run a [Tailscale SSH](https://tailscale.com/kb/1193/tailscale-ssh) server, permitting access per the tailnet admin's declared [access policy](https://tailscale.com/kb/1018/acls), or the [default policy](https://tailscale.com/kb/1192/acl-samples#allow-all-default-acl) if none is defined. Defaults to false.

For a complete list of available flags, refer to the [`tailscale up`](https://tailscale.com/kb/1241/tailscale-up) topic.

#### [down](https://tailscale.com/kb/1080/cli?tab=macos\#down)

Disconnect from Tailscale. Running this command is the same as choosing to disconnect from or quit a Tailscale client.

```shell
tailscale down

```

When disconnected, you cannot reach devices over Tailscale. To reconnect, re-run `tailscale up` without any flags.

Available flags:

- `--accept-risk=<risk>` Accept risk and skip confirmation for risk type. This can be either `lose-ssh` or `all`, or an empty string to not accept risk.
- `--reason="<description>"` Specify the reason (inside quotes) for disconnecting Tailscale when the [system policies](https://tailscale.com/kb/1315/mdm-keys) `AlwaysOn.Enabled` and `AlwaysOn.OverrideWithReason` are enabled. For example, `tailscale down --reason="DNS issues"`.

#### [bugreport](https://tailscale.com/kb/1080/cli?tab=macos\#bugreport)

The `bugreport` command is available in Tailscale v1.8 or later. If you don't see this command, consider [updating](https://tailscale.com/kb/1067/update) your Tailscale client.

Generate a bug report with diagnostic information.

The `bugreport` command makes it easier to report bugs to the Tailscale team by marking diagnostic logs with indicators to make triage easier.

If you encounter a connectivity issue, run `tailscale bugreport` on the device experiencing the issue at the time you encounter it. This command prints a random identifier into diagnostic logs, which you can share with our team.

Identifiers look like this:

```shell
$ tailscale bugreport
BUG-1b7641a16971a9cd75822c0ed8043fee70ae88cf05c52981dc220eb96a5c49a8-20210427151443Z-fbcd4fd3a4b7ad94

```

This command shares no personally identifiable information and is unused unless you share the bug identifier with our team.

Available flags:

- `--diagnose` Prints additional verbose information about the system to the Tailscale logs after generating a `bugreport` identifier, which can then be viewed by our support team. Defaults to `false`.
- `--record` Pause and then write another `bugreport`. Use this flag to create an initial `bugreport` identifier. During the pause, perform the action that reproduces your issue. Then, press Enter to create a second `bugreport` identifier. Share both bug identifiers with our team. Defaults to `false`.

#### [cert](https://tailscale.com/kb/1080/cli?tab=macos\#cert)

Generate Let's Encrypt certificate and key files on the host for [HTTPS certificates](https://tailscale.com/kb/1153/enabling-https) in your tailnet.

If you are trying to serve a folder of files or reverse proxy to an HTTP service, use the [`tailscale serve`](https://tailscale.com/kb/1080/cli?tab=macos#serve) command instead.

```shell
tailscale cert hostname.tails-scales.ts.net

```

Alternatively, if you want to save the certificate and private key to files, you can use the `--cert-file` and `--key-file` arguments:

```shell
tailscale cert --cert-file=cert.pem --key-file=key.pem hostname.tails-scales.ts.net

```

The certificates provided by Let's Encrypt have a 90-day expiry and require periodic renewal. When a certificate is delivered as files on disk which you then move to an install location, such as when using `tailscale cert`, the [`tailscaled` daemon](https://tailscale.com/kb/1278/tailscaled) doesn't know where to place a renewed certificate or how to install it. As a result, you are responsible for renewing any certificates that you create using `tailscale cert`.

If a certificate is handled without the user initiating any file-based certificate installation (such as when using the [Caddy integration of Tailscale](https://github.com/tailscale/caddy-tailscale)) then the certificate will automatically renew without the user doing anything.

Available flags:

- `--cert-file=<cert>` Specify the certificate output path.
- `--key-file=<key>` Specify the private key output path.
- `--min-validity=<duration>` Request a specified minimum remaining validity on the returned certificate. `duration` can be any value parseable by [`time.ParseDuration()`](https://pkg.go.dev/time#ParseDuration). For example, use `120h` to set the duration to five days.

The `--min-validity` flag lets you ensure that the returned certificate is valid for at least the specified duration. If you specify a duration longer than the [certification lifetime set by Let's Encyrpt](https://letsencrypt.org/docs/faq#what-is-the-lifetime-for-let-s-encrypt-certificates-for-how-long-are-they-valid), it uses the maximum lifetime set by Let's Encrypt.

#### [dns](https://tailscale.com/kb/1080/cli?tab=macos\#dns)

The `dns` command lets you access [Tailscale DNS settings](https://tailscale.com/kb/1054/dns). It's available in Tailscale v1.74.0 and later.

Subcommands:

- `status` Print the configuration of the local DNS forwarder and the tailnet-wide [MagicDNS](https://tailscale.com/kb/1081/magicdns) configuration.
- `query` Perform a DNS query using the local DNS forwarder. It's available in Tailscale v1.76.0 and later.

#### [completion](https://tailscale.com/kb/1080/cli?tab=macos\#completion)

Configure tab-completion for the Tailscale CLI.

```shell
tailscale completion <subcommand> [flags]

```

Subcommands:

- `bash` Configure tab-completion for the `bash` shell.
- `zsh` Configure tab-completion for the `zsh` shell.
- `fish` Configure tab-completion for the `fish` shell.
- `powershell` Configure tab-completion for PowerShell.

Available flags:

- `--flags=<true|false>` Configure whether to suggest flags (in addition to subcommands). Set to `true` by default.
- `--descs=<true|false>` Configure whether to include descriptions of subcommands in the suggestions. Set to `true` by default.

#### [configure](https://tailscale.com/kb/1080/cli?tab=macos\#configure)

Configure resources that you want to include in your tailnet.

```shell
tailscale configure <subcommands>

```

Subcommands:

- `kubeconfig` (alpha) Configure kubectl to connect to a Kubernetes cluster using Tailscale.
- `synology` Configure Synology to enable outbound connections needed for Tailscale.
- `sysext` Activate, deactivate, or manage the state of the Tailscale [system extension](https://tailscale.com/kb/1340/macos-sysext) on the [Standalone variant](https://tailscale.com/kb/1065/macos-variants#standalone-variant) of macOS.

Available flags for `sysext`:

- `activate` Register the Tailscale system extension with macOS.
- `deactivate` Deactivate the Tailscale system extension on macOS.
- `status` Print the enablement status of the Tailscale system extension.

Examples:

- To configure your local `kubeconfig` file for authentication with a Kubernetes auth proxy:

```shell
tailscale configure kubeconfig <hostname-or-fqdn>

```

- To configure Synology to enable outbound connections:

```shell
tailscale configure synology

```

#### [exit-node](https://tailscale.com/kb/1080/cli?tab=macos\#exit-node)

Get information about [exit-nodes](https://tailscale.com/kb/1103/exit-nodes) in your tailnet.

```shell
tailscale exit-node <subcommands>

```

Available subcommands:

- `list` Lists the exit nodes in your tailnet.
- `suggest` Suggests a [recommended exit node](https://tailscale.com/kb/1392/auto-exit-nodes).

#### [file](https://tailscale.com/kb/1080/cli?tab=macos\#file)

Access and make files available to [Taildrop](https://tailscale.com/kb/1106/taildrop).

Available flags:

- `cp` Copy files to a host.
- `get` Move files out of the Tailscale file inbox.

#### [funnel](https://tailscale.com/kb/1080/cli?tab=macos\#funnel)

Serve content and local servers from your Tailscale node to the internet.

To limit local service access to your tailnet, use the [`serve`](https://tailscale.com/kb/1080/cli?tab=macos#serve) command.

```shell
tailscale funnel <target>
tailscale funnel <subcommand> [flags] <args>

```

Subcommands:

- [`status`](https://tailscale.com/kb/1311/tailscale-funnel#view-the-status) Shows the status.
- [`reset`](https://tailscale.com/kb/1311/tailscale-funnel#reset-tailscale-funnel) Resets the configuration.

For more information, refer to the [`tailscale funnel`](https://tailscale.com/kb/1311/tailscale-funnel) topic.

#### [ip](https://tailscale.com/kb/1080/cli?tab=macos\#ip)

Get a device's Tailscale IP address.

```shell
tailscale ip [flags] [<hostname>]

```

By default, this command returns both an [`100.x.y.z` IPv4 address](https://tailscale.com/kb/1033/ip-and-dns-addresses) and an IPv6 address for the current device. You can return only an IPv4 or IPv6 address by passing either the `-4` or `-6` flags.

```shell
$ tailscale ip -4
100.121.112.23

```

You can also find the Tailscale IP for other devices on your network by adding the device hostname after the command. For example:

```shell
$ tailscale ip raspberrypi
100.126.153.111
fd7a:115c:a1e0:ab12:4843:cd96:627e:9975

```

Available flags:

- `-4` Only return an IPv4 address.
- `-6` Only return an IPv6 address.
- `-1` Only return one address, preferring IPv4.

#### [lock](https://tailscale.com/kb/1080/cli?tab=macos\#lock)

Manage [Tailnet Lock](https://tailscale.com/kb/1226/tailnet-lock) for your tailnet.

```shell
tailscale lock <subcommand> [flags] <args>

```

Common subcommands:

- [`init`](https://tailscale.com/kb/1243/tailscale-lock#lock-init) Initializes Tailnet Lock.
- [`status`](https://tailscale.com/kb/1243/tailscale-lock#lock-status) Outputs the state of Tailnet Lock.
- [`add`](https://tailscale.com/kb/1243/tailscale-lock#lock-add) Adds one or more trusted signing keys to Tailnet Lock.
- [`remove`](https://tailscale.com/kb/1243/tailscale-lock#lock-remove) Removes one or more trusted signing keys from Tailnet Lock.
- [`sign`](https://tailscale.com/kb/1243/tailscale-lock#lock-sign) Signs a node key and transmits the signature to the coordination server.

Running `tailscale lock` with no subcommand and no arguments is equivalent to running [`tailscale lock status`](https://tailscale.com/kb/1243/tailscale-lock#lock-status).

For a complete list of subcommands and flags, refer to the [`tailscale lock`](https://tailscale.com/kb/1243/tailscale-lock) topic.

#### [login](https://tailscale.com/kb/1080/cli?tab=macos\#login)

Log into Tailscale (and add this device to your Tailscale network). For more information about logging in, refer to [fast-user-switching](https://tailscale.com/kb/1225/fast-user-switching).

```shell
tailscale login [flags]

```

Available flags:

- `--accept-dns` Accept [DNS configuration](https://tailscale.com/kb/1054/dns) from the admin console. Defaults to accepting DNS settings.
- `--accept-routes` Accept [subnet routes](https://tailscale.com/kb/1019/subnets) that other nodes advertise. Linux devices default to not accepting routes.
- `--advertise-exit-node` Offer to be an [exit node](https://tailscale.com/kb/1103/exit-nodes) for outbound internet traffic from the Tailscale network. Defaults to not offering to be an exit node.
- `--advertise-routes=<ip>` Expose physical [subnet routes](https://tailscale.com/kb/1019/subnets) to your entire Tailscale network.
- `--advertise-tags=<tags>` Give tagged permissions to this device. You must be [listed in `"TagOwners"`](https://tailscale.com/kb/1337/policy-syntax#tag-owners) to be able to apply tags.
- `--auth-key=<key>` Provide an [auth key](https://tailscale.com/kb/1085/auth-keys) to automatically authenticate the node as your user account. For a best practice when handling the `--auth-key` value, refer to [Securely handle an auth key](https://tailscale.com/kb/1595/secure-auth-key-cli).
- `--exit-node=<ip|name>` Provide a [Tailscale IP](https://tailscale.com/kb/1033/ip-and-dns-addresses) or [machine name](https://tailscale.com/kb/1098/machine-names) to use as an exit node. To disable the use of an exit node, pass the flag with an empty argument: `--exit-node=`.
- `--exit-node-allow-lan-access` Allow the client node access to its own LAN while connected to an exit node. Defaults to not allowing access while connected to an exit node.
- `--hostname=<name>` Provide a hostname to use for the device instead of the one provided by the OS. Note that this will change the machine name used in [MagicDNS](https://tailscale.com/kb/1081/magicdns).
- `--login-server=<url>` Provide the base URL of a control server instead of `https://controlplane.tailscale.com`. If you are using [Headscale](https://tailscale.com/blog/opensource#the-open-source-coordination-server) for your control server, use your Headscale instance's URL.
- `--nickname=<name>` [Nickname](https://tailscale.com/kb/1225/fast-user-switching#setting-a-nickname) for the current account.
- `--operator=<user>` Provide a Unix username other than `root` to operate `tailscaled`.
- `--qr` Generate a QR code for the web login URL. Defaults to not showing a QR code.
- `--stateful-filtering` Enable stateful filtering for [subnet routers](https://tailscale.com/kb/1019/subnets) and [exit nodes](https://tailscale.com/kb/1103/exit-nodes). When enabled, inbound packets with another node's destination IP are dropped, unless they are a part of a tracked outbound connection from that node. Defaults to disabled.
- `--shields-up` [Block incoming connections](https://tailscale.com/kb/1072/client-preferences) from other devices on your Tailscale network. Useful for personal devices that only make outgoing connections.
- `--ssh` Run a [Tailscale SSH](https://tailscale.com/kb/1193/tailscale-ssh) server, permitting access per the tailnet admin's declared [access policy](https://tailscale.com/kb/1018/acls), or the [default policy](https://tailscale.com/kb/1192/acl-samples#allow-all-default-acl) if none is defined. Defaults to false.
- `--timeout=<duration>` Maximum amount of time to wait for the Tailscale service to initialize. `duration` can be any value parseable by [`time.ParseDuration()`](https://pkg.go.dev/time#ParseDuration). Defaults to `0s`, which blocks forever.
- `--unattended`(Windows only) Run in [unattended mode](https://tailscale.com/kb/1088/run-unattended) where Tailscale keeps running even after the current user logs out.

#### [logout](https://tailscale.com/kb/1080/cli?tab=macos\#logout)

Disconnect from Tailscale and expire the current log in. The next time you run `tailscale up`, you'll need to reauthenticate your device.

```shell
tailscale logout

```

If you run `tailscale logout` on an [ephemeral node](https://tailscale.com/kb/1111/ephemeral-nodes), the node will be removed from your tailnet immediately.

#### [metrics](https://tailscale.com/kb/1080/cli?tab=macos\#metrics)

Expose and collect [Tailscale client metrics](https://tailscale.com/kb/1482/client-metrics) for use with third-party monitoring systems.

```shell
tailscale metrics

```

Subcommands:

- `print` Shows client metrics in the current terminal session.
- `write` Writes metric values to a text file.

#### [netcheck](https://tailscale.com/kb/1080/cli?tab=macos\#netcheck)

Get a report on your current physical network conditions. This command is provided to help debug connection troubles.

```shell
tailscale netcheck

```

`netcheck` will output a report like this:

```shell
Report:
    * Time: 2025-03-13T16:35:03.336481Z
    * UDP: true
    * IPv4: yes, <ipv4-address>
    * IPv6: yes, <ipv6-address>
    * MappingVariesByDestIP: false
    * PortMapping:
    * Nearest DERP: Seattle
    * DERP latency:
        - sea: 24.2ms  (Seattle)
        - sfo: 50.5ms  (San Francisco)
        - lax: 57.2ms  (Los Angeles)
        - den: 58.5ms  (Denver)
        - dfw: 63ms    (Dallas)
        - ord: 73.3ms  (Chicago)

```

(In the example output, the list of [DERP servers](https://tailscale.com/kb/1232/derp-servers) is truncated for brevity.)

- **UDP** shows whether UDP traffic is enabled on the current network. If this is false, it's unlikely Tailscale will be able to make point-to-point connections, and will instead rely on our [encrypted TCP relays (DERP)](https://tailscale.com/kb/1232/derp-servers)
- **IPv4** and **IPv6** show your network public IP addresses and support for both protocols.
- **MappingVariesByDestIP** describes whether your device is behind a difficult NAT that varies the device's IP address depending on the destination.
- **HairPinning** describes whether your router can route connections from endpoints on your LAN back to your LAN using those endpoints' globally-mapped IPv4 addresses/ports.
- **PortMapping** describes a list of which three port-mapping services exist on your router. Possible values are "UPnP", "NAT-PMP", and "PCP".
- **DERP latency** and **Nearest DERP** describe latency from our [encrypted TCP relays (DERP)](https://tailscale.com/kb/1232/derp-servers). The lowest latency ("nearest") server is used for traffic.

If any fields are blank, it means Tailscale wasn't able to measure that network property.

All the information from `tailscale netcheck` is also available in the [admin console](https://login.tailscale.com/admin/machines), by selecting a particular machine.

#### [version](https://tailscale.com/kb/1080/cli?tab=macos\#version)

Print the version of Tailscale.

```shell
tailscale version [flags]

```

Available flags:

- `--daemon` Also print local node's daemon version. Defaults to false.
- `--json` Return a machine-readable JSON response.
- `--upstream` Print the latest upstream release version from pkgs.tailscale.com. Defaults to false.

Running `tailscale version` also prints other information, including the Go version. Here's an example of the output:

```shell
tailscale version
1.72.0
  tailscale commit: 9a0f00ea8ed08d1a94b357fb232ac9d44a512664
  other commit: 387e0b40ad87031fb4444372ee80a97156e8deb9
  go version: go1.22.5

```

#### [ping](https://tailscale.com/kb/1080/cli?tab=macos\#ping)

Attempt to ping another device exclusively over Tailscale.

The regular `ping` command often works fine over Tailscale, but `tailscale ping` provides more details about the connection over Tailscale that can be helpful when troubleshooting connectivity.

```shell
tailscale ping <hostname-or-ip>

```

You can call `tailscale ping` using either a [100.x.y.z address](https://tailscale.com/kb/1033/ip-and-dns-addresses) or a [machine name](https://tailscale.com/kb/1098/machine-names).

Available flags:

- `--c` Maximum number of pings to send. Defaults to 10.
- `--icmp`, `--icmp=false` Perform an ICMP-level ping (through WireGuard, but not the local host OS stack). Defaults to false.
- `--peerapi`, `--peerapi=false` Try hitting the peer's PeerAPI HTTP server. Defaults to false.
- `--tsmp`, `--tsmp=false` Perform a TSMP-level ping (through WireGuard, but not either host's OS stack). Defaults to false.
- `--timeout=<duration>` Maximum amount of time to wait before giving up on a ping. `duration` can be any value parseable by [`time.ParseDuration()`](https://pkg.go.dev/time#ParseDuration). Defaults to `5s`.
- `--until-direct`, `--until-direct=false` Stop once a direct path is established. Defaults to true.
- `--verbose`, `--verbose=false` Show verbose output. Defaults to false.

There are [four types of ping messages](https://tailscale.com/kb/1465/ping-types) supported by the `tailscale ping` command.

#### [serve](https://tailscale.com/kb/1080/cli?tab=macos\#serve)

Serve content and local servers from your Tailscale node to your tailnet.

To publicly share the local service to the internet, use the [`funnel`](https://tailscale.com/kb/1080/cli?tab=macos#funnel) command.

```shell
tailscale serve <target>
tailscale serve <subcommand> [flags] <args>

```

Subcommands:

- [`status`](https://tailscale.com/kb/1242/tailscale-serve#view-the-status) Shows the status.
- [`reset`](https://tailscale.com/kb/1242/tailscale-serve#reset-tailscale-serve) Resets the configuration.

For more information, refer to the [`tailscale serve`](https://tailscale.com/kb/1242/tailscale-serve) topic.

#### [set](https://tailscale.com/kb/1080/cli?tab=macos\#set)

Change specified preferences.

Unlike [`tailscale up`](https://tailscale.com/kb/1080/cli?tab=macos#up), this command does not require the complete set of desired settings. It only updates the settings you explicitly set. There are no default values. Note that when using [Fast User Switching](https://tailscale.com/kb/1225/fast-user-switching), changes made are only for the currently connected tailnet.

```shell
tailscale set [flags]

```

Available flags:

- `--accept-dns` Accept [DNS configuration](https://tailscale.com/kb/1054/dns) from the admin console.
- `--accept-risk=<risk>` Accept risk and skip confirmation for risk type. This can be either `lose-ssh` or `all`, or an empty string to not accept risk.
- `--accept-routes`, `--accept-routes=false` Accept [subnet routes](https://tailscale.com/kb/1019/subnets) that other nodes advertise.
- `--advertise-exit-node`, `--advertise-exit-node=false` Offer to be an exit node for internet traffic for the tailnet.
- `--advertise-routes=<ip>` Expose physical [subnet routes](https://tailscale.com/kb/1019/subnets) to your entire Tailscale network. This is a comma-separated string, such as "10.0.0.0/8,192.168.0.0/24", or an empty string to not advertise routes.
- `--auto-update`, `--auto-update=false` Enable or disable [auto-updates](https://tailscale.com/kb/1067/update#auto-updates) for the client.
- `--exit-node=<ip|name>` Provide a [Tailscale IP](https://tailscale.com/kb/1033/ip-and-dns-addresses) or [machine name](https://tailscale.com/kb/1098/machine-names) to use as an exit node. You can also use `--exit-node=auto:any` to track the suggested exit node and automatically switch to it when available exit nodes or network conditions change. To disable the use of an exit node, pass the flag with an empty argument using `--exit-node=`.
- `--exit-node-allow-lan-access`, `--exit-node-allow-lan-access=false` Allow the client node access to its own LAN while connected to an exit node.
- `--hostname=<name>` Hostname to use for the device instead of the one provided by the OS. Note that this will change the machine name used in [MagicDNS](https://tailscale.com/kb/1081/magicdns).
- `--nickname=<name>` [Nickname](https://tailscale.com/kb/1225/fast-user-switching#setting-a-nickname) for the current account.
- `--operator=<user>` A Unix username other than `root` to operate `tailscaled`.
- `--shields-up`, `--shields-up=false` [Block incoming connections](https://tailscale.com/kb/1072/client-preferences) from other devices on your Tailscale network.
Useful for personal devices that only make outgoing connections.
- `--ssh`, `--ssh=false` Run a [Tailscale SSH](https://tailscale.com/kb/1193/tailscale-ssh) server, permitting access per the tailnet admin's declared
[access policy](https://tailscale.com/kb/1018/acls), or the [default policy](https://tailscale.com/kb/1192/acl-samples#allow-all-default-acl) if none is defined.
- `--webclient`, `--webclient=false` Expose the [web interface](https://tailscale.com/kb/1325/device-web-interface) to your tailnet persistently in the background on port `:5252.`

#### [ssh](https://tailscale.com/kb/1080/cli?tab=macos\#ssh)

Establish a [Tailscale SSH](https://tailscale.com/kb/1193/tailscale-ssh) session to a Tailscale machine.

You can often use the regular `ssh` command or another SSH client to make an SSH session to a Tailscale machine. However, when your local node is in [userspace-networking](https://tailscale.com/kb/1177/kernel-vs-userspace-routers#userspace-netstack-mode) mode and can't make a direct connection, use `tailscale ssh`. This sets up an SSH `ProxyCommand` to connect through the local `tailscaled` daemon. You can also use `tailscale ssh` when your local node is in [kernel](https://tailscale.com/kb/1177/kernel-vs-userspace-routers#kernel-mode) mode.

The `tailscale ssh` command automatically checks the destination server's SSH host key against the node's SSH host key as advertised via the Tailscale coordination server.

```shell
tailscale ssh <args>

```

`<args>` is one of the following forms:

- `host` The destination server. An interactive session will prompt you for the user name to use for the session.
- `user@host` The user name for the session and the destination server.

For both forms, `host` can be the destination server's [MagicDNS](https://tailscale.com/kb/1081/magicdns) name (even if `--accept-dns=false` was set on the local node) or the destination server's [Tailscale IP address](https://tailscale.com/kb/1033/ip-and-dns-addresses).

`tailscale ssh` is not available on sandboxed macOS builds—use the regular `ssh` client instead.

#### [status](https://tailscale.com/kb/1080/cli?tab=macos\#status)

Get the status of your connections to other Tailscale devices.

```shell
tailscale status

```

This command returns a table of information like so:

```markup
1           2         3           4         5
100.1.2.3   device-a  apenwarr@   linux     active; direct <ip-port>, tx 1116 rx 1124
100.4.5.6   device-b  crawshaw@   macOS     active; relay <relay-server>, tx 1351 rx 4262
100.7.8.9   device-c  danderson@  windows   idle; tx 1214 rx 50
100.0.1.2   device-d  ross@       iOS       —

```

From left-to-right, these columns represent:

- Column 1 is a [**Tailscale IP**](https://tailscale.com/kb/1015/100.x-addresses), which you can use to connect to the device.
- Column 2 is the [**machine name**](https://tailscale.com/kb/1098/machine-names) of the device. If you use [MagicDNS](https://tailscale.com/kb/1081/magicdns), you can also use this name to connect.
- Column 3 is the **email address** for the owner of the device.
- Column 4 is the **device OS**.
- Column 5 shows the current **connection status**.

Connection status (column 5) is shown using three terms:

- `active` means traffic is currently being sent/received from this device. You'll also see either (a) "direct" for peer-to-peer connections, along with the IP address used to connect or (b) "relay" for connections using a [relay server](https://tailscale.com/kb/1232/derp-servers) along with a city code (nyc, fra, tok, syd) for the respective location.
- `idle` means traffic is not currently being sent/received from this device.
- `–` means no traffic has ever been sent/received from this device.

`active` and `idle` connection statuses will also include tx/rx values indicating the number of bytes sent (tx) and received (rx) from this device.

You can filter this list to only active connections by running `tailscale status --active`.

Running `tailscale status` with the `--json` flag returns a machine-readable JSON response.

```shell
tailscale status --json

```

Combine this with [`jq`](https://stedolan.github.io/jq) to automate data collection about your network. For example, the following command counts and sorts the relay servers your Tailscale peers are connected to.

```shell
tailscale status --json | jq -r '.Peer[].Relay | select(.!="")' | sort | uniq -c | sort -nr

```

#### [switch](https://tailscale.com/kb/1080/cli?tab=macos\#switch)

Switch to a different Tailscale account. For more information about switching accounts, refer to [fast-user-switching](https://tailscale.com/kb/1225/fast-user-switching).

```shell
tailscale switch <account> [flags]

```

Examples:

- To switch to the [alice@example.com](mailto:alice@example.com) account:







```shell
tailscale switch alice@example.com

```

- To switch to the account that has the [nickname](https://tailscale.com/kb/1225/fast-user-switching#setting-a-nickname) "work":







```shell
tailscale switch work

```


Available flags:

- `--list` Lists available accounts.

#### [syspolicy](https://tailscale.com/kb/1080/cli?tab=macos\#syspolicy)

List system policies, reload system policies, or view errors related to the [system policies](https://tailscale.com/kb/1315/mdm-keys) configured in your tailnet.

```shell
tailscale syspolicy

```

Subcommands:

- `list` Shows system policies, reload system policies, or view errors related to the [system policies](https://tailscale.com/kb/1315/mdm-keys) configured on the device.
- `reload` Forces the Tailscale client to reload and reapply system policy settings on the device.

Available flags:

- `-json` Return a machine-readable JSON response.

#### [update](https://tailscale.com/kb/1080/cli?tab=macos\#update)

The `update` command is available in Tailscale v1.36 or later for Windows and Ubuntu/Debian Linux, in v1.48.0 or later for the Mac Apple Store version and Synology, and in v1.54.0 or later for QNAP and the [Standalone variant of the macOS application](https://tailscale.com/kb/1065/macos-variants/). If you don't see this command and you are running one of these operating systems, consider [updating your Tailscale client](https://tailscale.com/kb/1067/update/).

Update the Tailscale client version to the latest version, or to a different version.

```shell
tailscale update [flags]

```

Available flags:

- `--dry-run` Show what update would do, without performing the update and without prompting to start the update.
- `--track` The track to check for updates, either "stable" or ["unstable"](https://tailscale.com/kb/1083/install-unstable). If not specified, the update uses the track currently in effect for the client.
- `--version` An explicit version to use for the update or downgrade. You cannot specify both `--track` and `--version`.
- `--yes` Perform the update without interactive prompts. Defaults to false.

If you downgrade to a version that does not have the `tailscale update` functionality, you won't be able to run `tailscale update` to return to the prior version. You would need to [perform an update](https://tailscale.com/kb/1067/update) without using the Tailscale CLI.

To determine the current version on a client, run [`tailscale version`](https://tailscale.com/kb/1080/cli?tab=macos#version).

Examples:

Update to the latest version within your current track (stable or unstable, depending on what you're running):

```shell
tailscale update

```

Update to the latest version within your current track without using interactive prompts:

```shell
tailscale update --yes

```

Update to Tailscale v1.34:

```shell
tailscale update --version=1.34.0

```

Update to the latest unstable version:

```shell
tailscale update --track=unstable

```

#### [web](https://tailscale.com/kb/1080/cli?tab=macos\#web)

Start a web server for controlling the `tailscaled` daemon. Starting a web server is useful when the CLI or a native app is impractical (such as on NAS devices).

```shell
tailscale web [flags]

```

Available flags:

- `--cgi=<true|false>` Run the web server as a CGI script. Defaults to false.
- `--listen=<ip|name>` Set the listen address. Use port `0` for automatic. Defaults to `localhost:8088`.
- `--prefix=<string>` Set the URL prefix added to requests (for CGI or reverse proxies).
- `--read-only` Run the web server in read-only mode.

#### [whois](https://tailscale.com/kb/1080/cli?tab=macos\#whois)

Get the machine and user associated with a Tailscale IP.

```shell
tailscale whois ip[:port]

```

For user devices, this command returns:

```markup
Machine:
  Name:
  ID:
  Addresses:
  AllowedIPs:
User:
  Name:
  ID:
Capabilities:

```

For devices that are tagged, this command returns:

```markup
Machine:
  Name:
  ID:
  Addresses:
  AllowedIPs:
  Tags:
Capabilities:

```

For each of these fields:

- `Machine`, `Name` is the [machine name](https://tailscale.com/kb/1098/machine-names) of the device. If you use [MagicDNS](https://tailscale.com/kb/1081/magicdns), you can also use this name to connect.
- `Machine`, `ID` is the [node id](https://tailscale.com/kb/1155/terminology-and-concepts#node) of the device.
- `Machine`, `Addresses` are the [Tailscale IP](https://tailscale.com/kb/1015/100.x-addresses), which you can use to connect to the device.
- `Machine`, `AllowedIPs` are the subnet routes available to the device.
- `Machine`, `Tags` are the tags to which the device belongs.
- `User`, `Name` is the email address for the owner of the device.
- `User`, `ID` is the unique ID of the user
- `Capabilities` show the grants for the device.

Running `tailscale whois` with the `--json` flag will return a machine-readable JSON response. (Note that the `--json` option must come before the `ip[:port]` argument.)

```shell
tailscale whois --json ip[:port]

```

Last updated Jul 24, 2025