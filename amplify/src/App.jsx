import React from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img
          src={logo}
          className="App-logo"
          alt="logo"
        />

        <p>ajcwebdev</p>

        <p>Amplify + Vite</p>

        <p>
          <a
            className="App-link"
            href="https://dev.to/ajcwebdev"
            target="_blank"
            rel="noopener noreferrer"
          >
            Blog
          </a>

          {' | '}

          <a
            className="App-link"
            href="https://github.com/ajcwebdev"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </header>
    </div>
  )
}

export default App