import { createSignal, For, Show } from "solid-js"
import type { Todo, TodoListProps } from "~/utils/types"
import styles from "./todo-list.module.css"

export function TodoList(props: TodoListProps) {
  const [editingId, setEditingId] = createSignal<string | null>(null)
  const [editText, setEditText] = createSignal("")

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const handleUpdate = async (id: string) => {
    const text = editText().trim()
    if (!text) return

    await props.onUpdateTodo(id, text)
    setEditingId(null)
    setEditText("")
  }

  return (
    <section class={styles.todosSection}>
      <h2 class={styles.todosSectionTitle}>
        Your Todos
      </h2>

      <Show
        when={props.todos()?.todos && props.todos()!.todos.length > 0}
        fallback={
          <div class={styles.emptyState}>
            No todos yet. Add one above to get started!
          </div>
        }
      >
        <div class={styles.todoList}>
          <For each={props.todos()?.todos}>
            {(todo: Todo) => (
              <div class={`${styles.todoItem} ${todo.completed ? styles.todoItemCompleted : styles.todoItemActive}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => props.onToggleTodo(todo.id, todo.completed)}
                  class={styles.checkbox}
                />

                <Show
                  when={editingId() === todo.id}
                  fallback={
                    <div class={`${styles.todoText} ${todo.completed ? styles.todoTextCompleted : styles.todoTextActive}`}>
                      {todo.text}
                    </div>
                  }
                >
                  <input
                    type="text"
                    value={editText()}
                    onInput={(e) => setEditText(e.currentTarget.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleUpdate(todo.id)}
                    class={styles.editInput}
                  />
                </Show>

                <div class={styles.buttonGroup}>
                  <Show
                    when={editingId() === todo.id}
                    fallback={
                      <button
                        onClick={() => startEdit(todo)}
                        class={`${styles.button} ${styles.editButton}`}
                      >
                        Edit
                      </button>
                    }
                  >
                    <>
                      <button
                        onClick={() => handleUpdate(todo.id)}
                        class={`${styles.button} ${styles.saveButton}`}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        class={`${styles.button} ${styles.cancelButton}`}
                      >
                        Cancel
                      </button>
                    </>
                  </Show>

                  <button
                    onClick={() => props.onDeleteTodo(todo.id)}
                    class={`${styles.button} ${styles.deleteButton}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </section>
  )
}