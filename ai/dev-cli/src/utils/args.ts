import type { ParsedArgs } from '../types.js'

export const parseArgs = (args: string[]): ParsedArgs => {
  const options: Record<string, string | boolean> = {}
  const positionals: string[] = []
  
  let i = 0
  while (i < args.length) {
    const arg = args[i] ?? ''
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const nextArg = args[i + 1]
      
      if (!nextArg || nextArg.startsWith('--')) {
        options[key] = true
        i++
      } else {
        options[key] = nextArg
        i += 2
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1)
      options[key] = true
      i++
    } else {
      positionals.push(arg)
      i++
    }
  }
  
  return { options, positionals }
}

export const requireOption = (options: Record<string, string | boolean>, key: string): string => {
  const value = options[key]
  if (!value || typeof value === 'boolean') {
    throw new Error(`Missing required option: --${key}`)
  }
  return value
}

export const getOption = (options: Record<string, string | boolean>, key: string, defaultValue: string): string => {
  const value = options[key]
  if (!value || typeof value === 'boolean') {
    return defaultValue
  }
  return value
}

export const getBoolOption = (options: Record<string, string | boolean>, key: string): boolean => {
  return Boolean(options[key])
}