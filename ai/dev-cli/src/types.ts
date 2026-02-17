export interface ParsedArgs {
  options: Record<string, string | boolean>
  positionals: string[]
}

export interface ExistingInstance {
  vultrInstance?: {
    id: string
    label: string
    status: string
    main_ip?: string
  }
  tailscaleDevice?: {
    name: string
    ip: string
    status: 'active' | 'idle' | 'offline'
  }
}

export interface HealthStatus {
  healthy: boolean
  sshAvailable: boolean
  issues: string[]
}

export interface SetupScriptArgs {
  host: string
  user: string
  tools: string
  repo: string
}

export interface CloudInitArgs {
  tsAuthKey: string
  host: string
  user?: string
}

export interface VultrInstanceArgs {
  region: string
  plan: string
  os: string
  host: string
  userData: string
}

export interface DeleteInstanceArgs {
  id?: string
  label?: string
}

export type VultrInstance = {
  id: string
  label?: string
  main_ip?: string
  status?: string
}

export type VultrCreateResponse = {
  instance: {
    id: string
    os: string
    ram: number
    disk: number
    plan: string
    main_ip: string
    vcpu_count: number
    region: string
    default_password: string
    date_created: string
    status: string
    allowed_bandwidth: number
    netmask_v4: string
    gateway_v4: string
    power_status: string
    server_status: string
    v6_network: string
    v6_main_ip: string
    v6_network_size: number
    label: string
    internal_ip: string
    kvm: string
    os_id: number
    app_id: number
    image_id: string
    snapshot_id: string
    firewall_group_id: string
    features: string[]
    hostname: string
    tags: string[]
    user_scheme: string
  }
}

export type LogFn = (...args: unknown[]) => void

export type Code = [string, string]