const hre = require("hardhat")

async function main() {
  const Greeter = await hre.ethers.getContractFactory("Greeter")
  const greeter = await Greeter.deploy("Hello from ajcwebdev!")
  await greeter.deployed()

  console.log("Greeter deployed to " + greeter.address + " address")
  console.log("Greeter deployed by " + JSON.stringify(greeter.signer) + " signer")
  console.log("Deploy transaction hash: " + greeter.deployTransaction.hash)
  console.log("Deploy transaction block hash: " + greeter.deployTransaction.blockHash)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })