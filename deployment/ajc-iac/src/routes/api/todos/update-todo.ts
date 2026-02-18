import type { APIEvent } from "@solidjs/start/server"
import { handleUpdateTodo } from "../../../s3-client/todos-mock"
import { l } from "~/utils/logger"

export const PUT = async (event: APIEvent): Promise<Response> => {
  const url = new URL(event.request.url)
  const id = url.searchParams.get("id")

  if (!id) {
    const errorResponse = { error: "ID is required" }
    l.warn("Update todo failed - missing id")
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    const body = await event.request.json()
    const result = await handleUpdateTodo(id, body)
    
    if ("code" in result) {
      l.warn("Update todo failed - not found:", { id })
      return new Response(JSON.stringify(result), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      })
    }
    
    l.info("API: Updated todo:", { result })
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    const errorResponse = { error: String(error) }
    l.error("API: Update todo error:", { id, error, errorResponse })
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}