# Example Project from [Create a dApp on Avalanche's Fuji Testnet with QuickNode](https://ajcwebdev.com/2022/06/02/how-to-create-a-dapp-on-avalanches-fuji-testnet-with-quicknode/)

## Outline

- Introduction
- Configure MetaMask Wallet for Avalanche
  - Add Avalanche Network
  - Fuji Testnet Faucet
  - Hello World Solidity Contract
  - Deployment Script
  - Hardhat Configuration
- Deploy Avalanche Node on QuickNode
  - Create an Endpoint
  - Deploy Contract to Fuji
- React App
  - Start Development Server
  - Deploy to Netlify
- Resources

## Introduction

[Avalanche](https://www.avax.network/) is an open-source, proof-of-stake blockchain with smart contract functionality that uses the Snow family of consensus protocols. Avalanche features [3 built-in blockchains](https://docs.avax.network/overview/getting-started/avalanche-platform) that are validated and secured by the Primary Network:
* [Exchange Chain (X-Chain)](https://docs.avax.network/overview/getting-started/avalanche-platform/#exchange-chain-x-chain) - Acts as a decentralized platform for creating and trading digital smart assets like AVAX. These assets are a representation of a real-world resource with a set of rules that govern its behavior. The X-Chain is an instance of the Avalanche Virtual Machine (AVM). 
* [Platform Chain (P-Chain)](https://docs.avax.network/overview/getting-started/avalanche-platform/#platform-chain-p-chain) - Metadata blockchain on Avalanche that coordinates validators, keeps track of active subnets, and enables the creation of new subnets. The P-Chain implements the [Snowman consensus protocol](https://docs.avax.network/#snowman-consensus-protocol).
* [Contract Chain (C-Chain)](https://docs.avax.network/overview/getting-started/avalanche-platform/#contract-chain-c-chain) - Allows for the creation smart contracts using the [C-Chain’s API](https://docs.avax.network/apis/avalanchego/apis/c-chain).

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652371334021/gR7DyKNei.png" alt="00-avalanche-primary-network-diagram.png" width="500" /></p>

## Configure MetaMask Wallet for Avalanche

You can create an Avalanche Wallet online at [wallet.avax.network](https://wallet.avax.network/) or you can configure an existing wallet that allows connecting to RPC endpoints. We will use [MetaMask](https://metamask.io/) in this tutorial which you can download [here](https://metamask.io/download/).

### Add Avalanche Network

Open MetaMask and check the available networks. If you just installed the extension, you will only see Ethereum Mainnet.

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652248053481/cHgfEK9rY.png" alt="01-add-network-to-metamask-wallet.png" width="500" /></p>

Click "Add Network" to configure MetaMask for the Avalanche network and include the following information for the Fuji Testnet:

* Network Name: Avalanche FUJI C-Chain
* New RPC URL: `https://api.avax-test.network/ext/bc/C/rpc`
* ChainID: 43113
* Symbol: AVAX
* Explorer: `https://testnet.snowtrace.io/`

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652336836652/vuLG_dDSy.png" alt="02-fuji-network.png" width="500" /></p>

Also include the information for Mainnet:

* Network Name: Avalanche Network
* New RPC URL: `https://api.avax.network/ext/bc/C/rpc`
* ChainID: 43114
* Symbol: AVAX
* Explorer: `https://snowtrace.io/`

You will now see the Avalanche logo and "Avalanche FUJI C-Chain" written at the top.

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652248101306/yPTchExNy.png" alt="03-metamask-configured-for-avalanche.png" width="500" /></p>

### Fuji Testnet Faucet

To interact with Fuji, we need to have AVAX in your wallet. Like the Ropsten faucet on Ethereum, Avalanche has the [Fuji Testnet Faucet](https://faucet.avax-test.network/). Include your wallet address and click "Request 10 AVAX."

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652248145323/ZJZukmVNw.png" alt="04-fuji-testnet-faucet.png" width="500" /></p>

Return to your wallet and you should now have 10 AVAX.

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652248458101/bPjYvPSno.png" alt="05-avalanche-wallet-with-avax-funds.png" width="500" /></p>

### Hello World Solidity Contract

Our `HelloWorld` contract will have a string variable called `helloMessage`. The `hello` function will return the value set to `helloMessage`. The `setHello` function will change the value of `helloMessage` to whatever argument is passed into the function.

```solidity
// contracts/HelloWorld.sol

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

import "hardhat/console.sol";

contract HelloWorld {
  string private helloMessage;

  constructor(string memory _helloMessage) {
    console.log(_helloMessage);
    helloMessage = _helloMessage;
  }

  function hello() public view returns (string memory) {
    return helloMessage;
  }

  function setHello(string memory _helloMessage) public {
    console.log("Changing helloMessage from '%s' to '%s'", helloMessage, _helloMessage);
    helloMessage = _helloMessage;
  }
}
```

### Deployment Script

Our deployment script in `deploy.js` calls the `getContractFactory` method on the `ethers` library and passes in `HelloWorld` as the name of the contract. `HelloWorldFactory` is deployed with the message `Hello from ajcwebdev` and set to `helloMessage` which is called on the next line with the `deployed` method. The address and signer for the contract are logged to the console.

```js
// scripts/deploy.js

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
```

### Hardhat Configuration

The Hardhat configuration includes the Solidity version, path for the contract artifacts, and network information.

```js
// hardhat.config.js

require("dotenv").config()
require("@nomiclabs/hardhat-ethers")
 
module.exports = {
  solidity: "0.8.6",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    fuji: {
      url: process.env.QUICKNODE_URL,
      accounts: [`0x` + process.env.PRIVATE_KEY],
      chainId: 43113,
    },
  },
}
```

We need to include two environment variables in `.env` before we can deploy this contract. Set your Avalanche wallet's private key to the `PRIVATE_KEY` variable and visit QuickNode to deploy our RPC endpoint.

## Deploy Avalanche Node on QuickNode

First you will need to create an account on QuickNode by [filling in the form on the homepage](https://www.quicknode.com/).

### Create an Endpoint

After creating an account, you will see the following screen.

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652250042612/zN6MfjTcW.png" alt="06-create-an-endpoint-on-quicknode.png" width="500" /></p>

Click the "Create an endpoint" button to see the available blockchains.

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652250176774/mzXz9SRZc.png" alt="07-choose-a-chain-and-network.png" width="500" /></p>

After selecting Avalanche you will be asked whether you want a node on Mainnet or the Fuji Testnet. Select Fuji.

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652250226185/bPVQkxHnd.png" alt="08-select-your-avalanche-network.png" width="500" /></p>

You'll be asked if you want any of the add-ons including Archive Mode or Trace Mode. You'll then be asked for your credit card information but you will not be charged for the first seven days.

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652250296162/1i9j5398_.png" alt="09-avalanche-endpoint-on-quicknode.png" width="500" /></p>

Copy the HTTP provider URL and paste it into your `.env` file. Include `/ext/bc/C/rpc` at the very end of the URL to specify that you want to connect to the C-Chain, an instance of the Ethereum Virtual Machine that allows for creating smart contracts with the C-Chain’s API.

### Deploy Contract to Fuji

Before deploying the contract we need to first compile the contract.

```bash
yarn hardhat compile
```

Deploy the contract and include a `--network` flag to specify the Fuji test network.

```bash
yarn hardhat run scripts/deploy.js --network fuji
```

You will receive an output that looks like the following but with your own addresses:

```
Contract deployed to: 0x873E3BB2A752DBDFA06017CC5a709600Ac3c0153
Contract deployed by "<SignerWithAddress 0x6b492Ef06CA3b462f20db50EB288fAbB1E3e8Bfc>" signer
```

Go to [Snowtrace Testnet](https://testnet.snowtrace.io/) and search for your contract address.

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652250728271/wI7umL3qQ.png" alt="10-contract-on-snowtrace.png" width="500" /></p>

Include the contract address in `.env` so it can be accessed from our frontend client in the next section.

## React App

```jsx
// src/App.jsx

import { useState } from 'react'
import { ethers } from 'ethers'
import HelloWorld from './artifacts/contracts/HelloWorld.sol/HelloWorld.json'

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS

function App() {
  const [hello, setHelloValue] = useState()

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  }

  async function fetchHello() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(contractAddress, HelloWorld.abi, provider)
      try {
        const data = await contract.hello()
        setHelloValue(data)
        console.log('Greeting: ', data)
        console.log('Contract Address: ', contract.address)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  async function setHello() {
    if (!hello) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, HelloWorld.abi, signer)
      const transaction = await contract.setHello(hello)
      await transaction.wait()
      fetchHello()
    }
  }

  return (
    <div>
      <header>
        <h1>Avalanche</h1>
      </header>

      <main>
        <h3>Hello World</h3>

        <button onClick={fetchHello}>
          Click me, you know you want to
        </button>

        <input
          onChange={e => setHelloValue(e.target.value)}
          placeholder="Set hello message"
        />
        <button onClick={setHello}>
          Set hello message
        </button>

        <div>{hello}</div>
      </main>
    </div>
  )
}

export default App
```

### Start Development Server

Run the following commands to install the project's dependencies and start the development server with Vite.

```bash
yarn
yarn dev
```

Open [localhost:3000](http://localhost:3000/) to see the application. When you enter a new hello message and click the "Set hello message" button, you will be asked to confirm the transaction from your MetaMask wallet.

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652374063148/4fPNMkvJ4.png" alt="13-confirm-transaction-with-metamask.png" width="500" /></p>

After confirming the transaction, it will be pending for a few seconds. Once the transaction settles you will see the new message logged to the console.

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652374126339/kI04pabHZ.png" alt="14-new-greeting-displayed-in-the-console.png" width="500" /></p>

### Deploy to Netlify

Our hello world application is complete and we can deploy it to the internet with a service like [Netlify](https://netlify.com/) or [Vercel](https://vercel.com/). Our `netlify.toml` file contains a build command set to `yarn build` and a publish directory set to `dist`:

```toml
[build]
  publish = "dist"
  command = "yarn build"
```

Initialize a Git repository and push the project to a GitHub repo. Go to your Netlify dashboard, click "Add new site," and select the newly created repo.

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652374504739/ueqhFEwpG.png" alt="15-import-project-from-git-repository-on-netlify.png" width="500" /></p>

Your build settings will be imported from the `netlify.toml` file. The only other information you need to include is your contract address under "Advanced build settings." Lastly, click "Deploy site."

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652374636506/kcRJ0Mkor.png" alt="16-include-environment-variable-for-contract-address-on-netlify.png" width="500" /></p>

Go to "Domain settings" to give your site a custom domain. You can see this example at [ajcwebdev-avalanche.netlify.app](https://ajcwebdev-avalanche.netlify.app/).

<p align="center"><img src="https://cdn.hashnode.com/res/hashnode/image/upload/v1652374868431/DYXiMhe8J.png" alt="17-deployed-website-on-netlify.png" width="500" /></p>

## Resources

* [Avalanche Documentation](https://docs.avax.network/)
* [Avalanche Blog](https://medium.com/avalancheavax)
* [Avalanche Block Explorer](https://explorer.avax.network/)
* [Avalanche Bridge](https://docs.avascan.info/how-to-use-avascan/avalanche-bridge)
* [Twitter](https://twitter.com/avalancheavax)
* [Ecosystem](https://ecosystem.avax.network)
* [Community](https://www.avax.network/community)
* [Foundation](https://www.avax.network/)
* [Ava Labs](https://www.avalabs.org/)
* [Ava Labs GitHub](https://github.com/ava-labs)