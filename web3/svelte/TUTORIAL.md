## Create This Project From Scratch

If you wanted to go through the steps to create this application, enter the following:

```bash
mkdir svelte-vite-web3
cd svelte-vite-web3
pnpm init
echo > pnpm-workspace.yaml
```

```yaml
# pnpm-workspace.yaml

packages:
  - 'svelte/**'
  - 'hardhat/**'
```

```
pnpm create vite svelte --template svelte
pnpm -w svelte add -D ethers dayjs vercel
pnpm -w svelte init
echo > svelte/Waves.svelte
echo > hardhat/contracts/WavePortal.sol
echo > hardhat/scripts/deploy.js
echo > hardhat/hardhat.config.js
echo 'QUICKNODE_ROPSTEN_URL=\nPRIVATE_KEY=' > hardhat/.env
echo '.env' >> .gitignore
mkdir hardhat hardhat/contracts hardhat/scripts
pnpm -w hardhat init
pnpm -w hardhat add -D dotenv hardhat ethers @nomiclabs/hardhat-ethers
```

### Contract

```solidity
// hardhat/contracts/WavePortal.sol

// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.4;

contract WavePortal {
	struct Wave {
		string message;
		address waver;
		uint256 timestamp;
	}

	uint256 totalWaves;
	uint256 private seed;

	Wave[] public waveList;
	mapping(address => uint256) public lastWavedAt;

	event NewWave(
		string message,
		address indexed from,
		uint256 timestamp
	);

	constructor() payable {}

	function wave(string memory _message) public {
		totalWaves += 1;
		waveList.push(Wave(_message, msg.sender, block.timestamp));
		emit NewWave(_message, msg.sender, block.timestamp);
	}

	function getAllWaves() public view returns (Wave[] memory) {
		return waveList;
	}

	function getTotalWaves() public view returns (uint256) {
		return waveList.length;
	}
}
```

### Deploy Script

```js
// hardhat/scripts/deploy.js

const hre = require("hardhat")

async function main() {
  const WavePortal = await hre.ethers.getContractFactory("WavePortal")
//   const WavePortal = await ethers.getContractFactory("WavePortal")
  const wavePortal = await WavePortal.deploy()
  await wavePortal.deployed()
  console.log("WavePortal deployed to: ", wavePortal.address)
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
// hardhat/hardhat.config.js

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
```

### App Component

```html
<!-- svelte/src/App.svelte -->

<script>
  let waveList = []
  import { ethers } from 'ethers'
  import Waves from './Waves.svelte'
  import WavePortal from './artifacts/contracts/WavePortal.sol/WavePortal.json'
  import { onMount } from 'svelte'

  const CONTRACT_ADDRESS = ''

  async function getAllWaves() {
    if (!window.ethereum) {
      return
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS, WavePortal.abi, provider)
    const recievedWaves = await wavePortalContract.getAllWaves()

    if (!recievedWaves) {
      return waveList = []
    }

    const normalizeWave = (wave) => ({
      reaction: wave.reaction,
      message: wave.message,
      waver: wave.waver,
      timestamp: new Date(wave.timestamp * 1000),
    })

    waveList = recievedWaves.map(normalizeWave).sort((a, b) => b.timestamp - a.timestamp)

    console.log('waveList: ', waveList)
    return
  }
  onMount(getAllWaves)
</script>

<main>
  <div>
    <div class="header">
      <div>
        <span role="img" aria-label="Wave"> 👋 </span>
        <h1>Wave to ajcwebdev</h1>
      </div>
    </div>
  </div>

  <Waves {CONTRACT_ADDRESS} fetchWaves={getAllWaves} {waveList} />
</main>
```

### Waves Component

```html
<!-- svelte/src/Waves.svelte -->

<script>
  export let fetchWaves
  export let CONTRACT_ADDRESS
  export let waveList
  import dayjs from 'dayjs'
  import { ethers } from 'ethers'
  import WavePortal from '../../artifacts/contracts/WavePortal.sol/WavePortal.json'
  let account
  let connectWalletError = ''
  let walletConnected = false
  let message = ''
  let loading = false

  function formatDate(timestamp) {
    return dayjs(timestamp).format('MMM D, YYYY');
  }

  function formatTime(timestamp) {
    return dayjs(timestamp).format('h:mm:ss a');
  }
  
  async function sendWaveReaction(reaction, message) {
    loading = true
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const wavePortalContract = new ethers.Contract(CONTRACT_ADDRESS, WavePortal.abi, signer)
      const transaction = await wavePortalContract.wave(reaction, message, {
        gasLimit: 400000,
      })
      await transaction.wait()
      message = ''
      fetchWaves()
      loading = false
    } catch (error) {
      alert('Error while sending wave: ', error)
      loading = false
    }
  }

  async function connectWallet() {
    walletConnected = false
    console.log('Ethereum provider: ', window.ethereum)
    await ethereum.request({ method: 'eth_requestAccounts' })
      .then((accountList) => {
        const [firstAccount] = accountList
        account = firstAccount
        walletConnected = true
        console.log('Connected Wallet Address: ' + account)
      })
      .catch((error) => {
        walletConnected = false
        connectWalletError = error
        console.log(`Error ${error.code}, ${error.message}`)
      })
  }
</script>

<div class="walletButtonGroup justifyCenter">
  {#if walletConnected}
    <span>Connected Account: {account}</span>
    {:else} 
    <button
      class="button buttonMetaMask"
      on:click={connectWallet}
    >
      Connect MetaMask
    </button>
  {/if}
</div>

<div>
  <div class="textWrapper">
    <label for="message">Write your message below:</label>
    <textarea
      disabled={loading}
      id="message"
      class="textBox"
      value={message}
      on:change={(e) => (message = e.target.value)}
    />
    <section class="buttonGroup">
      <button
        disabled={loading}
        class="button buttonWave"
        on:click={() => sendWaveReaction(0, message)}
      >
      <span class="buttonEmoji" role="img" aria-label="wave"> 👋 </span>
        Wave at me
      </button>
    </section>
  </div>
</div>

<div class="waveList">
  {#if waveList}
    {#each waveList as wave (wave.timestamp)}
	  <div class="wave">
		<div class="message">{wave.message}</div>
		<div class="body">
		  <dl>
			<dt>From:</dt>
			<dd>{wave.waver}</dd>
			<dt>Time:</dt>
			<dd>{formatDate(wave.timestamp)} at {formatTime(wave.timestamp)}</dd>
		  </dl>
		</div>
	  </div>
    {/each}
  {/if}
</div>
```