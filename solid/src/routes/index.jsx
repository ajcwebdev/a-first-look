import Counter from "../components/Counter"
import Users from "../components/Users"

export default function App() {
  return (
    <div class="App">
      <header class="header">
        <h1>A First Look at Solid</h1>
        <a
          class="link"
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>

        <Counter />
        <Users />
      </header>
    </div>
  )
}