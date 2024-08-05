# GitHub AI Models

```bash
mkdir gh-models
cd gh-models
echo '# GitHub AI Models' > README.md
echo 'GITHUB_TOKEN=""' > .env
npm init -y
npm pkg set type="module"
npm i @azure-rest/ai-inference @azure/core-auth @azure/core-sse
```

```bash
export GITHUB_TOKEN=""
```

## Main JavaScript Function

```bash
echo > index.js
```

```js
// index.js

import ModelClient from "@azure-rest/ai-inference"
import { AzureKeyCredential } from "@azure/core-auth"

const { GITHUB_TOKEN } = process.env
const endpoint = "https://models.inference.ai.azure.com"
const modelName = "meta-llama-3.1-405b-instruct"

export async function main() {
  const client = new ModelClient(endpoint, new AzureKeyCredential(GITHUB_TOKEN))
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
```