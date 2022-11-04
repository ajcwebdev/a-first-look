import { Title } from "solid-start"
import { HttpStatusCode } from "solid-start/server"

export default function NotFound() {
  return (
    <main>
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />

      <h1>Page Not Found</h1>
      <p>To learn how to build SolidStart apps, visit:</p>

      <a href="https://docs.solidjs.com/start" target="_blank">
        docs.solidjs.com/start
      </a>
    </main>
  )
}