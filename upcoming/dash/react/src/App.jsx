import { useEffect, useState } from 'react'
import './index.css'

function App() {
  const [blockchainData, setBlockchainData] = useState()
  const [triggerFetch, setTriggerFetch] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = () => {
    setIsLoading(true) // Set loading to true when fetch begins
    fetch('http://localhost:3001/name/ajcwebdevtest')
      .then(response => response.json())
      .then(data => {
        setBlockchainData(data)
        setIsLoading(false) // Set loading to false when fetch completes
      })
  }

  useEffect(() => {
    if (triggerFetch) {
      fetchData()
      setTriggerFetch(false) // Reset trigger
    }
  }, [triggerFetch])

  return (
    <>
      <h1>Dash + React + Express</h1>
      <button onClick={() => setTriggerFetch(true)}>
        Fetch Data
      </button>
      <p className="leftCenter">
        <pre className="preLeft">
          {isLoading
            ? 'Loading...'
            : JSON.stringify(blockchainData, null, 2)
          }
        </pre>
      </p>
    </>
  )
}

export default App