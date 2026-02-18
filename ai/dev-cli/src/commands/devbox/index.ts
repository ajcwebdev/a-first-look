import { createLogger, error as errorStyle, value, err as plainErr } from '@/utils'
import { create } from './create.js'
import { deleteInstance } from './delete.js'
import { ssh } from './ssh.js'
import { status } from './status.js'
import { ip } from './ip.js'
import { ping } from './ping.js'
import { verify } from './verify.js'
import { setup } from './setup.js'
import { provision } from './provision.js'
import { listOs, listPlans, listRegions } from './list.js'
import { showHelp } from '../devbox-utils/show-help.js'

const p = '[commands/devbox/index]'
const { debug } = createLogger(p)

export const devbox = async (subcommand: string, args: string[]): Promise<void> => {
  debug('executing subcommand', value(subcommand))
  
  if (args.includes('--help')) {
    showHelp()
    return
  }
  
  switch (subcommand) {
    case 'create':
      await create(args)
      break
    case 'delete':
      await deleteInstance(args)
      break
    case 'ssh':
      await ssh(args)
      break
    case 'status':
      await status()
      break
    case 'ip':
      await ip(args)
      break
    case 'ping':
      await ping(args)
      break
    case 'verify':
      await verify(args)
      break
    case 'setup':
      await setup(args)
      break
    case 'provision':
      await provision(args)
      break
    case 'list-os':
      await listOs(args)
      break
    case 'list-plans':
      await listPlans(args)
      break
    case 'list-regions':
      await listRegions(args)
      break
    default:
      plainErr(`${errorStyle('Unknown subcommand:')} ${value(subcommand)}`)
      showHelp()
      process.exitCode = 1
  }
}