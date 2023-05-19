import Dash from "dash"
import * as dotenv from "dotenv"
dotenv.config()

export const client = new Dash.Client({
  network: 'testnet',
  wallet: {
    // mnemonic: null,
    // offlineMode: true,
    mnemonic: process.env.MNEMONIC,
    unsafeOptions: {
      skipSynchronizationBeforeHeight: 650000, // only sync from early-2022
    },
  },
})