import type { APIEvent } from "@solidjs/start/server"
import { handleCreateTodo } from "../../../s3-client/todos-mock"
import { l } from "~/utils/logger"

export const POST = async (event: APIEvent): Promise<Response> => {
  const url = new URL(event.request.url)

  try {
    const body = await event.request.json()
    
    if (!body.text) {
      const errorResponse = { error: "Text is required" }
      l.warn("Create todo failed - missing text:", { body })
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }
    
    const result = await handleCreateTodo({ text: body.text })
    l.info("API: Created todo:", { result })
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    const errorResponse = { error: String(error) }
    l.error("API: Create todo error:", { error, errorResponse })
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}