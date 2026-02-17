import { createLogger, exists, platformInfo, run, label, success as successStyle, error as errorStyle, muted } from '@/utils'

const p = '[commands/doctor]'
const { l } = createLogger(p)

export const doctor = async (): Promise<void> => {
  const bins = ['tailscale', 'vultr-cli']
  const results = await Promise.all(bins.map(async b => ({ b, ok: await exists(b) })))
  const report = results.map(x => `${label(x.b)}: ${x.ok ? successStyle('ok') : errorStyle('missing')}`).join(', ')
  l('binaries', report)
  l('platform', muted(platformInfo()))
  if (results.find(x => x.b === 'tailscale')?.ok) {
    const { code, stdout } = await run('tailscale', ['version', '--json'])
    if (code === 0) process.stdout.write(stdout.trim() + '\n')
  }
}