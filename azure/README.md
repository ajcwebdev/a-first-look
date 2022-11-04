# Example Project for [A First Look at Azure Functions](https://dev.to/ajcwebdev/a-first-look-at-azure-functions-i6f)

[Azure Functions](https://azure.microsoft.com/en-us/services/functions/) is an event-driven serverless compute platform that manages deploying and maintaining servers. It provides all up-to-date resources and orchestration needed to keep your applications running. Developer tools for debugging are included along with triggers and bindings for integrating services.

## Outline

1. Project Structure
  * `host.json`
  * `local.settings.json`
2. HTTP trigger
  * `index.js`
  * `function.json`
3. Test function locally
  * Install the Azure Functions Core Tools
  * `func start`
4. Create an Azure subscription
  * Install the Azure CLI
  * Check version number with `az version`
  * Log in with `az login`
  * Configure subscription with `az account set`
5. Create a function app
  * Create a resource group with `az group create`
  * Create a storage account with `az storage account create`
  * Create a function app with `az functionapp create`
  * Publish app with `func azure functionapp publish`

## 1. Project Structure

A Functions project directory contains [`host.json`](https://docs.microsoft.com/en-us/azure/azure-functions/functions-host-json), [`local.settings.json`](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=macos%2Ccsharp%2Cbash#local-settings-file), and subfolders with the code for individual functions.

### `host.json`

The `host.json` metadata file contains global configuration options that affect all functions for a function app.

```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[2.*, 3.0.0)"
  }
}
```

### `local.settings.json`

The `local.settings.json` file stores app settings, connection strings, and settings used by local development tools.

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": ""
  }
}
```

## 2. HTTP trigger

[HTTP triggers](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger) let you invoke a function with an HTTP request. You can use an HTTP trigger to build serverless APIs and respond to webhooks.

### `index.js`

```javascript
// index.js

module.exports = async function (context, req) {
  context.log('You did it!')

  const name = (req.query.name || (req.body && req.body.name))
  const responseMessage = name
    ? "Hello, " + name + ". It worked!"
    : "It worked! Pass a name for a personalized response."

  context.res = {
    status: 200,
    body: responseMessage
  }
}
```

### `function.json`

In `function.json`, `req` and `res` are set to the `direction` `in` and `out`. Requests can be `get` or `post`.

```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [
        "get",
        "post"
      ]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

## 3. Test function locally

To run a Functions project, run the [Functions host](https://github.com/Azure/azure-functions-host) with the Azure Functions Core Tools.

### Install the Azure Functions Core Tools

[Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local) includes a version of the same runtime that powers Azure Functions runtime that you can run on your local development computer. It also provides commands to create functions, connect to Azure, and deploy function projects.

```bash
brew tap azure/functions
brew install azure-functions-core-tools@3
```

### `func start`

The host enables triggers for all functions in the project.

```bash
func start
```

When the Functions host starts, it outputs the URL of HTTP-triggered functions:

```
Core Tools Version:       3.0.3477
Commit hash:              5fbb9a76fc00e4168f2cc90d6ff0afe5373afc6d  (64-bit)
Function Runtime Version: 3.0.15584.0

Functions:

	HttpTrigger: [GET,POST] http://localhost:7071/api/HttpTrigger

For detailed output, run func with --verbose flag.
```

![01-localhost:7071-api-HttpTrigger](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/d8zjymhi1ibyhrzcrzsh.png)

![02-localhost:7071-api-HttpTrigger-name-ajcwebdev](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/worh41jmz0odwxbke34p.png)

Alternatively, you can test the endpoints with curl.

```bash
curl --get http://localhost:7071/api/HttpTrigger
```

```bash
curl --request POST http://localhost:7071/api/HttpTrigger \
  --data '{"name":"ajcwebdev"}'
```

## 4. Create an Azure subscription

To publish a function you must create a function app with an Azure subscription. A subscription is a container used to provision resources in Azure. It holds the details of all your resources such as VMs and databases.

When you create an Azure resource like a VM, you identify the subscription it belongs to so usage of the VM can be aggregated and billed monthly. You must use the [Azure portal](https://azure.microsoft.com/en-us/features/azure-portal/) to create a subscription.

![03-azure-portal](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/cuaeqdo6kgydl2s5jfa5.png)

Select Subscriptions.

![04-subscriptions](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/gh2w473ttx8xe3693s07.png)

Click add.

![05-create-a-subscription](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/mu4ej4myobd9ct0wla9b.png)

Give your subscription a name.

### Install the Azure CLI

There are numerous ways to [install the Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) depending on your development environment. I followed the instructions for installing with [Homebrew on MacOS](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-macos).

```bash
brew install azure-cli
```

### Check version number with `az version`

```bash
az version
```

### Log in with `az login`

Log in to Azure with [`az login`](https://docs.microsoft.com/en-us/cli/azure/reference-index?view=azure-cli-latest#az_login).

```bash
az login
```

If you have Multi-Factor Authentication setup then you will need to use `az login --tenant TENANT_ID` to explicitly login to a tenant. You can find your tenant ID on the [Azure Active Directory](https://azure.microsoft.com/en-us/services/active-directory/) portal.

### Configure subscription with `az account set`

```bash
az account set \
  --subscription ajcwebdev-subscription
```

## 5. Create a function app

A function app maps to your local function project and lets you group functions as a logical unit for easier management, deployment, and sharing of resources. Before you can deploy your function code to Azure, you need to create three resources:

* [Resource group](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/overview) - logical container for related resources
* [Storage account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create) - maintains state and other information about the functions
* [Function app](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-function-app-portal#create-a-function-app) - environment for executing function code

### Create a resource group with `az group create`

The [`az group create command`](https://docs.microsoft.com/en-us/cli/azure/group?view=azure-cli-latest#az_group_create) creates a resource group.

```bash
az group create \
  --name ajcwebdev-rg \
  --location westus
```

### Create a storage account with `az storage account create`

The [`az storage account create`](https://docs.microsoft.com/en-us/cli/azure/storage/account#az_storage_account_create) command creates the storage account.

```bash
az storage account create \
  --name ajcwebdevstorage \
  --location westus \
  --resource-group ajcwebdev-rg \
  --sku Standard_LRS
```

`Standard_LRS` creates a general-purpose storage account in your resource group and region.

### Create a function app with `az functionapp create`

The [`az functionapp create`](https://docs.microsoft.com/en-us/cli/azure/functionapp#az_functionapp_create) command creates the function app in Azure.

```bash
az functionapp create \
  --resource-group ajcwebdev-rg \
  --consumption-plan-location westus \
  --runtime node \
  --runtime-version 12 \
  --functions-version 3 \
  --name ajcwebdev-function-app \
  --storage-account ajcwebdevstorage
```

This specifies:
* `ajcwebdev-rg` for the resource group
* `ajcwebdevstorage` for the storage account
* `ajcwebdev-function-app` for the name of the function app

### Publish app with `func azure functionapp publish`

The `func azure functionapp publish` command deploys your local functions project to Azure.

```bash
func azure functionapp publish ajcwebdev-function-app
```

Output:

```
Getting site publishing info...
Creating archive for current directory...
Uploading 1.63 KB
Upload completed successfully.
Deployment completed successfully.
Syncing triggers...

Functions in ajcwebdev-function-app:
    HttpTrigger - [httpTrigger]
        Invoke url: https://ajcwebdev-function-app.azurewebsites.net/api/httptrigger?code=qFdxLBSxkswsQ/NZIeooMTlC4WS9awDgaGZi/OJPqgUzcKQYFYIwJA==
```

Enter the [provided URL](https://ajcwebdev-function-app.azurewebsites.net/api/httptrigger?code=qFdxLBSxkswsQ/NZIeooMTlC4WS9awDgaGZi/OJPqgUzcKQYFYIwJA==) or add [`&name=person`](https://ajcwebdev-function-app.azurewebsites.net/api/httptrigger?code=qFdxLBSxkswsQ/NZIeooMTlC4WS9awDgaGZi/OJPqgUzcKQYFYIwJA==&name=person).

![06-deployed-HttpTrigger](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dvks2erhpgc3kdb6fxcl.png)

![07-deployed-HttpTrigger-name-person](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/gto9dx70rdvv2drffjm9.png)

You can also view the home page of your function app at [ajcwebdev-function-app.azurewebsites.net](https://ajcwebdev-function-app.azurewebsites.net/).

![08-ajcwebdev-function-app-azurewebsites-net](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/p4rq2jkc7kqv9uhgjtt8.png)