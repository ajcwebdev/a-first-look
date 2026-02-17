import type { Todo, TodosResponse, CreateTodoRequest, UpdateTodoRequest, TodoError } from "~/utils/types"
import { readTodos, createTodo, updateTodo, deleteTodo } from "./storage"

export const handleListTodos = async (): Promise<TodosResponse> => {
  const todos = await readTodos()
  return { todos }
}

export const handleCreateTodo = async (request: CreateTodoRequest): Promise<Todo> => {
  return await createTodo(request.text)
}

export const handleUpdateTodo = async (id: string, request: UpdateTodoRequest): Promise<Todo | TodoError> => {
  const todo = await updateTodo(id, request)
  
  if (!todo) {
    return {
      code: "NotFound",
      message: "The specified todo does not exist.",
      resource: `/todos/${id}`
    }
  }
  
  return todo
}

export const handleDeleteTodo = async (id: string): Promise<boolean> => {
  return await deleteTodo(id)
}