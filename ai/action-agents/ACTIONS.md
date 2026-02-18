Below is a concise guide on how to incorporate the `gh` CLI both locally and in GitHub Actions for this specific project. The examples focus on setting secrets, running workflows, listing workflows, retrieving logs, and downloading artifacts. Feel free to pick and choose which commands and approaches best fit your workflow and development style.

## Local Development with `gh` CLI

### Prerequisites

1. **Install GitHub CLI**: If you don't already have `gh` installed, follow the instructions at [GitHub CLI Installation](https://cli.github.com/manual/installation). Make sure you’ve authenticated with `gh auth login`.

2. **Have a Personal Access Token (PAT) if needed**: For most Actions-related commands (`gh workflow ...`, `gh run ...`, etc.), the standard `gh auth login` process is sufficient if you grant the necessary scopes. If you run into permissions issues (e.g. needing a fine-grained token for certain operations), generate a PAT with the required scopes and run `gh auth login` again, specifying that token.

3. **Check you’re in the right repository**: By default, `gh` commands operate on the repository in your current working directory. If you ever need to target another repository (e.g. `myorg/other-repo`), pass `-R myorg/other-repo` or run the command inside that repository’s local folder.

### Setting and Managing Secrets Locally

Secrets are typically configured in the GitHub UI, but you can also use `gh secret` commands. For example:

```bash
# Create or update a repository secret
gh secret set OPENAI_API_KEY --body "sk-1234..."

# Set multiple secrets imported from the ".env" file
gh secret set -f .env

# List secrets in the current repo
gh secret list

# Delete a secret
gh secret delete OPENAI_API_KEY
```

You can do the same for organizational secrets by adding `--org <org-name>`, or environment secrets with `--env <environment-name>` if you’re using GitHub Environments.

> Tip: This is especially handy when you want to script the setup of a new repository or quickly rotate keys without going into the UI.

### Listing, Enabling, and Disabling Workflows

To see which workflows you have under `.github/workflows/`, run:

```bash
gh workflow list
```

By default, only enabled workflows are shown. If you want to see disabled ones:

```bash
gh workflow list --all
```

If a workflow is disabled, you can enable it:

```bash
gh workflow enable review.yml
```

Or disable a workflow if you don’t want it to run:

```bash
gh workflow disable review.yml
```

### Running Workflows Locally via `workflow_dispatch`

Even though GitHub Actions primarily run on GitHub’s infrastructure, you can trigger a run directly from your local environment:

```bash
gh workflow run review.yml
```

- If the workflow file supports manual inputs, you can pass them with `-f inputName=value` or `-F inputName=value`.
- If you want to run a specific branch version of the workflow, add `--ref my-branch`.

### Viewing Logs, Artifacts, and Rerunning

When you want to issue commands like `gh run view <run-id>` or `gh run download <run-id>`, you need a valid run ID. The examples below demonstrate how to do it dynamically in one line by inlining a call to `gh run list`.

1. **View the most recent run**:

```bash
gh run view "$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')"
```

2. **Download artifacts** from the most recent run:

```bash
gh run download "$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')" -D downloaded-artifacts
```

3. **Rerun all failed jobs** in the most recent run:

```bash
gh run rerun "$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')" --failed
```

4. **Rerun a specific job** in the most recent run (if you know the job’s `databaseId`—example below uses a placeholder `67890`):

```bash
gh run rerun "$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')" --job 67890
```

5. **Watch** the most recent run until completion:

```bash
gh run watch "$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')"
```

If you need to target a specific workflow or branch, you can pass additional flags to `gh run list` (e.g. `--workflow "review.yml"` or `--branch "dev"`) to refine which run you’re retrieving.

## Using `gh` CLI Inside GitHub Actions Workflows

### Why Use `gh` Within a Workflow?

- Automation: Programmatically enable/disable or rerun other workflows.
- Managing secrets: Automated housekeeping for secrets and environment variables.
- Repository housekeeping: Creating and commenting on issues, PRs, or pulling logs from other runs.

### Required Steps

1. **GH_TOKEN Environment Variable**: In your workflow step, set `GH_TOKEN` to a valid token with scopes required for the CLI commands you plan to use. Often `GITHUB_TOKEN` (automatically provided by GitHub Actions) is enough, but it depends on the permission scopes in your repo and the tasks you want to perform.

2. **Invoke `gh`**: Simply add a step in your `.yml` file that runs `gh <command>`. For example:

```yaml
steps:
  - name: Set up GitHub CLI environment
    run: |
      gh auth status
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
 
  - name: Comment on an issue
    run: |
      gh issue comment 42 --body "Automated comment from our workflow"
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This ensures you’re authenticated before issuing commands.

### Example: Managing Another Workflow Inside Your `review.yml`

Suppose you want to trigger another workflow or list all workflows after the `AI Review` step. You could add a step like:

```yaml
- name: Trigger Another Workflow
  run: |
    gh workflow run some-other-workflow.yml --ref ${{ github.ref }}
    gh run list
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Example: Downloading Artifacts from a Previous Step

If you have a scenario where you need to grab artifacts from a different run, you can do:

```yaml
- name: Download artifacts from another run
  run: |
    gh run download 7890123 -D artifacts-output
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

(Or dynamically resolve the run ID using the single-line technique shown above.)

## Project-Specific Highlights

- **Secrets**: This project relies on `OPENAI_API_KEY`, `GH_TOKEN`, `GH_OWNER`, `GH_REPO`. Manage them with `gh secret set` in your repo. In local dev, you can place them in `.env` for usage with `tsx --env-file=.env`.
- **Workflow Listing**: Your `.github/workflows/review.yml` file can be enabled/disabled or triggered from `gh workflow enable/disable/run review.yml`. 
- **Logs and Artifacts**: The `review.yml` job uploads `ai-review.log` as an artifact. Use `gh run list` to find the run ID, then `gh run download <run-id>` to retrieve it locally. That can help debug or review the AI’s output in your terminal after the fact.
- **Local vs. Actions**: You can replicate many of the same actions locally. For instance, if you do local testing with commits, you can set the environment variable `GITHUB_SHA` to a local commit, or rely on the fallback logic in `commit-parser.ts` that uses `HEAD`. Meanwhile, embedding `gh` commands in the workflow itself allows you to do automation tasks in the remote CI/CD environment.

## Summary

1. Locally  

   - **Set secrets**: `gh secret set ...`  
   - **List, run, enable, and disable** your workflows: `gh workflow list`, `gh workflow run ...`, etc.  
   - **Retrieve logs and artifacts** with a one-liner, for example:  
     ```bash
     gh run view "$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')"
     ```
     to automatically target the most recent run.

2. Inside GitHub Actions  

   - Use `gh` with `GH_TOKEN` set.  
   - You can script advanced tasks that the normal actions might not directly provide (e.g. toggling another workflow, orchestrating complex multi-step processes, or automatically commenting on issues and PRs).  

Overall, the `gh` CLI is a powerful addition to your toolbelt both during local development and within GitHub Actions. By dynamically resolving run IDs, you can write truly reusable commands that avoid hard-coded values—making your automation scripts more portable and maintainable.