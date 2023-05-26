import Dash from "dash"
import * as dotenv from "dotenv"
dotenv.config()

const { MNEMONIC: mnemonicValue, NETWORK } = process.env
const MNEMONIC = mnemonicValue || null

export const client = new Dash.Client({
  network: NETWORK,
  wallet: {
    mnemonic: MNEMONIC,
    unsafeOptions: {
      skipSynchronizationBeforeHeight: 700000,
    },
  },
})