import { useRouteData, createRouteData } from "solid-start"
import { For } from "solid-js"

type Student = { name: string; }

export function routeData() {
  return createRouteData(async () => {
    const response = await fetch("https://hogwarts.deno.dev/students")
    return (await response.json()) as Student[]
  })
}

export default function Page() {
  const students = useRouteData<typeof routeData>()

  return (
    <>
      <header>
        <h1>Students</h1>
      </header>
      <main>
        <For each={students()}>
          {student => <li>{student.name}</li>}
        </For>
      </main>
    </>
  )
}