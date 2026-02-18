import { LogLevel } from "./types"

const serializeArgs = (args: unknown[]): string => {
  return args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      return JSON.stringify(arg, null, 2)
    }
    return String(arg)
  }).join(' ')
}

const log = (level: LogLevel, ...args: unknown[]): void => {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`
  const message = serializeArgs(args)
  console[level](`${prefix} ${message}`)
}

export const l = {
  info: (...args: unknown[]): void => log("info", ...args),
  warn: (...args: unknown[]): void => log("warn", ...args),
  error: (...args: unknown[]): void => log("error", ...args),
  debug: (...args: unknown[]): void => log("debug", ...args)
}