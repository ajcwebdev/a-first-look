import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
})

export async function generateEmbedding(text: string): Promise<number[]> {
  console.log(`Generating embedding for text of length ${text.length}`)
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    })
    
    if (!response.data || !response.data[0] || !response.data[0].embedding) {
      throw new Error('Embedding data is missing in the response')
    }
    return response.data[0].embedding
  } catch (error) {
    console.error('Failed to generate embedding:', error)
    throw error
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  console.log(`Generating embeddings for ${texts.length} texts`)
  
  const batchSize = 20
  const embeddings: number[][] = []
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(texts.length / batchSize)}`)
    
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: batch
      })
      
      embeddings.push(...response.data.map(d => d.embedding))
    } catch (error) {
      console.error('Failed to generate embeddings for batch:', error)
      throw error
    }
  }
  
  return embeddings
}