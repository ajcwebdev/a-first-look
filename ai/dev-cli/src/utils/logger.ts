import type { LogFn, Code } from '../types.js'

const code = (open: number, close: number): Code => [`\x1b[${open}m`, `\x1b[${close}m`]

const env = typeof process !== 'undefined' ? process.env : {}
const isTTY = typeof process !== 'undefined' && !!process.stdout && !!process.stdout.isTTY
const colorsEnabled = ('FORCE_COLOR' in env && env['FORCE_COLOR'] !== '0') || (isTTY && !('NO_COLOR' in env))

const S = {
  reset: code(0, 0),
  bold: code(1, 22),
  underline: code(4, 24),
  fg: {
    success: code(32, 39),
    warning: code(33, 39),
    error: code(31, 39),
    info: code(36, 39),
    accent: code(35, 39),
    muted: code(90, 39),
    text: code(37, 39)
  }
}

const wrap = (pair: Code, input: unknown): string => {
  const s = String(input)
  return colorsEnabled ? pair[0] + s + pair[1] : s
}

export const success = (s: unknown): string => wrap(S.fg.success, s)
export const warning = (s: unknown): string => wrap(S.fg.warning, s)
export const error = (s: unknown): string => wrap(S.fg.error, s)
export const info = (s: unknown): string => wrap(S.fg.info, s)
export const accent = (s: unknown): string => wrap(S.fg.accent, s)
export const muted = (s: unknown): string => wrap(S.fg.muted, s)
export const text = (s: unknown): string => wrap(S.fg.text, s)
export const bold = (s: unknown): string => wrap(S.bold, s)
export const underline = (s: unknown): string => wrap(S.underline, s)
export const label = (s: unknown): string => wrap(S.bold, wrap(S.fg.muted, s))
export const value = (s: unknown): string => wrap(S.fg.accent, s)

export const l = console.log
export const err = console.error

export const createLogger = (prefix: string): { l: LogFn; err: LogFn; debug: LogFn; trace: LogFn } => {
  const stamp = (): string => new Date().toISOString()
  const write = (level: string, args: unknown[]): void => {
    const levelColor = level === 'error' ? error : level === 'warn' ? warning : level === 'success' ? success : level === 'debug' || level === 'trace' ? muted : info
    const coloredLevel = levelColor(`[${level}]`)
    const coloredPrefix = muted(prefix)
    const coloredStamp = muted(stamp())
    
    const formattedArgs = args.map(v => typeof v === 'string' ? v : JSON.stringify(v))
    const line = `${coloredPrefix} ${coloredLevel} ${coloredStamp} ${formattedArgs.join(' ')}\n`
    
    const target = level === 'error' ? process.stderr : process.stdout
    target.write(line)
  }
  const gated = (): boolean => Boolean(process.env['DEBUG'] && process.env['DEBUG'] !== '0')
  const l: LogFn = (...args) => write('info', args)
  const err: LogFn = (...args) => write('error', args)
  const debug: LogFn = (...args) => {
    if (gated()) write('debug', args)
  }
  const trace: LogFn = (...args) => {
    if (gated()) write('trace', args)
  }
  return { l, err, debug, trace }
}