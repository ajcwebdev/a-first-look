# init-ai

CLI tool to initialize TypeScript projects optimized for AI-assisted development workflows.

## Installation

```bash
npm install -g init-ai
```

## Usage

### Create a new project
```bash
init-ai my-project
```

### Initialize in current directory
```bash
init-ai
```

## What it creates

The tool sets up a complete TypeScript project with:

- **TypeScript configuration** - Strict settings optimized for modern Node.js
- **Package scripts** - `dev`, `check`, `repo` commands ready to use
- **Repomix integration** - Generate AI-friendly codebase summaries
- **Development dependencies** - tsx, TypeScript, repomix, @types/node
- **AI instruction templates** - Coding guidelines for consistent AI assistance

## Key commands after setup

```bash
# Start development
npm run dev

# Type check
npm run check

# Generate AI-ready codebase summary
npm run repo
```

## Features

- **No build step** - Uses tsx for direct TypeScript execution
- **ESM modules** - Modern JavaScript module system
- **Repomix ready** - Creates `repomix.sh` script and instruction templates
- **VS Code integration** - Automatically opens project in VS Code
- **AI config support** - Copies `~/.aiconfig` to project `.env` if available

## Project structure

```
my-project/
├── index.ts              # Main entry point
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies and scripts
├── repomix.sh           # Script to generate AI codebase summary
├── repomix-instruction.md # AI coding guidelines
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

The `npm run repo` command generates markdown files (`new-llm-1.md`, etc.) that contain your entire codebase formatted for AI tools like Claude or ChatGPT.