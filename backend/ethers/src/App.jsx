import { useState } from 'react'
import { ethers } from 'ethers'
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'

const greeterAddress = import.meta.env.VITE_GREETER_ADDRESS

function App() {
  const [greeting, setGreetingValue] = useState()

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  }

  async function fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
      try {
        const data = await contract.greet()
        setGreetingValue(data)
        console.log('Greeting: ', data)
        console.log('Contract Address: ', contract.address)
        console.log('Contract Network: ', contract.provider._network.name)
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  async function setGreeting() {
    if (!greeting) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(greeting)
      await transaction.wait()
      fetchGreeting()
    }
  }

  return (
    <div>
      <header>
        <h1>Ethers.js, Hardhat, Solidity</h1>
        <h2>and React, Alchemy, and MetaMask</h2>
      </header>

      <main>
        <h3>Greeting</h3>

        <button onClick={fetchGreeting}>
          Fetch Greeting
        </button>
        <div>{greeting}</div>

        <input
          onChange={e => setGreetingValue(e.target.value)}
          placeholder="Set greeting" 
        />
        <button onClick={setGreeting}>
          Set Greeting
        </button>
      </main>
    </div>
  )
}

export default App