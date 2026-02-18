import { s3 } from "bun"
import { l } from "~/utils/logger"

const hasS3Credentials = (): boolean => {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
  const bucket = process.env.S3_BUCKET || process.env.AWS_BUCKET
  
  return !!(accessKeyId && secretAccessKey && bucket)
}

const useS3 = hasS3Credentials()
const storageType = useS3 ? "S3" : "Local Filesystem"
const STORAGE_PATH = process.env.STORAGE_PATH || "/app/storage"
const TODOS_FILE = useS3 ? "todos.json" : `${STORAGE_PATH}/todos.json`

l.info(`Storage backend: ${storageType}`)

const getFile = (path: string) => {
  return useS3 ? s3.file(path) : Bun.file(path)
}

export const ensureStorageExists = async (): Promise<void> => {
  try {
    if (!useS3) {
      await Bun.write(`${STORAGE_PATH}/.keep`, "")
    }
    
    const file = getFile(TODOS_FILE)
    const exists = await file.exists()
    
    if (!exists) {
      if (useS3) {
        await file.write(JSON.stringify([]))
      } else {
        await Bun.write(TODOS_FILE, JSON.stringify([]))
      }
    }
  } catch (error) {
    l.error(`Error ensuring storage exists (${storageType}):`, error)
    throw error
  }
}

export const readTodos = async (): Promise<any[]> => {
  try {
    await ensureStorageExists()
    const file = getFile(TODOS_FILE)
    const content = await file.text()
    return JSON.parse(content)
  } catch (error) {
    l.error(`Error reading todos from ${storageType}:`, error)
    return []
  }
}

export const writeTodos = async (todos: any[]): Promise<void> => {
  try {
    await ensureStorageExists()
    const content = JSON.stringify(todos, null, 2)
    
    if (useS3) {
      const file = getFile(TODOS_FILE)
      await file.write(content, {
        type: "application/json"
      })
    } else {
      await Bun.write(TODOS_FILE, content)
    }
  } catch (error) {
    l.error(`Error writing todos to ${storageType}:`, error)
    throw error
  }
}

export const createTodo = async (text: string): Promise<any> => {
  try {
    const todos = await readTodos()
    const newTodo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    todos.push(newTodo)
    await writeTodos(todos)
    l.info(`Created todo:`, { id: newTodo.id, text })
    return newTodo
  } catch (error) {
    l.error(`Error creating todo in ${storageType}:`, error)
    throw error
  }
}

export const updateTodo = async (id: string, updates: any): Promise<any | null> => {
  try {
    const todos = await readTodos()
    const index = todos.findIndex(todo => todo.id === id)
    
    if (index === -1) {
      l.warn(`Todo not found:`, { id })
      return null
    }

    todos[index] = {
      ...todos[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await writeTodos(todos)
    l.info(`Updated todo:`, { id, updates })
    return todos[index]
  } catch (error) {
    l.error(`Error updating todo in ${storageType}:`, error)
    throw error
  }
}

export const deleteTodo = async (id: string): Promise<boolean> => {
  try {
    const todos = await readTodos()
    const initialLength = todos.length
    const filtered = todos.filter(todo => todo.id !== id)
    
    if (filtered.length === initialLength) {
      l.warn(`Todo not found:`, { id })
      return false
    }

    await writeTodos(filtered)
    l.info(`Deleted todo:`, { id })
    return true
  } catch (error) {
    l.error(`Error deleting todo from ${storageType}:`, error)
    throw error
  }
}