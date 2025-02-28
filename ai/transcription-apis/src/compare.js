// src/compare.js

import fs from 'fs/promises'
import path from 'path'

/**
 * Compare transcription results from both services
 */
export async function compareTranscriptionResults() {
  try {
    // Load results from both services
    const deepgramBasicFile = await fs.readFile(
      path.join('outputs', 'deepgram-basic.json'), 
      'utf8'
    )
    
    const assemblyAIBasicFile = await fs.readFile(
      path.join('outputs', 'assemblyai-basic.json'), 
      'utf8'
    )
    
    const deepgramResults = JSON.parse(deepgramBasicFile)
    const assemblyAIResults = JSON.parse(assemblyAIBasicFile)
    
    // Extract basic transcript text for comparison
    const deepgramText = deepgramResults.results.channels[0].alternatives[0].transcript
    const assemblyAIText = assemblyAIResults.text
    
    console.log('=== TRANSCRIPTION COMPARISON ===')
    console.log('\nDeepgram transcript:')
    console.log(deepgramText)
    console.log('\nAssemblyAI transcript:')
    console.log(assemblyAIText)
    
    // Compare word counts
    const deepgramWords = deepgramText.split(' ').length
    const assemblyAIWords = assemblyAIText.split(' ').length
    
    console.log('\n=== STATISTICS ===')
    console.log(`Deepgram word count: ${deepgramWords}`)
    console.log(`AssemblyAI word count: ${assemblyAIWords}`)
    
    // Try to load enhanced results if they exist
    try {
      const deepgramEnhancedFile = await fs.readFile(
        path.join('outputs', 'deepgram-enhanced.json'), 
        'utf8'
      )
      
      const assemblyAIEnhancedFile = await fs.readFile(
        path.join('outputs', 'assemblyai-enhanced.json'), 
        'utf8'
      )
      
      const deepgramEnhanced = JSON.parse(deepgramEnhancedFile)
      const assemblyAIEnhanced = JSON.parse(assemblyAIEnhancedFile)
      
      // Check if speaker diarization was used and compare
      if (deepgramEnhanced.results.channels[0].alternatives[0].words?.[0]?.speaker !== undefined &&
          assemblyAIEnhanced.speaker_labels) {
        console.log('\n=== SPEAKER DIARIZATION ===')
        console.log('Both services provided speaker labels')
        
        // Count speakers (implementation depends on response structure)
        const deepgramSpeakers = new Set()
        deepgramEnhanced.results.channels[0].alternatives[0].words.forEach(word => {
          if (word.speaker !== undefined) {
            deepgramSpeakers.add(word.speaker)
          }
        })
        
        const assemblyAISpeakers = new Set()
        assemblyAIEnhanced.utterances.forEach(utterance => {
          assemblyAISpeakers.add(utterance.speaker)
        })
        
        console.log(`Deepgram identified ${deepgramSpeakers.size} speakers`)
        console.log(`AssemblyAI identified ${assemblyAISpeakers.size} speakers`)
      }
      
      // Compare confidence scores
      const deepgramConfidence = deepgramEnhanced.results.channels[0].alternatives[0].confidence
      const assemblyAIConfidence = assemblyAIEnhanced.confidence
      
      console.log('\n=== CONFIDENCE SCORES ===')
      console.log(`Deepgram confidence: ${(deepgramConfidence * 100).toFixed(2)}%`)
      console.log(`AssemblyAI confidence: ${(assemblyAIConfidence * 100).toFixed(2)}%`)
    } catch (error) {
      console.log('\nEnhanced results not available for comparison')
    }
    
    console.log('\nAnalysis complete. See individual JSON files for detailed results.')
    
  } catch (error) {
    console.error('Error comparing results:', error)
  }
}