import { exists, createLogger, muted } from '@/utils'

const p = '[commands/devbox-utils/ensure]'
const { debug } = createLogger(p)

export const ensure = async (bins: string[]): Promise<void> => {
  debug('checking required binaries', muted(bins.join(', ')))
  const checks = await Promise.all(bins.map(async b => ({ b, ok: await exists(b) })))
  const missing = checks.filter(x => !x.ok).map(x => x.b)
  if (missing.length > 0) throw new Error(`missing binaries: ${missing.join(', ')}`)
}