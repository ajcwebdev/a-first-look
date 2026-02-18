import type { APIEvent } from "@solidjs/start/server"
import { handleDeleteTodo } from "../../../s3-client/todos-mock"
import { l } from "~/utils/logger"

export const DELETE = async (event: APIEvent): Promise<Response> => {
  const url = new URL(event.request.url)
  const id = url.searchParams.get("id")

  if (!id) {
    const errorResponse = { error: "ID is required" }
    l.warn("Delete todo failed - missing id")
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    const result = await handleDeleteTodo(id)
    const responseBody = { success: result }
    l.info("API: Deleted todo:", { id, success: result })
    return new Response(JSON.stringify(responseBody), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    const errorResponse = { error: String(error) }
    l.error("API: Delete todo error:", { id, error, errorResponse })
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}