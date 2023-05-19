import { openai } from "./api.js"

const response = await openai.listModels()

console.log(response)