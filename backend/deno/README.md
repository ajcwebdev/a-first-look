# Example Project from A First Look at Deno Deploy

## Clone Repo and Navigate to Project

```bash
git clone https://github.com/ajcwebdev/a-first-look.git
cd backend/deno
```

## Install Deno CLI

```bash
brew install deno
```

### Install deployctl

```bash
deno install --allow-all --no-check -r -f https://deno.land/x/deploy/deployctl.ts
```

## Run Example

```bash
deployctl run index.jsx
```