import { useState } from 'react'
import Markdown from "react-markdown"

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch response')
      }

      const data = await response.json()
      setMessages((prevMessages) => [...prevMessages, data])
    } catch (error) {
      console.error('Error fetching AI response:', error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ])
    }
  }

  return (
    <div>
      {messages.map((m, index) => (
        <div key={index}>
          {m.role === "user" ? "User: " : "AI: "}
          <Markdown>{m.content}</Markdown>
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          placeholder="What's your question?"
          onChange={handleInputChange}
        />
      </form>
    </div>
  )
}