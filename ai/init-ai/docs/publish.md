# Publishing to npm for Global Installation

This guide covers the final steps to publish your package to npm. The package configuration has already been set up correctly.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **npm CLI**: Ensure you have npm installed and updated to the latest version
3. **Authentication**: Log in to npm from your command line

## Quick Readiness Check

Run the configuration analysis to verify everything is ready:

```bash
npm run config
```

This command will check your npm authentication, package configuration, file structure, and provide publishing guidance.

## Authentication

```bash
# Log in to npm
npm login

# Verify you're logged in
npm whoami
```

## Pre-Publishing Tests

### Test Package Locally
```bash
# Install your package globally from the local directory
npm install -g .

# Test the command
init-ai --help
init-ai my-test-project

# Uninstall after testing
npm uninstall -g init-ai
```

### Preview Package Contents
```bash
# See what files will be included
npm pack --dry-run

# Create a tarball to inspect
npm pack
```

## Package Name Considerations

### Regular Package Names
- Must be unique across all npm packages
- Use lowercase letters, numbers, hyphens, and underscores
- Cannot start with a dot or underscore

### Scoped Packages
If the name is taken, consider using a scope:
```json
{
  "name": "@your-username/init-ai"
}
```

## Publishing

### Initial Publication
```bash
# Publish public package
npm publish

# Publish scoped package as public
npm publish --access public
```

### Updating Versions
```bash
# Update patch version (1.0.0 → 1.0.1)
npm version patch

# Update minor version (1.0.0 → 1.1.0)
npm version minor

# Update major version (1.0.0 → 2.0.0)  
npm version major

# Publish the update
npm publish
```

## Post-Publishing Verification

### Check Package Page
Visit `https://www.npmjs.com/package/init-ai` to verify publication.

### Test Global Installation
```bash
# Install globally
npm install -g init-ai

# Test the command
init-ai --help
init-ai my-new-project

# Check installation location
which init-ai
```

## Managing Published Packages

### Update Package Information
```bash
# View current profile
npm profile get

# Update package description
npm pkg set description="New description"
npm publish
```

### Manage Package Access
```bash
# List package collaborators
npm owner ls init-ai

# Add a collaborator
npm owner add username init-ai

# Remove a collaborator
npm owner rm username init-ai
```

### Deprecate Versions
```bash
# Deprecate a specific version
npm deprecate init-ai@1.0.0 "This version has security issues"

# Deprecate all versions
npm deprecate init-ai "Package is no longer maintained"
```

## Security Best Practices

- Enable two-factor authentication: `npm profile enable-2fa`
- Use `npm audit` to check for vulnerabilities
- Keep dependencies updated
- Review package access regularly

## Common Issues and Solutions

### Permission Errors
If you get permission errors during global installation:
```bash
# Configure npm to use a different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Package Name Already Exists
- Choose a different name
- Use a scoped package: `@username/init-ai`
- Consider if the existing package serves the same purpose

### Command Not Found After Installation
- Verify the `bin` field points to `./bin/init-ai.js`
- Check that the executable file has proper shebang: `#!/usr/bin/env node`
- Ensure the file is executable: `chmod +x bin/init-ai.js`

## Success!

After publishing, users can install your CLI tool globally:
```bash
npm install -g init-ai
```

And use it anywhere:
```bash
init-ai my-awesome-project
```

The package is now live and available to developers worldwide!