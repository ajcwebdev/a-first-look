import { For, Show } from "solid-js"
import { useLocation, useRouteData } from "solid-start"
import { createServerAction$, createServerData$, createServerMultiAction$, redirect } from "solid-start/server"
import db from "~/db"

export const routeData = () => createServerData$(db.getTodos, { initialValue: [] })

export default function Home() {
  const todos = useRouteData()
  const location = useLocation()

  const [addingTodo, addTodo] = createServerMultiAction$(addTodoFn)
  const [removingTodo, removeTodo] = createServerMultiAction$(removeTodoFn)

  const filterList = (todos) => {
    if (location.query.show === "active") return todos.filter(todo => !todo.completed)
    else if (location.query.show === "completed") return todos.filter(todo => todo.completed)
    else return todos
  }

  let inputRef
  return (
    <section class="todoapp">
      <header>
        <h1>todos</h1>
        <addTodo.Form onSubmit={e => {
          if (!inputRef.value.trim()) e.preventDefault()
          setTimeout(() => (inputRef.value = ""))
        }}>
          <input
            name="title"
            class="new-todo"
            placeholder="What needs to be done?"
            ref={inputRef}
            autofocus
          />
        </addTodo.Form>
      </header>

      <main>
        <ul>
          <For each={filterList(todos())}>
            {todo => {
              const [togglingTodo, toggleTodo] = createServerAction$(toggleTodoFn)
              const title = () => todo.title
              const pending = () => togglingTodo.pending
              const completed = () => togglingTodo.pending
                ? !togglingTodo.input.get("completed")
                : todo.completed
              const removing = () => removingTodo.some(data => +data.input.get("id") === todo.id)

              return (
                <Show when={!removing()}>
                  <li
                    classList={{
                      completed: completed(),
                      pending: pending()
                    }}
                  >
                    <div>
                      <toggleTodo.Form>
                        <input type="hidden" name="id" value={todo.id} />
                        <button type="submit" class="toggle" disabled={pending()}>
                          {completed() ? "✅" : "⚪️"}
                        </button>
                      </toggleTodo.Form>
                      <label>{title()}</label>
                      <removeTodo.Form>
                        <input type="hidden" name="id" value={todo.id} />
                        <button type="submit" class="destroy" />
                      </removeTodo.Form>
                    </div>
                  </li>
                </Show>
              )
            }}
          </For>
          <For each={addingTodo}>
            {sub => (
              <li class="todo pending">
                <label>{sub.input.get("title")}</label>
                <button disabled class="destroy" />
              </li>
            )}
          </For>
        </ul>
      </main>
    </section>
  )
}

async function addTodoFn(form) {
  await db.addTodo(form.get("title"))
  return redirect("/todos")
}
async function removeTodoFn(form) {
  await db.removeTodo(Number(form.get("id")))
  return redirect("/todos")
}
async function toggleTodoFn(form) {
  await db.toggleTodo(Number(form.get("id")))
  return redirect("/todos")
}