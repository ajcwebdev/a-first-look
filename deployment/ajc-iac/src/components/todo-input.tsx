import { createSignal, Show } from "solid-js"
import styles from "./todo-input.module.css"
import type { TodoInputProps } from "../utils/types"

export function TodoInput(props: TodoInputProps) {
  const [newTodoText, setNewTodoText] = createSignal("")

  const handleCreate = async () => {
    const text = newTodoText().trim()
    if (!text) return

    await props.onCreateTodo(text)
    setNewTodoText("")
  }

  return (
    <section class={styles.section}>
      <h2 class={styles.sectionTitle}>
        Add New Todo
      </h2>

      <div class={styles.inputGroup}>
        <input
          type="text"
          value={newTodoText()}
          onInput={(e) => setNewTodoText(e.currentTarget.value)}
          onKeyPress={(e) => e.key === "Enter" && handleCreate()}
          placeholder="What needs to be done?"
          class={styles.input}
        />
        <button
          onClick={handleCreate}
          disabled={!newTodoText().trim()}
          class={`${styles.addButton} ${newTodoText().trim() ? styles.addButtonEnabled : styles.addButtonDisabled}`}
        >
          Add
        </button>
      </div>

      <Show when={props.message()}>
        <div class={`${styles.message} ${props.message().includes("success") ? styles.messageSuccess : styles.messageError}`}>
          {props.message()}
        </div>
      </Show>
    </section>
  )
}