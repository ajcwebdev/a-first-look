import { createSignal, onMount, For } from "solid-js"

export default function Users() {
  const [users, setUsers] = createSignal([])

  onMount(async () => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/users?_limit=5`)
    setUsers(await res.json())
  })

  return (
    <>
      <For
        each={users()}
        fallback={<p>Loading...</p>}
      >
        {user => <div>{user.name}</div>}
      </For>
    </>
  )
}