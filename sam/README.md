AWS [Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam/) is an open-source framework for building serverless applications. It provides shorthand syntax to express functions, APIs, databases, and event source mappings.

## Setup

### Configure AWS CLI with `aws configure`

Make sure you have the [AWS CLI](https://aws.amazon.com/cli/) installed and an [AWS account](https://aws.amazon.com/). For general use, [`aws configure`](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html) is recommended as the fastest way to set up your AWS CLI installation.

```bash
aws configure
```

When you enter this command, the AWS CLI prompts you for four pieces of information:
* Access key ID
* Secret access key
* AWS Region
* Output format

Go to [My Security Credentials](https://console.aws.amazon.com/iam/home?#/security_credentials) to find your Access Key ID, Secret Access Key, and default region. You can leave the output format blank.

```
AWS Access Key ID: <YOUR_ACCESS_KEY_ID>
AWS Secret Access Key: <YOUR_SECRET_ACCESS_KEY>
Default region name: <YOUR_REGION_NAME>
Default output format [None]: 
```

### Install SAM CLI

There are [numerous ways to install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) depending on your development environment and operating system. I followed the instructions for [installing with Homebrew](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install-mac.html).

```bash
brew tap aws/tap
brew install aws-sam-cli
```

### Check version

```bash
sam --version
```

Output:

```
SAM CLI, version 1.23.0
```

## Initialize project with `sam init`

```bash
sam init
```

Output:

```
SAM CLI now collects telemetry to better understand customer needs.
You can OPT OUT and disable telemetry collection by setting
the environment variable SAM_CLI_TELEMETRY=0 in your shell.

Thanks for your help!
Learn More:
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-telemetry.html
```

### Select a template

```
Which template source would you like to use?
	1 - AWS Quick Start Templates
	2 - Custom Template Location
```

Select AWS Quick Start Templates.

### Select package type

```
What package type would you like to use?
	1 - Zip (artifact is a zip uploaded to S3)	
	2 - Image (artifact is an image uploaded to an ECR image repository)
```

Select Zip.

### Select runtime for your language of choice

```
Which runtime would you like to use?
	1 - nodejs14.x
	2 - python3.8
	3 - ruby2.7
	4 - go1.x
	5 - java11
	6 - dotnetcore3.1
	7 - nodejs12.x
	8 - nodejs10.x
	9 - python3.7
	10 - python3.6
	11 - python2.7
	12 - ruby2.5
	13 - java8.al2
	14 - java8
	15 - dotnetcore2.1
```

Select nodejs14.x.

### Select project name

```
Project name [sam-app]: ajcwebdev-sam
```

Give your project a name. I named my project `ajcwebdev-sam`.

### Select example application

```
Cloning app templates from https://github.com/aws/aws-sam-cli-app-templates

AWS quick start application templates:
	1 - Hello World Example
	2 - Step Functions Sample App (Stock Trader)
	3 - Quick Start: From Scratch
	4 - Quick Start: Scheduled Events
	5 - Quick Start: S3
	6 - Quick Start: SNS
	7 - Quick Start: SQS
	8 - Quick Start: Web Backend
```

Select Hello World Example.

Output:

```
-----------------------
Generating application:
-----------------------
Name: ajcwebdev-sam
Runtime: nodejs14.x
Dependency Manager: npm
Application Template: hello-world
Output Directory: .

Next steps can be found in the README file at ./ajcwebdev-sam/README.md
```

## Project code

```
ajcwebdev-sam
  ├── .gitignore
  ├── README.md
  ├── template.yaml
  ├── events
  │   └── event.json
  └── hello_world
      ├── .npmignore
      ├── app.js
      ├── package.json
      └── tests
          └── unit
              └── test_handler.js
```

### template.yaml

This example app uses a single Lambda function along with API Gateway.

![02-stack-lambda-api-gateway](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/s09bcf1258x49zvzmhrd.png)

These are defined in `template.yaml` which includes a SAM template for specifying your application's AWS resources.

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  ajcwebdev-sam

  Sample SAM Template for ajcwebdev-sam
  
Globals:
  Function:
    Timeout: 3

Resources:
  HelloWorldFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: hello-world/
      Handler: app.lambdaHandler
      Runtime: nodejs14.x
      Events:
        HelloWorld:
          Type: Api
          Properties:
            Path: /hello
            Method: get

Outputs:
  HelloWorldApi:
    Description: "API Gateway endpoint URL for Prod stage for Hello World function"
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/hello/"
  HelloWorldFunction:
    Description: "Hello World Lambda Function ARN"
    Value: !GetAtt HelloWorldFunction.Arn
  HelloWorldFunctionIamRole:
    Description: "Implicit IAM Role created for Hello World function"
    Value: !GetAtt HelloWorldFunctionRole.Arn
```

### hello-world

The `hello-world` directory contains code for the application's Lambda function inside `app.js` and a `package.json` file for the necessary dependencies and scripts needed for our build process.

### app.js

Contains your actual Lambda handler logic.

```javascript
// hello-world/app.js

let response;

/**
 *
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @param {Object} context
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
  try {
    response = {
      'statusCode': 200,
      'body': JSON.stringify({
        message: 'hello world',
      })
    }
  } catch (err) {
    console.log(err);
    return err;
  }
  return response
};
```

### package.json

You specify dependencies in a manifest file that you include in your application. Since our example is using Node.js functions, our manifest file is `package.json`. This file is required for `sam build`.

```json
{
  "name": "hello_world",
  "version": "1.0.0",
  "description": "hello world sample for NodeJS",
  "main": "app.js",
  "repository": "https://github.com/awslabs/aws-sam-cli/tree/develop/samcli/local/init/templates/cookiecutter-aws-sam-hello-nodejs",
  "author": "SAM CLI",
  "license": "MIT",
  "dependencies": {
    "axios": "^0.21.1"
  },
  "scripts": {
    "test": "mocha tests/unit/"
  },
  "devDependencies": {
    "chai": "^4.2.0",
    "mocha": "^8.2.1"
  }
}
```

### test-handler.js

The `hello-world` directory also contains a `tests` directory with a `unit` directory for unit tests and a `test-handler.js` file.

```javascript
// hello-world/tests/unit/test-handler.js

'use strict'

const app = require('../../app.js')
const chai = require('chai')
const expect = chai.expect
var event, context

describe('Tests index', function () {
  it('verifies successful response', async () => {
    const result = await app.lambdaHandler(event, context)

    expect(result).to.be.an('object')
    expect(result.statusCode).to.equal(200)
    expect(result.body).to.be.an('string')

    let response = JSON.parse(result.body)

    expect(response).to.be.an('object')
    expect(response.message).to.be.equal("hello world")
  })
})
```

The `events` directory contains invocation events. There are a lot of events in `event.json`, so we'll take a look at each key and its corresponding value.

### body

[HTTP body](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages) containing data associated with the request (like content of an HTML form), or the document associated with a response.

```json
"{\"message\": \"hello world\"}"
```

### resource

Sets a proxy in front of the resource.

```json
"/{proxy+}"
```

### path

Sets a path for the proxy to send the request.

```json
"/path/to/resource"
```

### httpMethod

The [HTTP POST](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST) method sends data to the server. The type of the body of the request is indicated by the Content-Type header.

```json
"POST"
```

### isBase64Encoded

```json
false
```

### queryStringParameters

```json
{
  "foo": "bar"
}
```

### pathParameters

Proxies the request to our resources.

```json
{
  "proxy": "/path/to/resource"
}
```

### stageVariables

```json
{
  "baz": "qux"
}
```

### headers

I definitely know what all of these do. Totally.

```json
{
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, sdch",
  "Accept-Language": "en-US,en;q=0.8",
  "Cache-Control": "max-age=0",
  "CloudFront-Forwarded-Proto": "https",
  "CloudFront-Is-Desktop-Viewer": "true",
  "CloudFront-Is-Mobile-Viewer": "false",
  "CloudFront-Is-SmartTV-Viewer": "false",
  "CloudFront-Is-Tablet-Viewer": "false",
  "CloudFront-Viewer-Country": "US",
  "Host": "1234567890.execute-api.us-east-1.amazonaws.com",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Custom User Agent String",
  "Via": "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)",
  "X-Amz-Cf-Id": "cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA==",
  "X-Forwarded-For": "127.0.0.1, 127.0.0.2",
  "X-Forwarded-Port": "443",
  "X-Forwarded-Proto": "https"
}
```

### requestContext

The `requestContext` object is a map of key-value pairs. In each pair, the key is the name of a `$context` variable property, and the value is the value of that property.

```json
{
  "accountId": "123456789012",
  "resourceId": "123456",
  "stage": "prod",
  "requestId": "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
  "requestTime": "09/Apr/2015:12:34:56 +0000",
  "requestTimeEpoch": 1428582896000,
  "identity": {
    "cognitoIdentityPoolId": null,
    "accountId": null,
    "cognitoIdentityId": null,
    "caller": null,
    "accessKey": null,
    "sourceIp": "127.0.0.1",
    "cognitoAuthenticationType": null,
    "cognitoAuthenticationProvider": null,
    "userArn": null,
    "userAgent": "Custom User Agent String",
    "user": null
  },
  "path": "/prod/path/to/resource",
  "resourcePath": "/{proxy+}",
  "httpMethod": "POST",
  "apiId": "1234567890",
  "protocol": "HTTP/1.1"
}
```

## Build application with `sam build`

The `sam build` command will build your serverless application and prepare it for subsequent steps in your workflow, like locally testing the application or deploying it to AWS.

```bash
sam build
```

This command builds any dependencies that your application has, and copies your application source code to folders under `.aws-sam/build` to be zipped and uploaded to Lambda.

## Deploy to AWS with `sam deploy`

```bash
sam deploy --guided
```

### Configuring SAM deploy

```
Looking for config file [samconfig.toml] :  Not found

Setting default arguments for 'sam deploy'

Stack Name [sam-app]: ajcwebdev-sam
AWS Region [us-west-1]: us-west-1
Confirm changes before deploy [y/N]: N
Allow SAM CLI IAM role creation [Y/n]: Y
```

For the question, "HelloWorldFunction may not have authorization defined," AWS SAM is informing you that the sample application configures an API Gateway API without authorization. When you deploy the sample application, AWS SAM creates a publicly available URL.

```
HelloWorldFunction may not have authorization defined
Is this okay? [y/N]: Y
Save arguments to configuration file [Y/n]: Y
SAM configuration file [samconfig.toml]: samconfig.toml
SAM configuration environment [default]: default
```

### CloudFormation outputs from deployed stack

```
Key                 HelloWorldFunctionIamRole                                                                       
Description         Implicit IAM Role created for Hello World function                                              
Value               arn:aws:iam::1234:role/ajcwebdev-sam-HelloWorldFunctionRole-1234               

Key                 HelloWorldApi                                                                                   
Description         API Gateway endpoint URL for Prod stage for Hello World function                                
Value               https://y4mpitesn5.execute-api.us-west-1.amazonaws.com/Prod/hello/                              

Key                 HelloWorldFunction                                                                              
Description         Hello World Lambda Function ARN                                                                 
Value               arn:aws:lambda:us-west-1:1234:function:ajcwebdev-sam-HelloWorldFunction-1234   

Successfully created/updated stack - ajcwebdev-sam in us-west-1
```

Copy the URL contained in the `Value` for `HelloWorldApi` and send a request with your API tool of choice such as curl, Postman, or Insomnia.

![03-insomnia-request](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/pszrx40j3gkxxpq96dr4.png)

You can also just use a good ol' fashion web browser.

![04-browser-request](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/z57jldt0qgtdaomyigtm.png)

Since this is a simple hello world application with an unsecured API endpoint, you should consider tearing the project down unless you intend on adding addition security features. To delete the sample application that you created:

```bash
aws cloudformation delete-stack --stack-name ajcwebdev-sam
```

If you send another request to the endpoint you will receive a 500 error message.

![05-delete-stack](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ebko0fjc428rp2tyb2sj.png)
