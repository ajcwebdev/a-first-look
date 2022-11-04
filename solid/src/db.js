// TODO: This is terribly broken with HMR. Should use real persistent storage.

let COUNTER = 0
let TODOS = []
const DELAY = 120

function delay(fn) {
  return new Promise((res) => setTimeout(() => res(fn()), DELAY))
}

export default {
  getTodos() {
    return delay(() => TODOS)
  },
  addTodo(title) {
    return delay(() => TODOS.push({ id: COUNTER++, title, completed: false }))
  },
  removeTodo(id) {
    return delay(() => (TODOS = TODOS.filter((todo) => todo.id !== id)))
  },
  toggleTodo(id) {
    return delay(() =>
      TODOS.forEach(
        (todo) => todo.id === id && (todo.completed = !todo.completed)
      )
    )
  },
}