require("dotenv").config()
require("@nomiclabs/hardhat-ethers")

module.exports = {
  solidity: "0.8.6",
  paths: {
    artifacts: '../svelte/src/artifacts',
  },
  networks: {
    ropsten: {
      url: process.env.QUICKNODE_ROPSTEN_URL,
      accounts: [`0x` + process.env.PRIVATE_KEY],
    }
  },
}