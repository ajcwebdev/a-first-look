// index.js

import { generateComparisonImages } from './src/combined-generator.js'
import { generateImageWithDallE } from './src/dalle-generator.js'
import { generateImageWithStabilityAI } from './src/stability-ai-generator.js'
import { generateImageWithBlackForestLabs } from './src/black-forest-labs-generator.js'

// Check which command was provided
const command = process.argv[2]
const prompt = process.argv[3] || 'A beautiful landscape with mountains and a lake at sunset'

async function main() {
  console.log('Image Generation API Tool')
  console.log('------------------------')
  
  try {
    // Validate environment variables
    if (command === 'dalle' && !process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY environment variable is missing')
      process.exit(1)
    }
    
    if (command === 'stability' && !process.env.STABILITY_API_KEY) {
      console.error('Error: STABILITY_API_KEY environment variable is missing')
      process.exit(1)
    }
    
    if (command === 'blackforest' && !process.env.BFL_API_KEY) {
      console.error('Error: BFL_API_KEY environment variable is missing')
      process.exit(1)
    }
    
    let result
    
    switch (command) {
      case 'dalle':
        console.log(`Generating DALL-E image with prompt: "${prompt}"`)
        result = await generateImageWithDallE(prompt)
        break
        
      case 'stability':
        console.log(`Generating Stability AI image with prompt: "${prompt}"`)
        result = await generateImageWithStabilityAI(prompt)
        break
        
      case 'blackforest':
        console.log(`Generating Black Forest Labs image with prompt: "${prompt}"`)
        result = await generateImageWithBlackForestLabs(prompt)
        break
        
      case 'compare':
        console.log(`Comparing all services with prompt: "${prompt}"`)
        result = await generateComparisonImages(prompt)
        break
        
      default:
        console.log('Available commands:')
        console.log('  dalle <prompt> - Generate image with DALL-E 3')
        console.log('  stability <prompt> - Generate image with Stability AI')
        console.log('  blackforest <prompt> - Generate image with Black Forest Labs')
        console.log('  compare <prompt> - Compare all three services')
        return
    }
    
    console.log('Result:')
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Fatal error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})