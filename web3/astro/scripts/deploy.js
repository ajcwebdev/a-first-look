async function main() {
  const HelloWorldFactory = await ethers.getContractFactory("HelloWorld")
  const helloMessage = await HelloWorldFactory.deploy("Hello from ajcwebdev")
  await helloMessage.deployed()

  console.log("Contract deployed to:", helloMessage.address)
  console.log("Contract deployed by " + JSON.stringify(helloMessage.signer) + " signer")
  process.exit(0)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })