// src/formatter.js

import fs from 'fs/promises'
import path from 'path'
import { ensureOutputsDir, formatDuration } from './utils.js'

/**
 * Convert seconds to timestamp format (HH:MM:SS)
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format Deepgram JSON into markdown with timestamps
 * @param {Object} data - Deepgram enhanced JSON data
 * @returns {string} Markdown formatted transcript
 */
function formatDeepgramToMarkdown(data) {
  let markdown = '# Transcript\n\n'
  
  // Get paragraphs if available, otherwise use full transcript
  const paragraphs = data.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.paragraphs
  
  if (paragraphs && paragraphs.length > 0) {
    // Process paragraph by paragraph with speaker info if available
    paragraphs.forEach(paragraph => {
      const startTime = paragraph.start
      const speaker = paragraph.speaker !== undefined ? `**Speaker ${paragraph.speaker}:** ` : ''
      
      markdown += `## [${formatTimestamp(startTime)}]\n\n${speaker}${paragraph.text}\n\n`
    })
  } else {
    // If paragraphs aren't available, try to use utterances
    const utterances = data.results?.utterances
    
    if (utterances && utterances.length > 0) {
      utterances.forEach(utterance => {
        const startTime = utterance.start
        const speaker = utterance.speaker !== undefined ? `**Speaker ${utterance.speaker}:** ` : ''
        
        markdown += `## [${formatTimestamp(startTime)}]\n\n${speaker}${utterance.transcript}\n\n`
      })
    } else {
      // If neither paragraphs nor utterances are available, use sentences
      // Extract sentences from the transcript (rough estimation)
      const fullTranscript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
      const words = data.results?.channels?.[0]?.alternatives?.[0]?.words || []
      
      // Group words into sentences (roughly by looking for periods, question marks, etc.)
      let currentSentence = []
      let sentences = []
      
      words.forEach(word => {
        currentSentence.push(word)
        
        // Check if word ends with sentence-ending punctuation
        if (word.word.match(/[.!?]$/)) {
          sentences.push(currentSentence)
          currentSentence = []
        }
      })
      
      // Add any remaining words as the last sentence
      if (currentSentence.length > 0) {
        sentences.push(currentSentence)
      }
      
      // Format sentences with timestamps
      sentences.forEach(sentence => {
        if (sentence.length > 0) {
          const startTime = sentence[0].start
          const speakerInfo = sentence[0].speaker !== undefined ? 
            `**Speaker ${sentence[0].speaker}:** ` : ''
          
          const text = sentence.map(word => word.word).join(' ')
          markdown += `## [${formatTimestamp(startTime)}]\n\n${speakerInfo}${text}\n\n`
        }
      })
    }
  }
  
  return markdown
}

/**
 * Format AssemblyAI JSON into markdown with timestamps
 * @param {Object} data - AssemblyAI enhanced JSON data
 * @returns {string} Markdown formatted transcript
 */
function formatAssemblyAIToMarkdown(data) {
  let markdown = '# Transcript\n\n'
  
  // Check if we have paragraphs
  if (data.paragraphs && data.paragraphs.length > 0) {
    data.paragraphs.forEach(paragraph => {
      const startTime = paragraph.start / 1000 // Convert from milliseconds to seconds
      const speakerInfo = ''  // AssemblyAI doesn't provide speaker info at paragraph level
      
      markdown += `## [${formatTimestamp(startTime)}]\n\n${speakerInfo}${paragraph.text}\n\n`
    })
  } else if (data.utterances && data.utterances.length > 0) {
    // If we have utterances (with speaker information)
    data.utterances.forEach(utterance => {
      const startTime = utterance.start / 1000 // Convert from milliseconds to seconds
      const speakerInfo = `**Speaker ${utterance.speaker}:** `
      
      markdown += `## [${formatTimestamp(startTime)}]\n\n${speakerInfo}${utterance.text}\n\n`
    })
  } else if (data.words && data.words.length > 0) {
    // If we only have words, group them into sentences
    let currentSentence = []
    let sentences = []
    let currentSpeaker = null
    
    data.words.forEach(word => {
      // Check if speaker changed
      if (word.speaker !== undefined && word.speaker !== currentSpeaker) {
        // End current sentence if we have a speaker change
        if (currentSentence.length > 0) {
          sentences.push(currentSentence)
          currentSentence = []
        }
        currentSpeaker = word.speaker
      }
      
      currentSentence.push(word)
      
      // Check if word ends with sentence-ending punctuation
      if (word.text.match(/[.!?]$/)) {
        sentences.push(currentSentence)
        currentSentence = []
      }
    })
    
    // Add any remaining words as the last sentence
    if (currentSentence.length > 0) {
      sentences.push(currentSentence)
    }
    
    // Format sentences with timestamps
    sentences.forEach(sentence => {
      if (sentence.length > 0) {
        const startTime = sentence[0].start / 1000
        const speakerInfo = sentence[0].speaker !== undefined ? 
          `**Speaker ${sentence[0].speaker}:** ` : ''
        
        const text = sentence.map(word => word.text).join(' ')
        markdown += `## [${formatTimestamp(startTime)}]\n\n${speakerInfo}${text}\n\n`
      }
    })
  } else {
    // Fallback to sentences
    const sentences = data.text.split(/(?<=[.!?])\s+/)
    let position = 0
    
    sentences.forEach(sentence => {
      // We don't have exact timestamps for each sentence in this fallback
      // So we make an estimation based on average speaking rate
      const startTime = position / 15  // Rough estimate: 15 characters per second
      position += sentence.length
      
      markdown += `## [${formatTimestamp(startTime)}]\n\n${sentence}\n\n`
    })
  }
  
  return markdown
}

/**
 * Create a markdown transcript from either Deepgram or AssemblyAI enhanced JSON
 * @param {string} jsonFilePath - Path to the JSON file
 * @param {string} service - Either 'deepgram' or 'assemblyai'
 * @returns {Promise<string>} Path to the created markdown file
 */
export async function createMarkdownTranscript(jsonFilePath, service) {
  try {
    console.log(`Creating markdown transcript from ${jsonFilePath}...`)
    
    // Read and parse the JSON file
    const jsonData = JSON.parse(await fs.readFile(jsonFilePath, 'utf8'))
    
    // Format based on the service
    let markdown
    if (service === 'deepgram') {
      markdown = formatDeepgramToMarkdown(jsonData)
    } else if (service === 'assemblyai') {
      markdown = formatAssemblyAIToMarkdown(jsonData)
    } else {
      throw new Error(`Unsupported service: ${service}`)
    }
    
    // Create the output filename
    const baseName = path.basename(jsonFilePath, '.json')
    const outputFile = path.join('outputs', `${baseName}-transcript.md`)
    
    // Ensure the outputs directory exists
    await ensureOutputsDir()
    
    // Write the markdown file
    await fs.writeFile(outputFile, markdown)
    
    console.log(`Markdown transcript created successfully: ${outputFile}`)
    return outputFile
  } catch (error) {
    console.error('Error creating markdown transcript:', error)
    throw error
  }
}

/**
 * Create a combined transcript from both services
 * @param {string} deepgramFile - Path to Deepgram JSON
 * @param {string} assemblyAIFile - Path to AssemblyAI JSON
 * @returns {Promise<string>} Path to the created markdown file
 */
export async function createCombinedTranscript(deepgramFile, assemblyAIFile) {
  try {
    console.log('Creating combined transcript...')
    
    // Process both files
    const deepgramData = JSON.parse(await fs.readFile(deepgramFile, 'utf8'))
    const assemblyAIData = JSON.parse(await fs.readFile(assemblyAIFile, 'utf8'))
    
    // Get the transcripts
    const deepgramMd = formatDeepgramToMarkdown(deepgramData)
    const assemblyAIMd = formatAssemblyAIToMarkdown(assemblyAIData)
    
    // Combine them with headers
    const combinedMd = `# Combined Transcripts\n\n` +
      `This file contains transcripts from both Deepgram and AssemblyAI for comparison.\n\n` +
      
      `# Deepgram Transcript\n\n${deepgramMd.replace('# Transcript\n\n', '')}\n\n` +
      `# AssemblyAI Transcript\n\n${assemblyAIMd.replace('# Transcript\n\n', '')}`
    
    // Create the output filename
    const outputFile = path.join('outputs', `combined-transcript.md`)
    
    // Ensure the outputs directory exists
    await ensureOutputsDir()
    
    // Write the markdown file
    await fs.writeFile(outputFile, combinedMd)
    
    console.log(`Combined transcript created successfully: ${outputFile}`)
    return outputFile
  } catch (error) {
    console.error('Error creating combined transcript:', error)
    throw error
  }
}

/**
 * Main function to run the formatter
 */
export async function runFormatter(options = {}) {
  try {
    const deepgramFile = options.deepgramFile || path.join('outputs', 'deepgram-enhanced.json')
    const assemblyAIFile = options.assemblyAIFile || path.join('outputs', 'assemblyai-enhanced.json')
    
    // Check which files exist
    const deepgramExists = await fileExists(deepgramFile)
    const assemblyAIExists = await fileExists(assemblyAIFile)
    
    if (!deepgramExists && !assemblyAIExists) {
      console.error('Error: No enhanced JSON files found. Please run the transcription examples first.')
      return
    }
    
    // Create individual transcripts for files that exist
    if (deepgramExists) {
      await createMarkdownTranscript(deepgramFile, 'deepgram')
    }
    
    if (assemblyAIExists) {
      await createMarkdownTranscript(assemblyAIFile, 'assemblyai')
    }
    
    // Create combined transcript if both files exist
    if (deepgramExists && assemblyAIExists) {
      await createCombinedTranscript(deepgramFile, assemblyAIFile)
    }
    
    console.log('Transcript formatting complete!')
  } catch (error) {
    console.error('Error running formatter:', error)
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} Whether the file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}