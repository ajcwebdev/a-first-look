## Root Level Configuration Files

```json
{
  "name": "action-agents",
  "description": "",
  "author": "Anthony Campolo",
  "type": "module",
  "scripts": {
    "review": "tsx --env-file=.env src/index.ts"
  },
  "dependencies": {
    "@ai-sdk/openai": "1.3.4",
    "ai": "4.2.8",
    "react": "19.1.0",
    "zod": "3.24.2"
  },
  "devDependencies": {
    "@types/node": "22.13.14",
    "tsx": "4.19.3",
    "typescript": "5.8.2"
  }
}
```

```json
{
  // TypeScript compiler configuration to target Node.js 22 ESM
  "compilerOptions": {
    "target": "ESNext", // Use latest ECMAScript features
    "module": "NodeNext", // ESM modules for Node
    "moduleResolution": "NodeNext",
    "outDir": "dist", // Emit compiled files into this folder
    "rootDir": "src", // Base directory for our input TypeScript
    "esModuleInterop": true, // Smooth import of CommonJS modules
    "skipLibCheck": true, // Do not check .d.ts files in node_modules
    "allowImportingTsExtensions": true, // Allow importing .ts files
    "noEmit": true, // Disable emitting output files
  },
  "include": [
    "src/**/*"
  ]
}
```

## Action Workflow

copy .github/workflows/review.yml

```yml
# .github/workflows/review.yml
# GitHub Actions workflow checks out code, sets up Node, installs dependencies,
# builds the project, runs an AI review script, and saves the log using artifacts.

name: Code Review Pipeline

on:
  push:
    branches:
      - '**'

jobs:
  commit-review:
    runs-on: ubuntu-latest
    env:
      ACTIONS_STEP_DEBUG: true
    steps:
      - name: Checkout the repository
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Print environment variables
        run: |
          echo "VERBOSE: Dumping environment variables"
          env

      - name: Run AI Review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
          GH_OWNER: ${{ secrets.GH_OWNER }}
          GH_REPO: ${{ secrets.GH_REPO }}
        run: |
          npx tsx src/index.ts 2>&1 | tee ai-review.log

      - name: Upload AI Review log
        uses: actions/upload-artifact@v4
        with:
          name: ai-review.log
          path: ai-review.log

      - name: Download AI Review log
        uses: actions/download-artifact@v4
        with:
          name: ai-review.log
          path: downloaded-ai-review-log
```

## Index Entry File

copy src/index.ts

```ts
// src/index.ts

/**
 * Main entry point for the AI commit review agent
 */
import { env } from 'node:process'
import { resolveCommits } from './commit-parser.ts'
import { generateCommitReview } from './ai-review.ts'

/**
 * Configuration module for the AI commit review agent
 * Manages environment variables and validation
 */
export const config = {
  github: {
    owner: env.GH_OWNER,
    repo: env.GH_REPO,
    token: env.GH_TOKEN
  }
}

/**
 * Validates that all required configuration is present
 * @throws Error if any required config is missing
 */
export function validateConfig() {
  if (!config.github.owner) {
    throw new Error('Environment variable GH_OWNER is not set.')
  }
  if (!config.github.repo) {
    throw new Error('Environment variable GH_REPO is not set.')
  }
  if (!config.github.token) {
    throw new Error('Environment variable GH_TOKEN is not set.')
  }
}

/**
 * Main function that runs the commit review process
 */
async function runCommitReview() {
  try {
    console.log('VERBOSE: Starting runCommitReview()...')
    // Validate environment configuration
    validateConfig()
    console.log('VERBOSE: Configuration validated successfully')
    
    // Get the commits to review
    const commitsToReview = await resolveCommits()
    console.log('VERBOSE: Commits to review:', commitsToReview)
    
    console.log('=== AI Commit-by-Commit Review ===')
    
    // Generate and log reviews for each commit
    for (const sha of commitsToReview) {
      const reviewText = await generateCommitReview(sha)
      
      console.log(`--- Review for commit ${sha} ---`)
      console.log(reviewText)
      console.log('---------------------------------')
    }
    
    console.log('=================================')
  } catch (error) {
    console.error('Error running commit-by-commit review agent:', error)
    process.exit(1)
  }
}

// Execute the commit review process
runCommitReview()
```

## AI Review

copy src/ai-review.ts

```ts
// src/ai-review.ts

/**
 * AI review generator module
 */
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { fetchCommitDiff } from './github-tools.ts'
import { config } from './index.ts'

/**
 * Generates an AI review for a single commit
 * @param sha - The commit SHA to review
 * @returns Promise<string> The AI-generated review
 */
export async function generateCommitReview(sha: string): Promise<string> {
  console.log('VERBOSE: generateCommitReview called with sha:', sha)
  console.log('VERBOSE: Current config:', config)
  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: `You are an AI assistant that reviews code changes in a commit.
    - Summarize key modifications.
    - Flag potential security issues or code smells.
    - Suggest best practices or improvements where relevant.
    - Be concise but thorough in your review.`,
    prompt: `
    The commit to analyze is ${sha} in the ${config.github.owner}/${config.github.repo} repository.
    If you need the diff, call the "fetchCommitDiff" tool with:
    {
      "owner": "${config.github.owner}",
      "repo": "${config.github.repo}",
      "sha": "${sha}"
    }.
    `,
    tools: {
      fetchCommitDiff
    },
    maxSteps: 2
  })
  console.log('VERBOSE: AI review generation complete. Received text:', text)
  return text
}
```

## Commit Parser

copy src/commit-parser.ts

```ts
// src/commit-parser.ts

import { env } from 'node:process'
import { fetchCompareCommits } from './github-tools.ts'

/**
 * Commit range and SHA parser for the AI agent
 * Resolves the commit range into an array of commit SHAs
 * @returns Promise<string[]> Array of commit SHAs to analyze
 */
export async function resolveCommits(): Promise<string[]> {
  console.log('VERBOSE: Starting resolveCommits()...')
  let commitRange = env.GITHUB_COMMIT_RANGE
  let commitsToReview: string[] = []

  console.log('DEBUG: GITHUB_COMMIT_RANGE:', env.GITHUB_COMMIT_RANGE)
  console.log('DEBUG: GITHUB_SHA:', env.GITHUB_SHA)

  // Convert a two-dot commit range (..) to triple-dot (...) for GitHub's compare endpoint
  if (commitRange && commitRange.includes('..') && !commitRange.includes('...')) {
    commitRange = commitRange.replace('..', '...')
    console.log(`DEBUG: Replaced two-dot with three-dot in commit range => ${commitRange}`)
  }

  // If we have a commit range containing '...', use the compare endpoint
  if (commitRange && commitRange.includes('...')) {
    const [base, head] = commitRange.split('...')
    console.log(`DEBUG: Base commit = ${base}`)
    console.log(`DEBUG: Head commit = ${head}`)
    
    try {
      commitsToReview = await fetchCompareCommits(base, head)
    } catch (error) {
      console.error('Error fetching commit range:', error)
      // Fall back to single commit below
    }
  } 
  
  // Fallback to single commit if no commit range or compare failed
  if (commitsToReview.length === 0) {
    let singleCommit = commitRange || env.GITHUB_SHA
    if (!singleCommit) {
      /**
       * When GITHUB_SHA or GITHUB_COMMIT_RANGE are not set in a local dev environment,
       * fallback to using HEAD as a dummy commit.
       */
      if (!env.GITHUB_ACTIONS) {
        console.warn('DEBUG: GITHUB_SHA or GITHUB_COMMIT_RANGE not provided. Using HEAD for local testing.')
        singleCommit = 'HEAD'
      } else {
        throw new Error('No commit or commit range found in environment variables.')
      }
    }

    console.log('DEBUG: Using single commit flow with commit:', singleCommit)
    commitsToReview = [singleCommit]
  }

  console.log('VERBOSE: Returning commitsToReview:', commitsToReview)
  return commitsToReview
}
```

## GitHub Tools

copy src/github-tools.ts

```ts
// src/github-tools.ts

/**
 * GitHub API tools for the AI commit review agent
 */
import { tool } from 'ai'
import { z } from 'zod'
import { config } from './index.ts'
import { spawnSync } from 'node:child_process'

/**
 * A tool to retrieve the diff for a GitHub commit.
 */
export const fetchCommitDiff = tool({
  description: 'A tool to retrieve the diff for a GitHub commit.',
  parameters: z.object({
    owner: z.string(),
    repo: z.string(),
    sha: z.string()
  }),
  /**
   * Retrieves the raw diff for a given commit SHA.
   * Falls back to local git show if a 404 is received from GitHub.
   * @param params - owner, repo, and sha of the commit
   * @returns The raw diff as plain text
   */
  execute: async ({ owner, repo, sha }) => {
    console.log('VERBOSE: fetchCommitDiff called with:', owner, repo, sha)
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.diff',
          Authorization: `Bearer ${config.github.token}`
        }
      }
    )
    console.log('VERBOSE: fetchCommitDiff response status:', response.status)

    if (!response.ok) {
      // If commit not found in GitHub, attempt local git show
      if (response.status === 404) {
        console.warn('WARN: Commit not found in GitHub remote. Trying local git show...')
        const localDiff = spawnSync('git', ['show', sha, '--patch'], {
          encoding: 'utf-8'
        })
        if (localDiff.status === 0 && localDiff.stdout) {
          return localDiff.stdout
        }
      }

      throw new Error(
        `Failed to fetch commit diff for ${sha}: ${response.status} - ${response.statusText}`
      )
    }

    return await response.text()
  }
})

/**
 * Retrieves commit data from GitHub's compare endpoint
 * @param base - Base commit SHA
 * @param head - Head commit SHA
 * @returns Array of commit SHAs or throws an error
 */
export async function fetchCompareCommits(base: string, head: string) {
  console.log('VERBOSE: fetchCompareCommits called with base:', base, 'head:', head)
  const { owner, repo, token } = config.github

  const compareUrl = `https://api.github.com/repos/${owner}/${repo}/compare/${base}...${head}`
  console.log('VERBOSE: compareUrl:', compareUrl)

  const compareResponse = await fetch(compareUrl, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${token}`
    }
  })
  console.log('VERBOSE: fetchCompareCommits response status:', compareResponse.status)

  if (!compareResponse.ok) {
    const bodyText = await compareResponse.text()
    console.log(`DEBUG: Compare response body = ${bodyText}`)
    throw new Error(
      `Failed to compare commits: ${compareResponse.status} - ${compareResponse.statusText}`
    )
  }

  const compareData = await compareResponse.json()
  console.log('VERBOSE: compareData fetched successfully, commits count:', compareData.commits?.length)
  if (!compareData.commits) {
    throw new Error('No commits found in the specified commit range.')
  }

  const commits = compareData.commits.map((c: { sha: string }) => c.sha)
  if (!commits.length) {
    throw new Error('No commits available in the comparison data.')
  }

  return commits
}
```