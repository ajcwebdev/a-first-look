import { createLogger, error as errorStyle, value, bold, info as infoStyle, l, err as plainErr } from '@/utils'
import { devbox } from './commands/devbox/index.js'
import { forward } from './commands/forward.js'
import { doctor } from './commands/doctor.js'

const p = '[cli]'
const { err } = createLogger(p)

const showHelp = (): void => {
  l(`
${bold('dev-cli')} - Unified Dev Box CLI

${infoStyle('Usage:')} bun run cli <command> [options]

${infoStyle('Commands:')}
  devbox create    Create a private dev box on Vultr
  devbox delete    Delete a dev box
  devbox ssh       SSH into a dev box
  devbox status    Show Tailscale status
  devbox ip        Get IP address of a dev box
  devbox ping      Ping a dev box
  
  forward serve    Manage Tailscale serve
  forward funnel   Manage Tailscale funnel
  forward version  Show Tailscale version
  
  doctor          Check prerequisites and environment
  
${infoStyle('Options:')}
  --help          Show help

Run 'bun run cli <command> --help' for command-specific options
  `)
}

const run = async (): Promise<void> => {
  try {
    const args = Bun.argv.slice(2)
    
    if (args.length === 0 || args.includes('--help')) {
      showHelp()
      return
    }
    
    const [command, subcommand, ...restArgs] = args
    
    switch (command) {
      case 'devbox':
        await devbox(subcommand ?? '', restArgs)
        break
      case 'forward':
        await forward(subcommand ?? '', restArgs)
        break
      case 'doctor':
        await doctor()
        break
      default:
        plainErr(`${errorStyle('Unknown command:')} ${value(command)}`)
        showHelp()
        process.exitCode = 1
    }
  } catch (error) {
    err('fatal', errorStyle(error instanceof Error ? error.message : String(error)))
    process.exitCode = 1
  }
}

run()