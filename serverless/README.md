The [Serverless Framework](https://www.serverless.com/framework/docs/) consists of an open source CLI and a hosted dashboard. Together, they provide you with full serverless application lifecycle management. It helps you develop and deploy your [AWS Lambda](https://www.serverless.com/framework/docs/providers/aws/guide/intro/) functions, along with the AWS infrastructure resources they require.

## History

It was created by Austen Collins in 2015 as a boilerplate project for a company or something called Servant, whose existence seems to be completely wiped from the internet aside from this git commit.

>***Servant Boilerplate LADEN: AWS Lambda, Angular, AWS DynamoDB, Express, Node.js***
>
>*A Servant Boilerplate Application already integrated with [Servant](https://www.servant.co) built on the LADEN stack.  Use this to rapidly build Servant applications. This stack in particular is perfect for integrations or any applciation that needs to offload intense processing tasks to AWS Lambda.  We use this for our apps! –  The Servant Team*
>
>*This boilerplate is current under development...*
>
>***[Austen Collins](https://github.com/ac360)*** - *[Serverless initial commit (April 20, 2015)](https://github.com/serverless/serverless/commit/b297fcb835428108bd1b4e75cb519c0fabff39fa)*

When it was officially announced the project was called [JAWS](https://www.youtube.com/watch?v=D_U6luQ6I90) before being renamed to Serverless after the newly formed [Serverless Inc.](https://www.businesswire.com/news/home/20161012005381/en/Serverless-Inc.-Nets-3M-to-Radically-Simplify-Cloud-Infrastructure)

>*One of the projects I had recycled the branding from was the JavaScript AWS framework. I'm a big JavaScript fan and at the time there just wasn't a good application framework for AWS. Something that could help developers be productive on AWS.*
>
>***[The Story of the Serverless Framework with Austen Collins (September 14, 2020)](https://www.serverlesschats.com/66/)***

## Core Concepts

The Framework has four main concepts. Here is how they pertain to AWS and Lambda.

### Functions

A Function is an AWS Lambda function. It's an independent unit of deployment, like a microservice. It's merely code, deployed in the cloud, that is most often written to perform a single job such as:

* Saving a user to the database
* Processing a file in a database
* Performing a scheduled task

### Events

Anything that triggers a Lambda Function to execute is regarded as an Event. Events are infrastructure events on AWS such as:

* API Gateway HTTP endpoint request for a REST API
* S3 bucket upload for an image
* CloudWatch timer run every 5 minutes
* SNS message topic

When you define an event for your Lambda functions, the Framework will automatically create any infrastructure necessary for that event such as an API Gateway endpoint and configure your AWS Lambda Functions to listen to it.

### Resources

Resources are AWS infrastructure components which your Functions use such as:

* DynamoDB Table for saving Users/Posts/Comments data
* S3 Bucket for saving images or files)
* SNS Topic for sending messages asynchronously)
* Anything defined in CloudFormation

The Serverless Framework deploys your Functions and the Events that trigger them, along with the AWS infrastructure components your Functions depend upon.

### Services

A Service is the Framework's unit of organization. You can think of it as a project file, though you can have multiple services for a single application. It's where you define:
* Your Functions
* The Events that trigger them
* The Resources your Functions use

### Example `serverless.yml`

```yaml
service: users

functions: # Your "Functions"
  usersCreate:
    events: # The "Events" that trigger this function
      - http: post users/create
  usersDelete:
    events:
      - http: delete users/delete

resources: # The "Resources" your "Functions" use, CloudFormation goes here
```

## Create a project

### Install the `serverless` CLI

```bash
npm install -g serverless
```

```bash
serverless
```

```
 What do you want to make? AWS - Node.js - Starter
 What do you want to call this project? aws-node-project

Downloading "aws-node" template...

Project successfully created in 'aws-node-project' folder.
```

```
 What org do you want to add this to? ajcwebdev
 What application do you want to add this to? [create a new app]
 What do you want to name this application? starters

Your project has been setup with org: "ajcwebdev" and app: "starters"
```

### serverless.yml

In our `serverless.yml` we have a `nodejs12` runtime and a single `handler` named `hello`.

```yaml
org: ajcwebdev
app: starters
service: aws-node-project

frameworkVersion: '2'

provider:
  name: aws
  runtime: nodejs12.x
  lambdaHashingVersion: 20201221

functions:
  hello:
    handler: handler.hello
```

### handler.js

`handler.js` returns a JSON object containing a `message` demanding less servers.

```javascript
'use strict';

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'But could we have even LESS servers?',
        input: event,
      },
      null,
      2
    ),
  };
};
```

### serverless deploy

The `sls deploy` command deploys your entire service via CloudFormation. Run this command when you have made infrastructure changes such as editing `serverless.yml`.

```bash
serverless deploy
```

```
Serverless: Using provider credentials, configured via dashboard:
https://app.serverless.com/ajcwebdev/apps/starters/aws-node-project/dev/us-east-1/providers

Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
........
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service aws-node-project.zip file to S3 (215.69 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.....................
Serverless: Stack update finished...

Service Information

service: aws-node-project
stage: dev
region: us-east-1
stack: aws-node-project-dev
resources: 8
api keys:
  None
endpoints:
  None
functions:
  hello: aws-node-project-dev-hello
layers:
  None

Serverless: Publishing service to the Serverless Dashboard...

Serverless: Successfully published your service to the Serverless Dashboard:
https://app.serverless.com/ajcwebdev/apps/starters/aws-node-project/dev/us-east-1
```

### serverless invoke

The `sls invoke` command invokes deployed function. It allows sending event data to the function, reading logs and displaying other important information about the function invocation.

```bash
serverless invoke --function hello
```

```
Serverless: Using provider credentials, configured via dashboard:
https://app.serverless.com/ajcwebdev/apps/starters/aws-node-project/dev/us-east-1/providers

{
    "statusCode": 200,
    "body": "{
      \n  \"message\": \"But could we have even LESS servers?\",
      \n  \"input\": {}\n}"
}
```
