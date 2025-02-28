// src/utils.js

import fs from 'fs/promises'
import path from 'path'

/**
 * Ensures that the outputs directory exists
 */
export async function ensureOutputsDir() {
  try {
    await fs.mkdir('outputs', { recursive: true })
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error
    }
  }
}

/**
 * Save transcription results to a JSON file
 * @param {Object} results - The transcription results
 * @param {string} filename - Name of the output file
 */
export async function saveResults(results, filename) {
  await ensureOutputsDir()
  await fs.writeFile(
    path.join('outputs', filename),
    JSON.stringify(results, null, 2)
  )
  console.log(`Results saved to outputs/${filename}`)
}

/**
 * Format duration in milliseconds to readable time
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted time string
 */
export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

/**
 * Simple validator for audio file paths
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<boolean>} Whether the file exists and is accessible
 */
export async function validateAudioFile(filePath) {
  try {
    const stats = await fs.stat(filePath)
    return stats.isFile()
  } catch (error) {
    return false
  }
}

/**
 * Get audio file size in MB
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<number>} File size in MB
 */
export async function getAudioFileSize(filePath) {
  const stats = await fs.stat(filePath)
  return stats.size / (1024 * 1024)
}