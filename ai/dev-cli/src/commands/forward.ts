import { exists, run, runInteractive, l, err } from '@/utils'

const ensure = async (): Promise<void> => {
  if (!(await exists('tailscale'))) throw new Error('tailscale not found')
}

const showHelp = (): void => {
  l(`
forward - Tailscale serve and funnel helpers

Subcommands:
  serve status|reset    Manage Tailscale serve
  funnel status|reset   Manage Tailscale funnel
  version              Show Tailscale version
  `)
}

export const forward = async (subcommand: string, args: string[]): Promise<void> => {
  if (args.includes('--help')) {
    showHelp()
    return
  }
  
  switch (subcommand) {
    case 'serve':
      await forwardServe(args[0] ?? '')
      break
    case 'funnel':
      await forwardFunnel(args[0] ?? '')
      break
    case 'version':
      await forwardVersion()
      break
    default:
      err(`Unknown subcommand: ${subcommand}`)
      showHelp()
      process.exitCode = 1
  }
}

const forwardServe = async (action: string): Promise<void> => {
  await ensure()
  const args = action === 'status' ? ['serve', 'status'] : ['serve', 'reset']
  const code = await runInteractive('tailscale', args)
  process.exitCode = code
}

const forwardFunnel = async (action: string): Promise<void> => {
  await ensure()
  const args = action === 'status' ? ['funnel', 'status'] : ['funnel', 'reset']
  const code = await runInteractive('tailscale', args)
  process.exitCode = code
}

const forwardVersion = async (): Promise<void> => {
  await ensure()
  const { code, stdout, stderr } = await run('tailscale', ['version', '--daemon'])
  if (code !== 0) throw new Error(stderr || stdout)
  process.stdout.write(stdout)
}