// index.js

import path from 'path'
import { runDeepgramExample } from './src/deepgram.js'
import { runAssemblyAIExample } from './src/assembly.js'
import { compareTranscriptionResults } from './src/compare.js'
import { validateAudioFile } from './src/utils.js'
import { runFormatter } from './src/formatter.js'

async function main() {
  // Get command line arguments
  const [,, command = 'help', audioFilePath = './sample.mp3'] = process.argv
  
  // Check if audio file exists and is accessible for relevant commands
  const needsAudioFile = ['deepgram', 'assemblyai', 'all'].includes(command)
  if (needsAudioFile) {
    const isAudioValid = await validateAudioFile(audioFilePath)
    if (!isAudioValid) {
      console.error(`Error: Audio file not found or not accessible: ${audioFilePath}`)
      console.log('Please provide a valid audio file path as the second argument.')
      process.exit(1)
    }
  }
  
  switch (command) {
    case 'deepgram':
      await runDeepgramExample(audioFilePath, { enhanced: true })
      break
      
    case 'assemblyai':
      await runAssemblyAIExample(audioFilePath, { enhanced: true })
      break
      
    case 'compare':
      // This assumes you've already run both transcription examples
      await compareTranscriptionResults()
      break
      
    case 'format':
      // Format the enhanced results to markdown
      await runFormatter()
      break
      
    case 'all':
      console.log('=== Running Deepgram Transcription ===')
      await runDeepgramExample(audioFilePath, { enhanced: true })
      
      console.log('\n=== Running AssemblyAI Transcription ===')
      await runAssemblyAIExample(audioFilePath, { enhanced: true })
      
      console.log('\n=== Comparing Results ===')
      await compareTranscriptionResults()
      
      console.log('\n=== Formatting Transcripts ===')
      await runFormatter()
      break
      
    case 'help':
    default:
      console.log(`
Audio Transcription API Examples

Usage:
  npm run start -- [command] [audioFilePath]

Commands:
  deepgram    Run Deepgram transcription example
  assemblyai  Run AssemblyAI transcription example
  compare     Compare results from both services
  format      Convert transcription JSON to markdown with timestamps
  all         Run all examples, compare results, and format transcripts
  help        Show this help message

Examples:
  npm run start -- deepgram ./podcasts/episode1.mp3
  npm run start -- assemblyai ./meetings/weekly.mp4
  npm run start -- compare
  npm run start -- format
  npm run start -- all ./interviews/candidate3.wav
      `)
      break
  }
}

main().catch(error => {
  console.error('An error occurred:', error)
  process.exit(1)
})