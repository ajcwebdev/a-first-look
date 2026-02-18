import { createLogger } from '@/utils'

const p = '[commands/devbox-utils/validate-auth-key]'
const { debug } = createLogger(p)

export const validateAuthKey = async (authKey: string): Promise<{ valid: boolean; error?: string }> => {
  debug('validating tailscale auth key format')
  
  if (!authKey) {
    return { valid: false, error: 'Auth key is empty' }
  }
  
  if (!authKey.startsWith('tskey-')) {
    return { valid: false, error: 'Auth key should start with "tskey-"' }
  }
  
  const keyParts = authKey.split('-')
  if (keyParts.length < 3) {
    return { valid: false, error: 'Auth key format appears invalid' }
  }
  
  debug('auth key format appears valid')
  return { valid: true }
}