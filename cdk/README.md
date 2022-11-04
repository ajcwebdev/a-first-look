AWS [Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/) is a software development framework for defining cloud infrastructure in code and provisioning it through AWS [CloudFormation](https://aws.amazon.com/cloudformation/). It supports TypeScript, JavaScript, Python, Java, C#/.Net, and (almost) Go.

Developers can use one of the supported programming languages to define reusable cloud components known as ***Constructs*** that are composed together into ***Stacks*** and ***Apps***.

![01-constructs](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/n0mrliwpxev3ai1mba1n.png)

This is a project for JavaScript development with CDK. The `cdk.json` file tells the CDK Toolkit how to execute your app. The build step is not required when using JavaScript.

## Useful commands

 * `npm run test`         perform the jest unit tests
 * `cdk deploy`           deploy this stack to your default AWS account/region
 * `cdk diff`             compare deployed stack with current state
 * `cdk synth`            emits the synthesized CloudFormation template

## Setup

You can recreate this same project from scratch with the following instructions. See my blog post [a first look at aws cdk](https://dev.to/ajcwebdev/a-first-look-at-aws-cdk-2036) for a more in depth tutorial.

### Configure AWS CLI with `aws configure`

Make sure you have the [AWS CLI](https://aws.amazon.com/cli/) installed and an [AWS account](https://aws.amazon.com/).

```bash
aws configure
```

Go to [My Security Credentials](https://console.aws.amazon.com/iam/home?#/security_credentials) to find your Access Key ID, Secret Access Key, and default region. You can leave the output format blank.

### Install aws-cdk

```bash
npm install -g aws-cdk
```

### Create project directory

```bash
mkdir hello-cdk
cd hello-cdk
```

### Initialize project with `cdk init`

```bash
cdk init app --language javascript
```

### Add S3 bucket

```bash
npm install @aws-cdk/aws-s3
```

## Project code

### package.json

```json
{
  "name": "hello-cdk",
  "version": "0.1.0",
  "bin": {
    "hello-cdk": "bin/hello-cdk.js"
  },
  "scripts": {
    "build": "echo \"The build step is not required when using JavaScript!\" && exit 0",
    "cdk": "cdk",
    "test": "jest"
  },
  "devDependencies": {
    "@aws-cdk/assert": "1.101.0",
    "aws-cdk": "1.101.0",
    "jest": "^26.4.2"
  },
  "dependencies": {
    "@aws-cdk/aws-s3": "^1.101.0",
    "@aws-cdk/core": "1.101.0"
  }
}
```

### cdk.json

```json
{
  "app": "node bin/hello-cdk.js",
  "context": {
    "@aws-cdk/aws-apigateway:usagePlanKeyOrderInsensitiveId": true,
    "@aws-cdk/core:enableStackNameDuplicates": "true",
    "aws-cdk:enableDiffNoFail": "true",
    "@aws-cdk/core:stackRelativeExports": "true",
    "@aws-cdk/aws-ecr-assets:dockerIgnoreSupport": true,
    "@aws-cdk/aws-secretsmanager:parseOwnedSecretName": true,
    "@aws-cdk/aws-kms:defaultKeyPolicies": true,
    "@aws-cdk/aws-s3:grantWriteWithoutAcl": true,
    "@aws-cdk/aws-ecs-patterns:removeDefaultDesiredCount": true,
    "@aws-cdk/aws-rds:lowercaseDbIdentifier": true,
    "@aws-cdk/aws-efs:defaultEncryptionAtRest": true
  }
}
```

### hello-cdk.js

```javascript
// bin/hello-cdk.js

#!/usr/bin/env node

const cdk = require('@aws-cdk/core')
const { HelloCdkStack } = require('../lib/hello-cdk-stack')

const app = new cdk.App()

new HelloCdkStack(
  app, 'HelloCdkStack', {}
)
```

### hello-cdk-stack.js

```javascript
// lib/hello-cdk-stack.js

const cdk = require('@aws-cdk/core');
const s3 = require('@aws-cdk/aws-s3');

class HelloCdkStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    new s3.Bucket(this, 'MyFirstBucket', {
      versioned: true
    });
  }
}

module.exports = { HelloCdkStack }
```

## Deploy to AWS

### Generate CloudFormation template with `cdk synth`

```bash
cdk synth
```

```yaml
Resources:
  MyFirstBucketB8884501:
    Type: AWS::S3::Bucket
    Properties:
      VersioningConfiguration:
        Status: Enabled
    UpdateReplacePolicy: Retain
    DeletionPolicy: Retain
    Metadata:
      aws:cdk:path: HelloCdkStack/MyFirstBucket/Resource
  CDKMetadata:
    Type: AWS::CDK::Metadata
    Metadata:
      aws:cdk:path: HelloCdkStack/CDKMetadata/Default
    Condition: CDKMetadataAvailable
Conditions:
  CDKMetadataAvailable:
    Fn::Or:
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - af-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ca-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-northwest-1
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-2
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-3
          - Fn::Equals:
              - Ref: AWS::Region
              - me-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - sa-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-2
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-2
```

### Deploy the stack with `cdk deploy`

```bash
cdk deploy
```
