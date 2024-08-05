// index.js

import ModelClient from "@azure-rest/ai-inference"
import { AzureKeyCredential } from "@azure/core-auth"

// const { GITHUB_TOKEN } = process.env
const endpoint = "https://models.inference.ai.azure.com"
const modelName = "meta-llama-3.1-70b-instruct"
const token = process.env.GITHUB_TOKEN

export async function main() {
  const client = new ModelClient(endpoint, new AzureKeyCredential(token))
  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role:"system", content: "You are a helpful assistant." },
        { role:"user", content: "What is the capital of a country that's not France?" }
      ],
      model: modelName,
      temperature: 1.,
      max_tokens: 1000,
      top_p: 1.
    }
  })

  if (response.status !== "200") {
    throw response.body.error
  }
  console.log(response.body.choices[0].message.content)
}

main()
  .catch((err) => {
    console.error("The sample encountered an error:", err)
  })