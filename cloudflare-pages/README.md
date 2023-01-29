# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

* `yarn start` - Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
* `yarn test` - Launches the test runner in the interactive watch mode.
* `yarn build` - Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.
* `yarn eject` - If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

# Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com/) is a Jamstack platform for frontend developers to collaborate and deploy websites. You can replicate this repo by following these steps:

## Create a React app

```bash
npx create-react-app ajcwebdev-cfpages
cd ajcwebdev-cfpages
```

Create a [blank repository](https://repo.new/) on GitHub with the same name as your React project.

```bash
git branch -M main
git remote add origin https://github.com/ajcwebdev/ajcwebdev-cfpages.git
git push -u origin main
```

Sign up for [Cloudflare Pages](https://pages.cloudflare.com/).

![01-cloudflare-pages-dashboard](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/a8v738niu7rzglxdhey3.png)

Click "Create a project."

![02-connect-git-repository](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/acazjqgeohulu708dh2l.png)

Select your React project and click the "Begin setup" button at the bottom.

![03-setup-build-and-deploy](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1vt3zcziu2383nag0wlm.png)

Your project name and production branch will be set automatically.

![04-blank-build-settings](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/62o3bczyjj7qrco8x1qi.png)

The build settings are blank, but you can select the Create React App framework preset for the build command and publish directory.

![05-create-react-app-framework-preset](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/gn7nuygoqcbossy4bmzf.png)

Click "Save and deploy."

![06-initializing-build](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/t1gvisf2yie9bopvr9hj.png)

Once the build finishes you will see the build and deployment settings at the bottom.

![07-build-and-deployment-settings](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hztevixwe7gsyootr8w9.png)

You will also see a link to your site at the top.

![08-success-site-built-and-deployed](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yzvu77r1f15ydwt00snf.png)

Click the link to [ajcwebdev-cfpages.pages.dev](https://ajcwebdev-cfpages.pages.dev/) and you should see the following page.

![09-ajcwebdev-cfpages-deployed](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/thmui679mlk2se7japsb.png)
