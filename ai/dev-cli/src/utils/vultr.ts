import { run, runJson } from './exec.js'
import { createLogger, value } from './logger.js'
import type { VultrInstance, VultrCreateResponse, VultrInstanceArgs, DeleteInstanceArgs } from '../types.js'

const p = '[utils/vultr]'
const { l } = createLogger(p)

export const createInstance = async (args: VultrInstanceArgs): Promise<VultrCreateResponse> => {
  const cmd = 'vultr-cli'
  const cliArgs = [
    'instance',
    'create',
    '--region',
    args.region,
    '--plan',
    args.plan,
    '--os',
    args.os,
    '--host',
    args.host,
    '--userdata',
    args.userData,
    '-o',
    'json'
  ]
  const { code, stdout, stderr } = await run(cmd, cliArgs)
  if (code !== 0) throw new Error(stderr || stdout)
  l('created instance', value(args.host))
  return JSON.parse(stdout) as VultrCreateResponse
}

export const listInstances = async (): Promise<VultrInstance[]> => {
  const data = await runJson<{ instances: VultrInstance[] }>('vultr-cli', ['instance', 'list', '-o', 'json'])
  return data.instances
}

export const deleteInstance = async (args: DeleteInstanceArgs): Promise<void> => {
  const target = args.id
    ? args.id
    : (await listInstances()).find(x => x.label === args.label)?.id
  if (!target) throw new Error('instance not found')
  const { code, stdout, stderr } = await run('vultr-cli', ['instance', 'delete', String(target)])
  if (code !== 0) throw new Error(stderr || stdout)
  l('deleted instance', value(String(target)))
}