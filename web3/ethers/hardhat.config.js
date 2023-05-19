require("@nomiclabs/hardhat-waffle")
require('dotenv').config()

const { ALCHEMY_URL, ALCHEMY_KEY } = process.env

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.7",
  defaultNetwork: "hardhat",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {},
    ropsten: {
      url: `${ALCHEMY_URL}`,
      accounts: [`0x` + `${ALCHEMY_KEY}`]
    }
  }
}