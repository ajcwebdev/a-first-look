// test/index.test.ts

import { greet } from '../src/index.js'

async function runTests() {
  const result = await greet('Tester')
  console.assert(result === 'Hello, Tester', 'greet function did not return the expected string')
  console.log('All tests passed!')
}

runTests()