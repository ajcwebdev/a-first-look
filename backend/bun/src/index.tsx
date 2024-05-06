import { createRoot } from "react-dom/client"

function App() {
  return (
    <div className="App" role="main">
      <article className="App-article">
        <h3>Welcome to Bun!</h3>
      </article>
    </div>
  )
}

createRoot(document.getElementById("root")!)
  .render(<App />)