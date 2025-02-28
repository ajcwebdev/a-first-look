// src/assembly.js

import fs from 'fs/promises'
import { saveResults, formatDuration, validateAudioFile } from './utils.js'

// Use Node.js native environment variable handling
const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY

if (!ASSEMBLY_API_KEY) {
  console.error('Error: ASSEMBLY_API_KEY environment variable not set')
  process.exit(1)
}

/**
 * Transcribe audio using AssemblyAI API
 * @param {string} audioFilePath - Path to the audio file
 * @param {Object} options - Transcription options
 * @returns {Promise<Object>} Transcription results
 */
export async function transcribeWithAssemblyAI(audioFilePath, options = {}) {
  try {
    // Validate audio file
    const isValid = await validateAudioFile(audioFilePath)
    if (!isValid) {
      throw new Error(`File not found or not accessible: ${audioFilePath}`)
    }

    console.log(`Transcribing file: ${audioFilePath}`)
    
    // Read the file as binary data
    const audioData = await fs.readFile(audioFilePath)
    
    // Step 1: Upload the file to AssemblyAI
    console.log('Uploading file to AssemblyAI...')
    const uploadStartTime = Date.now()
    
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLY_API_KEY,
        'Content-Type': 'application/octet-stream'
      },
      body: audioData
    })
    
    const uploadEndTime = Date.now()
    console.log(`Upload completed in ${formatDuration(uploadEndTime - uploadStartTime)}`)
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      throw new Error(`AssemblyAI upload error: ${uploadResponse.status} - ${JSON.stringify(errorData)}`)
    }
    
    const uploadResult = await uploadResponse.json()
    const audioUrl = uploadResult.upload_url
    
    // Step 2: Start transcription
    console.log('Starting transcription...')
    const transcriptionOptions = {
      audio_url: audioUrl,
      language_code: options.language || 'en',
      punctuate: options.punctuate !== false,
      format_text: options.formatText !== false,
      speaker_labels: options.speakerLabels || false,
      auto_highlights: options.autoHighlights || false,
      filter_profanity: options.filterProfanity || false,
      disfluencies: options.disfluencies || false,
      ...options.extra
    }
    
    const transcribeResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transcriptionOptions)
    })
    
    if (!transcribeResponse.ok) {
      const errorData = await transcribeResponse.json()
      throw new Error(`AssemblyAI transcription error: ${transcribeResponse.status} - ${JSON.stringify(errorData)}`)
    }
    
    const transcribeResult = await transcribeResponse.json()
    const transcriptId = transcribeResult.id
    
    // Step 3: Poll for results
    console.log('Transcription started, polling for results...')
    let result
    let status = 'processing'
    
    const processingStartTime = Date.now()
    
    while (status === 'processing' || status === 'queued') {
      // Wait 2 seconds between polling
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        method: 'GET',
        headers: {
          'Authorization': ASSEMBLY_API_KEY
        }
      })
      
      if (!pollingResponse.ok) {
        const errorData = await pollingResponse.json()
        throw new Error(`AssemblyAI polling error: ${pollingResponse.status} - ${JSON.stringify(errorData)}`)
      }
      
      result = await pollingResponse.json()
      status = result.status
      
      console.log(`Transcription status: ${status}`)
    }
    
    const processingEndTime = Date.now()
    console.log(`Processing completed in ${formatDuration(processingEndTime - processingStartTime)}`)
    
    if (status === 'error') {
      throw new Error(`AssemblyAI transcription failed: ${result.error}`)
    }
    
    return result
  } catch (error) {
    console.error('Error transcribing with AssemblyAI:', error)
    throw error
  }
}

/**
 * Run a full AssemblyAI transcription example
 * @param {string} audioFile - Path to audio file
 * @param {Object} options - Transcription options
 */
export async function runAssemblyAIExample(audioFile, options = {}) {
  try {
    // Basic transcription
    console.log('Running basic AssemblyAI transcription...')
    const basicResult = await transcribeWithAssemblyAI(audioFile)
    
    console.log('\nBasic transcription result:')
    console.log(basicResult.text)
    
    // Save basic results
    await saveResults(basicResult, 'assemblyai-basic.json')
    
    // Enhanced transcription with features
    if (options.enhanced) {
      console.log('\nRunning enhanced AssemblyAI transcription...')
      const enhancedResult = await transcribeWithAssemblyAI(audioFile, {
        formatText: true,
        speakerLabels: true,
        disfluencies: false,
        autoHighlights: true
      })
      
      console.log('\nEnhanced transcription result:')
      console.log(enhancedResult.text)
      
      // Save enhanced results
      await saveResults(enhancedResult, 'assemblyai-enhanced.json')
    }
    
  } catch (error) {
    console.error('AssemblyAI example failed:', error)
    throw error
  }
}