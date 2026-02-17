import { Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import { Suspense, createSignal } from "solid-js"
import { createAsync, action, query, revalidate, useAction } from "@solidjs/router"
import { handleListTodos, handleCreateTodo, handleUpdateTodo, handleDeleteTodo } from "./s3-client/todos-mock"
import { l } from "~/utils/logger"
import { TodoInput } from "~/components/todo-input"
import { TodoList } from "~/components/todo-list"
import styles from "./app.module.css"

const getTodos = query(async () => {
  "use server"
  return await handleListTodos()
}, "todos")

const createTodoAction = action(async (text: string) => {
  "use server"
  return await handleCreateTodo({ text })
})

const updateTodoAction = action(async (id: string, updates: { text?: string; completed?: boolean }) => {
  "use server"
  return await handleUpdateTodo(id, updates)
})

const deleteTodoAction = action(async (id: string) => {
  "use server"
  return await handleDeleteTodo(id)
})

export default function App() {
  return (
    <Router
      root={props => {
        const todos = createAsync(() => getTodos())
        const [message, setMessage] = createSignal("")

        const createTodo = useAction(createTodoAction)
        const updateTodo = useAction(updateTodoAction)
        const deleteTodo = useAction(deleteTodoAction)

        const handleCreate = async (text: string) => {
          setMessage("")

          try {
            await createTodo(text)
            setMessage("Todo created successfully!")
            revalidate(getTodos.key)
          } catch (error) {
            l.error("Create todo failed:", { error })
            setMessage(`Error: ${String(error)}`)
          }
        }

        const handleToggle = async (id: string, completed: boolean) => {
          try {
            await updateTodo(id, { completed: !completed })
            revalidate(getTodos.key)
          } catch (error) {
            l.error("Toggle todo failed:", { error })
            setMessage(`Error: ${String(error)}`)
          }
        }

        const handleUpdate = async (id: string, text: string) => {
          try {
            await updateTodo(id, { text })
            setMessage("Todo updated successfully!")
            revalidate(getTodos.key)
          } catch (error) {
            l.error("Update todo failed:", { error })
            setMessage(`Error: ${String(error)}`)
          }
        }

        const handleDelete = async (id: string) => {
          try {
            await deleteTodo(id)
            setMessage("Todo deleted successfully!")
            revalidate(getTodos.key)
          } catch (error) {
            l.error("Delete todo failed:", { error })
            setMessage(`Error: ${String(error)}`)
          }
        }

        return (
          <Suspense>
            <div class={styles.container}>
              <header class={styles.header}>
                <h1 class={styles.title}>
                  Todo List
                </h1>
                <p class={styles.subtitle}>
                  Manage your tasks efficiently
                </p>
              </header>

              <TodoInput onCreateTodo={handleCreate} message={message} />

              <TodoList 
                todos={todos} 
                onToggleTodo={handleToggle}
                onUpdateTodo={handleUpdate}
                onDeleteTodo={handleDelete}
              />
            </div>
          </Suspense>
        )
      }}
    >
      <FileRoutes />
    </Router>
  )
}