import type { APIEvent } from "@solidjs/start/server"
import { handleListTodos } from "../../../s3-client/todos-mock"
import { l } from "~/utils/logger"

export const GET = async (event: APIEvent): Promise<Response> => {
  try {
    const result = await handleListTodos()
    l.info("API: Listed todos:", { count: result.todos.length })
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    const errorResponse = { error: String(error) }
    l.error("API: List todos error:", { error, errorResponse })
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}