export type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type TodosResponse = {
  todos: Todo[]
}

export type CreateTodoRequest = {
  text: string
}

export type UpdateTodoRequest = {
  text?: string
  completed?: boolean
}

export type TodoError = {
  code: string
  message: string
  resource?: string
}

export type TodoInputProps = {
  onCreateTodo: (text: string) => Promise<void>
  message: () => string
}

export type TodoListProps = {
  todos: () => { todos: Todo[] } | undefined
  onToggleTodo: (id: string, completed: boolean) => Promise<void>
  onUpdateTodo: (id: string, text: string) => Promise<void>
  onDeleteTodo: (id: string) => Promise<void>
}

export type LogLevel = "info" | "warn" | "error" | "debug"