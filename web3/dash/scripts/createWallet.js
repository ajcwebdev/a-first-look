import { client } from './client.js'

const createWallet = async () => {
  const account = await client.getWalletAccount()
  const mnemonic = client.wallet.exportWallet()
  const { address } = account.getUnusedAddress()
  console.log('Unused address:', address)
  return mnemonic
}

createWallet()
  .then(data => console.log('Mnemonic:', data))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect())