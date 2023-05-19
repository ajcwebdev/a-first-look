<script>
  let waveList = []
  import { ethers } from 'ethers'
  import Waves from './components/Waves.svelte'
  import WavePortal from './artifacts/contracts/WavePortal.sol/WavePortal.json'
  import { onMount } from 'svelte'

  const CONTRACT_ADDRESS = '0xe4Ce19e118f1B79b522fb64582004475794360F2'

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

    waveList = recievedWaves
      .map(normalizeWave)
      .sort((a, b) => b.timestamp - a.timestamp)

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