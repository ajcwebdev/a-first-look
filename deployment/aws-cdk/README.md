# Example Project from [A First Look at CDK](https://ajcwebdev.com/2021/04/30/a-first-look-at-aws-cdk)

AWS [Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/) is a software development framework for defining cloud infrastructure in code and provisioning it through AWS [CloudFormation](https://aws.amazon.com/cloudformation/). It supports TypeScript, JavaScript, Python, Java, C#/.Net, and (almost) Go.

Developers can use one of the supported programming languages to define reusable cloud components known as ***Constructs*** that are composed together into ***Stacks*** and ***Apps***.

This is a project for JavaScript development with CDK. The `cdk.json` file tells the CDK Toolkit how to execute your app. The build step is not required when using JavaScript.

![01-constructs](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/n0mrliwpxev3ai1mba1n.png)

## Clone Repo and Navigate to Project

```bash
git clone https://github.com/ajcwebdev/a-first-look.git
cd deployment/aws-cdk
```

## Setup

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

## Deploy to AWS

### Generate CloudFormation template with `cdk synth`

```bash
cdk synth
```

### Deploy the stack with `cdk deploy`

```bash
cdk deploy
```