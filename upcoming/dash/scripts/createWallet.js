import { client } from './client.js'

const createWallet = async () => {
  const walletAccount = await client.getWalletAccount()
  const mnemonic = client.wallet.exportWallet()
  const { address } = walletAccount.getUnusedAddress()
  console.log("WALLET_ADDRESS=" + `"${address}"`)
  return mnemonic
}

createWallet()
  .then(data => console.log(
    "MNEMONIC=" + `"${data}"`
  ))
  .catch(error => console.error('Something went wrong:\n', error))
  .finally(() => client.disconnect())