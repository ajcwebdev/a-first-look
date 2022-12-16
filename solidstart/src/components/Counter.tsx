import { createSignal, createEffect } from "solid-js"

export default function Counter() {
  const [count, setCount] = createSignal(0)

  createEffect(() => count())

  return (
    <>
      <button onClick={() => setCount(count() + 1)}>
        Click Me
      </button>
      <div>The count is now: {count()}</div>
    </>
  )
}