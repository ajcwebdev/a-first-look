const createLogger = (filePath: string) => {
  const p = filePath.replace(/^src\//, '').replace(/\.ts$/, '')
  
  return {
    info: (message: string, ...args: unknown[]): void => {
      console.log(`[${p}] INFO: ${message}`, ...args)
    },
    error: (message: string, ...args: unknown[]): void => {
      console.error(`[${p}] ERROR: ${message}`, ...args)
    },
    success: (message: string, ...args: unknown[]): void => {
      console.log(`[${p}] SUCCESS: ${message}`, ...args)
    },
    debug: (message: string, ...args: unknown[]): void => {
      console.log(`[${p}] DEBUG: ${message}`, ...args)
    }
  }
}

export { createLogger }