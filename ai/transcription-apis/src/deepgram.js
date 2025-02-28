// src/deepgram.js

import fs from 'fs/promises'
import { saveResults, formatDuration, validateAudioFile } from './utils.js'

// Use Node.js native environment variable handling
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY

if (!DEEPGRAM_API_KEY) {
  console.error('Error: DEEPGRAM_API_KEY environment variable not set')
  process.exit(1)
}

/**
 * Transcribe audio using Deepgram API
 * @param {string} audioFilePath - Path to the audio file
 * @param {Object} options - Transcription options
 * @returns {Promise<Object>} Transcription results
 */
export async function transcribeWithDeepgram(audioFilePath, options = {}) {
  try {
    // Validate audio file
    const isValid = await validateAudioFile(audioFilePath)
    if (!isValid) {
      throw new Error(`File not found or not accessible: ${audioFilePath}`)
    }

    console.log(`Transcribing file: ${audioFilePath}`)
    
    // Read file as binary data
    const audioData = await fs.readFile(audioFilePath)
    
    // Set up request options with default parameters
    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/*'
      },
      body: audioData
    }
    
    // Build query parameters from options
    const queryParams = new URLSearchParams({
      model: options.model || 'nova-2',
      language: options.language || 'en',
      punctuate: options.punctuate !== false,
      diarize: options.diarize || false,
      smart_format: options.smartFormat || false,
      filler_words: options.fillerWords || false,
      utterances: options.utterances || false,
      ...options.extra
    })
    
    console.log('Sending request to Deepgram...')
    const startTime = Date.now()
    
    // Make API request
    const response = await fetch(`https://api.deepgram.com/v1/listen?${queryParams}`, requestOptions)
    
    const endTime = Date.now()
    console.log(`Response received in ${formatDuration(endTime - startTime)}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Deepgram API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error transcribing with Deepgram:', error)
    throw error
  }
}

/**
 * Extract readable transcript from Deepgram response
 * @param {Object} result - Deepgram API response
 * @returns {string} Plain text transcript
 */
export function extractDeepgramTranscript(result) {
  if (!result || !result.results || !result.results.channels || 
      !result.results.channels[0] || !result.results.channels[0].alternatives || 
      !result.results.channels[0].alternatives[0]) {
    return ''
  }
  
  return result.results.channels[0].alternatives[0].transcript
}

/**
 * Run a full Deepgram transcription example
 * @param {string} audioFile - Path to audio file
 * @param {Object} options - Transcription options
 */
export async function runDeepgramExample(audioFile, options = {}) {
  try {
    // Basic transcription
    console.log('Running basic Deepgram transcription...')
    const basicResult = await transcribeWithDeepgram(audioFile, {
      model: 'nova-2'
    })
    
    console.log('\nBasic transcription result:')
    console.log(extractDeepgramTranscript(basicResult))
    
    // Save basic results
    await saveResults(basicResult, 'deepgram-basic.json')
    
    // Enhanced transcription with features
    if (options.enhanced) {
      console.log('\nRunning enhanced Deepgram transcription...')
      const enhancedResult = await transcribeWithDeepgram(audioFile, {
        model: 'nova-2',
        smartFormat: true,
        diarize: true,
        utterances: true,
        fillerWords: false
      })
      
      console.log('\nEnhanced transcription result:')
      console.log(extractDeepgramTranscript(enhancedResult))
      
      // Save enhanced results
      await saveResults(enhancedResult, 'deepgram-enhanced.json')
    }
    
  } catch (error) {
    console.error('Deepgram example failed:', error)
    throw error
  }
}