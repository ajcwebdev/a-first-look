<script>
  export let fetchWaves
  export let CONTRACT_ADDRESS
  export let waveList
  import dayjs from 'dayjs'
  import { ethers } from 'ethers'
  import WavePortal from '../artifacts/contracts/WavePortal.sol/WavePortal.json'
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
    <!-- svelte-ignore a11y-label-has-associated-control -->
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