import { parseArgs, getOption, deleteInstance as deleteVultrInstance, createLogger, label, value } from '@/utils'

const p = '[commands/devbox/delete]'
const { l } = createLogger(p)

export const deleteInstance = async (args: string[]): Promise<void> => {
  l('starting delete command')
  const { options } = parseArgs(args)
  
  const id = getOption(options, 'id', '')
  const labelOption = getOption(options, 'label', '')
  if (!id && !labelOption) throw new Error('provide --id or --label')
  
  l('deleting instance', label('id:'), value(id || 'n/a'), label('label:'), value(labelOption || 'n/a'))
  await deleteVultrInstance({ id, label: labelOption })
  l(`deleted vultr instance`, value(id || labelOption))
}