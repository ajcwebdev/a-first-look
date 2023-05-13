# Example Project from [How to Deploy a Docker Container on AWS Lambda](https://ajcwebdev.com/2021/09/02/how-to-deploy-a-docker-container-on-aws-lambda/)

AWS Lambda is a powerful computing model because it gives developers a known execution environment with a specific runtime that accepts and runs arbitrary code. But this also causes problems if you have a use case outside the environments predetermined by AWS.

To address this issue, AWS introduced [Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html). Layers allow packaging `.zip` files with the libraries and dependencies needed for the Lambda functions. But [Lambda Layers still have limitations](https://lumigo.io/blog/lambda-layers-when-to-use-it/) including testing, static analysis, and versioning. In December 2020, [AWS Lambda released Docker container support](https://aws.amazon.com/blogs/aws/new-for-aws-lambda-container-image-support/).

Shortly after the announcement, the Serverless framework created the [following example](https://www.serverless.com/blog/container-support-for-lambda) to demonstrate how to use the new feature. This blog post will break down that example by building the project from scratch. All the code for this project can be found [on my GitHub](https://github.com/ajcwebdev/ajcwebdev-docker-lambda).

## Outline

* [Project Structure](#project-structure)
* [Serverless YAML Configuration File](#serverless-yaml-configuration-file)
  * [AWS Provider](#aws-provider)
  * [Functions Property](#functions-property)
* [Dockerfile](#dockerfile)
* [Function Handler](#function-handler)
* [Deploy to AWS](#deploy-to-aws)
  * [Configure AWS Credentials](#configure-aws-credentials)
  * [Run Serverless Deploy Command](#run-serverless-deploy-command)
  * [Invoke the Deployed Function](#invoke-the-deployed-function)

## Project Structure

Instead of globally installing the Serverless CLI, we have installed the `serverless` package as a local dependency in our project. As a consequence, to execute `sls` commands we must prefix the commands with `yarn` or `npx`. You can refer to the [official Serverless documentation](https://www.serverless.com/framework/docs/getting-started) if you prefer to install the CLI globally.

Our project contains the following files:
* `app.js` for our Lambda function code that will return a simple message when invoked.
* `Dockerfile` for defining the dependencies, files, and commands needed to build and run our container image.
* `serverless.yml` for defining our [AWS resources in code](https://www.serverless.com/framework/docs/providers/aws/guide/services#serverlessyml) which will be translated into a single [CloudFormation template that will generate a CloudFormation stack](https://www.serverless.com/framework/docs/providers/aws/guide/resources).
* `.gitignore` so we do not commit our `node_modules` or the `.serverless` directory that contains our build artifacts and is generated when we deploy our project to AWS.

## Serverless YAML Configuration File

The Serverless Framework lets you define a Dockerfile and point at it in the `serverless.yml` configuration file. The Framework makes sure the container is available in ECR and setup with configuration for Lambda.

```yaml
service: ajcwebdev-docker-lambda
frameworkVersion: '3'
```

### AWS Provider

We select the [AWS `provider`](https://www.serverless.com/framework/docs/providers/aws) and include an `ecr` section for defining images that will be built locally and uploaded to ECR.

> *Note: If you are using an Apple M1, you will need to uncomment out the line that specifies `arm64` for the `architecture` in the `provider` property.*

```yaml
provider:
  name: aws
  # architecture: arm64
  ecr:
    images:
      appimage:
        path: ./
```

### Functions Property

The `functions` property tells the framework the image reference name (`appimage`) that is used elsewhere in our configuration. The location of the content of the Docker image is set with the `path` property. We use the same value for `image.name` as we do for the image we defined, `appimage`.

```yaml
functions:
  hello:
    image:
      name: appimage
```

Here is our complete `serverless.yml` file:

```yaml
# serverless.yml

service: ajcwebdev-docker-lambda
frameworkVersion: '3'
provider:
  name: aws
  # architecture: arm64
  ecr:
    images:
      appimage:
        path: ./
functions:
  hello:
    image:
      name: appimage
```

## Dockerfile

We are using the Node [v14 image](https://gallery.ecr.aws/lambda/nodejs) from the [AWS ECR Gallery](https://gallery.ecr.aws/). The `CMD` property defines a file called `app.js` with a function called `handler`.

```dockerfile
# Dockerfile

FROM public.ecr.aws/lambda/nodejs:14

COPY app.js ./

CMD ["app.handler"]
```

## Function Handler

`app.js` contains the code that will be executed by our handler when the function is invoked. It will return a JSON object containing a message clarifying exactly why anyone would ever want to do this in the first place.

```js
// app.js

'use strict'

module.exports.handler = async (event) => {
  const message = `Cause I don't want a server, but I do still want a container`
  return {
    statusCode: 200,
    body: JSON.stringify(
      { message }, null, 2
    ),
  }
}
```

## Deploy to AWS

We are now able to generate our container, deploy it to ECR, and execute our function.

### Configure AWS Credentials

You will need to [set your AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/#using-aws-access-keys) with the [`sls config credentials`](https://www.serverless.com/framework/docs/providers/aws/cli-reference/config-credentials) command. This step can be skipped if you are using a global install of the CLI that is already configured with your credentials.

```bash
yarn sls config credentials \
  --provider aws \
  --key YOUR_ACCESS_KEY_ID \
  --secret YOUR_SECRET_ACCESS_KEY
```

### Run Serverless Deploy Command

The `sls deploy` command deploys your entire service via CloudFormation. In order to build images locally and push them to ECR, you need to have Docker [installed](https://docs.docker.com/get-docker/) and running on your local machine.

```bash
yarn sls deploy
```

### Invoke the Deployed Function

The `sls invoke` command invokes a deployed function.

```bash
yarn sls invoke --function hello
```

This will output the following message:

```json
{
  "statusCode": 200,
  "body": "{\n  \"message\": \"Cause I don't want a server, but I do still want a container\"\n}"
}
```