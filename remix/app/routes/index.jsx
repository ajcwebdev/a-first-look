import { useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/node"

export let loader = () => {
  let data = {
    resources: [
      { name: "My Blog", url: "https://ajcwebdev.com" },
      { name: "A First Look at Remix", url: "https://ajcwebdev.com/a-first-look-at-remix" },
      { name: "Example Repo", url: "https://github.com/ajcwebdev/ajcwebdev-remix" }
    ]
  }
  return json(data)
}

export let meta = () => {
  return {
    title: "ajcwebdev-remix", description: "Welcome to Remix!"
  }
}

export default function Index() {
  let data = useLoaderData()

  return (
    <div className="remix__page">
      <main>
        <h1>ajcwebdev-remix</h1>
        <p>Woot!</p>
      </main>

      <section>        
        <h2>Resources</h2>
        <ul>
          {data.resources.map(resource => (
            <li key={resource.url}>
              <a href={resource.url}>{resource.name}</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}