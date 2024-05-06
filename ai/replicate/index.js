import Replicate from 'replicate'
import dotenv from 'dotenv'
dotenv.config()

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: 'https://www.npmjs.com/package/create-replicate'
})
const model = 'openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2'
const input = {
  audio: 'https://github.com/ggerganov/whisper.cpp/raw/master/samples/jfk.wav',
  model: 'large-v3',
  translate: false,
  temperature: 0,
  transcription: 'plain text',
  suppress_tokens: '-1',
  logprob_threshold: -1,
  no_speech_threshold: 0.6,
  condition_on_previous_text: true,
  compression_ratio_threshold: 2.4,
  temperature_increment_on_fallback: 0.2,
}

console.log({ model, input })
console.log('Running...')
const output = await replicate.run(model, { input })
console.log('Done!\n', output.transcription)
