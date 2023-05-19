# Taking Astro to the Moon

Example Astro project with a smart contract deployed to Avalanche's Fuji Testnet with Hardhat, Ethers, and QuickNode

## Instructions to Create Project from Scratch

```bash
mkdir taking-astro-to-the-moon
cd taking-astro-to-the-moon
yarn init -y
```

### Install Astro Dependency

```bash
yarn add -D astro dotenv hardhat ethers @nomiclabs/hardhat-ethers
```

### Configure Astro Project for React

```bash
yarn astro add react
```

### Create gitignore file

```bash
echo 'node_modules\ndist\n.DS_Store\n.env' > .gitignore
```

### Create directories and files

```bash
mkdir contracts scripts src src/pages
echo > contracts/HelloWorld.sol
echo > scripts/deploy.js
echo > hardhat.config.js
echo > src/pages/index.astro
echo > src/HelloReact.jsx
```

### Create .env file to hold environment variables for endpoint URL, private key, and contract address

```bash
echo 'QUICKNODE_URL=\nPRIVATE_KEY=' > .env
```

### Add CLI Commands to package.json

```json
{
  "name": "taking-astro-to-the-moon",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "devDependencies": {
    "@nomiclabs/hardhat-ethers": "^2.0.6",
    "astro": "^1.0.0-beta.33",
    "dotenv": "^16.0.1",
    "ethers": "^5.6.8",
    "hardhat": "^2.9.6"
  },
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

## Deploy Smart Contract

### Create Hello World Solidity Contract

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

### Create Deployment Script

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

## Deploy Avalanche on QuickNode

Create an account on QuickNode and spin up an Avalanche Fuji endpoint. Copy the HTTP provider URL and paste it into your `.env` file. Include `/ext/bc/C/rpc` at the very end of the URL to specify that you want to connect to the C-Chain, an instance of the Ethereum Virtual Machine that allows for creating smart contracts with the C-Chain’s API.

### Deploy Contract to Fuji

Compile the contract.

```bash
yarn hardhat compile
```

Deploy the contract and include a `--network` flag to specify the Fuji test network.

```bash
yarn hardhat run scripts/deploy.js --network fuji
```

Go to [Snowtrace Testnet](https://testnet.snowtrace.io/) and search for your contract address.

### Create a Page

```html
---
// src/pages/index.astro

let title = 'Taking Astro to the Moon'
---

<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">

    <title>{title}</title>
  </head>
  
  <body>
    <main>
      <header>
        <div>
          <h1>Taking Astro to the Moon</h1>
        </div>

        <p>Woot!</p>
      </header>
    </main>
  </body>
</html>
```

### Add Styling

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">

  <title>{title}</title>
</head>
```

### Start Development Server

```bash
yarn dev
```

Open [localhost:3000](https://localhost:3000) to see the home page.

### Create a React Component

```jsx
// src/HelloReact.jsx

import { useState } from 'react'
import { ethers } from 'ethers'
import HelloWorld from './artifacts/contracts/HelloWorld.sol/HelloWorld.json'

const contractAddress = ''

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

  return (
    <div>
      <main>
        <h3>Hello World</h3>

        <button onClick={fetchHello}>
          Click me, you know you want to
        </button>

        <div>{hello}</div>
      </main>
    </div>
  )
}

export default App
```

Import the `HelloReact` component into `index.astro`.

```html
---
// src/pages/index.astro

import HelloReact from '../HelloReact.jsx'

let title = 'Taking Astro to the Moon'
---

<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">

    <title>{title}</title>
  </head>
  
  <body>
    <main>
      <header>
        <div>
          <h1>Taking Astro to the Moon</h1>
        </div>

        <p>Woot!</p>
        
        <HelloReact client:visible>
          Moooooooon
        </HelloReact>
      </header>
    </main>
  </body>
</html>
```

### Start Development Server

```bash
yarn dev
```

Open [localhost:3000](http://localhost:3000/) to see the application.

![06-avalanche-react-app.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1652250986929/LSoVjcXYG.png)

First, connect your wallet and then click the button.

![07-click-button-for-hello-message.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1652251014085/DG4d4zj83.png)

The message is displayed on the screen and logged to the console. Return to `HelloReact.jsx` and add the following after `fetchHello` but before the return statement begins:

```jsx
// src/HelloReact.jsx

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
```

Include the following in the return statement below `fetchHello` button:

```jsx
// src/HelloReact.jsx

<input
  onChange={e => setHelloValue(e.target.value)}
  placeholder="Set hello message"
/>
<button onClick={setHello}>
  Set hello message
</button>
```

## Deploy to Netlify

```bash
echo > netlify.toml
```

Add the following instructions to the `netlify.toml` file:

```toml
[build]
  command = "yarn build"
  publish = "dist"
```

### Create GitHub Repository

```bash
git init
git add .
git commit -m "to the moooooooooon"
gh repo create taking-astro-to-the-moon --public --push \
  --source=. \
  --description="Example Astro project with a smart contract deployed to Avalanche's Fuji Testnet with Hardhat, Ethers, and QuickNode" \
  --remote=upstream
```
