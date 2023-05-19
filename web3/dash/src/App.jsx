import { useEffect, useState } from 'react'
import './index.css'

function App() {
  const [blockchainData, setBlockchainData] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3001/name/ajcwebdevtest')
    // fetch('http://localhost:3000/api/name/ajcwebdevtest')
      .then(response => response.json())
      .then(data => setBlockchainData(data))
  }, [])

  return (
    <>
      <h1>Dash + React + Express</h1>
      <p className="leftCenter">
        <pre className="preLeft">{JSON.stringify(blockchainData, null, 2) }</pre>
      </p>
    </>
  )
}

export default App