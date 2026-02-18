import { createLogger, value, muted, label } from './logger.js'

const p = '[utils/exec]'
const { debug, trace } = createLogger(p)

const getTailscalePath = (): string => {
  if (process.platform === 'darwin') {
    const appPath = '/Applications/Tailscale.app/Contents/MacOS/Tailscale'
    try {
      const stats = Bun.file(appPath)
      if (stats.size > 0) {
        return appPath
      }
    } catch {}
  }
  return 'tailscale'
}

export const exists = async (cmd: string): Promise<boolean> => {
  if (cmd === 'tailscale' && process.platform === 'darwin') {
    const appPath = '/Applications/Tailscale.app/Contents/MacOS/Tailscale'
    try {
      const stats = Bun.file(appPath)
      return stats.size > 0
    } catch {
      debug('macOS Tailscale app not found at', value(appPath))
    }
  }
  
  const runner = process.platform === 'win32' ? ['where', [cmd]] : ['bash', ['-lc', `command -v ${cmd}`]]
  const [bin, args] = runner as [string, string[]]
  try {
    const proc = Bun.spawn([bin, ...args], { stdout: 'pipe', stderr: 'pipe' })
    const exitCode = await proc.exited
    return exitCode === 0
  } catch {
    return false
  }
}

export const run = async (cmd: string, args: string[], env?: Record<string, string>, cwd?: string, stdin?: string): Promise<{ code: number; stdout: string; stderr: string }> => {
  const actualCmd = cmd === 'tailscale' ? getTailscalePath() : cmd
  trace('run', value(actualCmd), muted(JSON.stringify(args)), stdin ? muted('[with stdin]') : '')
  
  const spawnOptions: Parameters<typeof Bun.spawn>[1] = {
    env: { ...process.env, ...env },
    stdout: 'pipe',
    stderr: 'pipe',
    stdin: stdin ? 'pipe' : 'ignore'
  }
  if (cwd) spawnOptions.cwd = cwd
  
  const proc = Bun.spawn([actualCmd, ...args], spawnOptions)
  
  if (stdin && proc.stdin && typeof proc.stdin !== 'number') {
    await proc.stdin.write(stdin)
    await proc.stdin.end()
  }
  
  if (!proc.stdout || typeof proc.stdout === 'number') {
    throw new Error('stdout is not a readable stream')
  }
  if (!proc.stderr || typeof proc.stderr === 'number') {
    throw new Error('stderr is not a readable stream')
  }
  
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text()
  ])
  
  const exitCode = await proc.exited
  
  trace('run result', label('code:'), value(exitCode), label('stdout:'), muted(`${stdout.length} bytes`), label('stderr:'), muted(`${stderr.length} bytes`))
  
  return { code: exitCode, stdout, stderr }
}

export const runJson = async <T>(cmd: string, args: string[], env?: Record<string, string>, cwd?: string): Promise<T> => {
  const { code, stdout, stderr } = await run(cmd, args, env, cwd)
  if (code !== 0) throw new Error(stderr || stdout || `failed: ${cmd}`)
  const text = stdout.trim()
  return JSON.parse(text) as T
}

export const runInteractive = async (cmd: string, args: string[], env?: Record<string, string>, cwd?: string, stdin?: string): Promise<number> => {
  const actualCmd = cmd === 'tailscale' ? getTailscalePath() : cmd
  trace('runInteractive', value(actualCmd), muted(JSON.stringify(args)), stdin ? muted('[with stdin]') : '')
  
  const spawnOptions: Parameters<typeof Bun.spawn>[1] = {
    env: { ...process.env, ...env },
    stdio: stdin ? ['pipe', 'inherit', 'inherit'] : ['inherit', 'inherit', 'inherit']
  }
  if (cwd) spawnOptions.cwd = cwd
  
  const proc = Bun.spawn([actualCmd, ...args], spawnOptions)
  
  if (stdin && proc.stdin && typeof proc.stdin !== 'number') {
    await proc.stdin.write(stdin)
    await proc.stdin.end()
  }
  
  const exitCode = await proc.exited
  trace('runInteractive result', label('code:'), value(exitCode))
  
  return exitCode
}

export const randomPassword = (length: number): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+'
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  const arr = Array.from(bytes).map(b => chars[b % chars.length])
  return arr.join('')
}

export const platformInfo = (): string => {
  const parts = [process.platform, Bun.version, process.arch]
  return parts.join(' ')
}