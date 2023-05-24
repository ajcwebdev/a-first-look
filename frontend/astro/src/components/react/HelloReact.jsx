import { useState } from 'react'

export default function HelloReact({ children, count: initialCount }) {
  const [count, setCount] = useState(initialCount)
  
  const add = () => setCount((i) => i + 1)
  const subtract = () => setCount((i) => i - 1)

  return (
    <>
      <h2>{children}</h2>
      
      <div style={{display:'flex'}}>
        <button onClick={subtract}>-</button>
        <pre>{count}</pre>
        <button onClick={add}>+</button>
      </div>
    </>
  )
}