import ollama from 'ollama'

export const POST = async ({ request }) => {
  try {
    const { messages } = await request.json()

    const response = await ollama.chat({
      model: "llama3.1:8b",
      messages,
    })

    const { content } = response.message

    return new Response(JSON.stringify({ role: 'assistant', content }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error processing chat request:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}