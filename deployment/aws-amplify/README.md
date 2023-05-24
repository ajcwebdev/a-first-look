# Example Project from [A First Look at Amplify with Vite](https://ajcwebdev.com/2021/05/09/a-first-look-at-amplify-with-vite/)

[AWS Amplify](https://aws.amazon.com/amplify/) is a set of tools and services to help frontend web and mobile developers build scalable fullstack applications with AWS infrastructure.

## Clone Repo and Navigate to Project

```bash
git clone https://github.com/ajcwebdev/a-first-look.git
cd deployment/aws-amplify
```

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

### Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
```

### Start development server

```bash
yarn
yarn dev
```

![01-create-vite-app](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fdvsb936oo4qlhq2fw12.png)

### App component

```jsx
// src/App.jsx

import React from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img
          src={logo}
          className="App-logo"
          alt="logo"
        />

        <p>ajcwebdev</p>

        <p>Amplify + Vite</p>

        <p>
          <a
            className="App-link"
            href="https://dev.to/ajcwebdev"
            target="_blank"
            rel="noopener noreferrer"
          >
            Blog
          </a>

          {' | '}

          <a
            className="App-link"
            href="https://github.com/ajcwebdev"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </header>
    </div>
  )
}

export default App
```

![02-create-vite-app-edited](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qh6elff8oc10tnywje4w.png)

## Initialize Amplify project with `amplify init`

To initialize a new Amplify project, run `amplify init` from the root directory of your frontend app.

```bash
amplify init
```

```
? Enter a name for the project: ajcwebdevamplify
? Enter a name for the environment: dev
? Choose your default editor: Visual Studio Code
? Choose the type of app that you're building: javascript

Please tell us about your project
? What javascript framework are you using: react
? Source Directory Path:  src
? Distribution Directory Path: dist
? Build Command: yarn build
? Start Command: yarn dev

Using default provider: awscloudformation

? Select the authentication method you want to use: AWS profile

For more information on AWS Profiles, see:
https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html

? Please choose the profile you want to use: default
```

## Deploy to hosting with CloudFront and S3 with `amplify publish`

```bash
amplify add hosting
```

```
? Select the plugin module to execute: Amazon CloudFront and S3
? Select the environment setup: DEV (S3 only with HTTP)
? hosting bucket name: ajcwebdevamplify-20210509181751-hostingbucket
? index doc for the website: index.html
? error doc for the website: index.html

You can now publish your app using the following command:
Command: amplify publish
```

```bash
amplify publish
```

```
✔ Successfully pulled backend environment dev from the cloud.

Current Environment: dev

| Category | Resource name   | Operation | Provider plugin   |
| -------- | --------------- | --------- | ----------------- |
| Hosting  | S3AndCloudFront | Create    | awscloudformation |

? Are you sure you want to continue? Yes
```

You will then be taken to the [very memorably named endpoint](http://ajcwebdevamplify-20210509181751-hostingbucket-dev.s3-website-us-west-1.amazonaws.com/) for your S3 bucket.

![03-create-vite-app-hosted](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5efaiwxvekngq4uhii7w.png)