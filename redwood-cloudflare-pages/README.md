# Deploy RedwoodJS Web Side with Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com/) is a Jamstack platform for frontend developers to collaborate and deploy websites. It's a lot like `{{ insert_favorite_Jamstack_host }}`. Simply connect to a GitHub repo, supply the necessary build commands and publish directories, and deploy your site to the world with just `git push`.

At this time it is not yet possible to [deploy the Redwood `api` with Cloudflare Workers](https://community.redwoodjs.com/t/running-redwoodjs-on-cloudflare-workers/2013/2). However, we can simply [delete the `api` directory](https://redwoodjs.com/cookbook/disable-api-database) and deploy just the `web` side.

## Create a Redwood App

The code for this article can be found [on my GitHub](https://github.com/ajcwebdev/redwood-cloudflare-pages).

```bash
yarn create redwood-app redwood-cloudflare-pages
cd redwood-cloudflare-pages
```

### Delete `api` directory

```bash
rm -rf api
```

### Generate home page

```bash
yarn rw g page home /
```

Include the following in `HomePage.js`.

```jsx
const HomePage = () => {
  return (
    <>
      <h1>Redwood+Cloudflare Pages 🚀</h1>
      <p>Woot!</p>
    </>
  )
}

export default HomePage
```

### Start development server

```bash
yarn rw dev
```

![01-home-page](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/gydskwsvcrqggh06t8nu.png)

## Create GitHub Repo

Create a [blank repository](https://repo.new/) on GitHub with the same name as your Redwood project.

### Initialize repository

Initialize a git repo in your newly created Redwood project.

```bash
git init
git add .
git commit -m "Nailed it"
git branch -M main
```

### Add remote to project

Make sure to use your own repo when setting the remote.

```bash
git remote add origin https://github.com/ajcwebdev/redwood-cloudflare-pages.git
```

### Push to main

```bash
git push -u origin main
```

## Connect GitHub repo to Cloudflare Pages

Sign up for [Cloudflare Pages](https://pages.cloudflare.com/).

![01-cloudflare-pages-dashboard](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/a8v738niu7rzglxdhey3.png)

Click "Create a project."

![02-connect-git-repository](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/acazjqgeohulu708dh2l.png)

Select your Redwood project and click the "Begin setup" button at the bottom.

![03-setup-build-and-deploy](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/rdy6btnz50g4xsj9oc94.png)

Your project name and production branch will be set automatically.

![04-blank-build-settings](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/62o3bczyjj7qrco8x1qi.png)

The build settings are blank. Enter:
* `yarn rw build web` for the build command
* `web/dist` for the build output directory

![05-redwood-build-commands](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ev5cv0w59kawhbagre21.png)

Click "Save and deploy."

![06-initializing-build](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/t1gvisf2yie9bopvr9hj.png)

Go take a nice long walk around the block, grab some coffee, take out your dry cleaning, file your taxes, complete that 10,000 piece puzzle you've been putting off, and then come back and your website build should be done.

![07-build-and-deployment-settings](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/78g9mstln40tjwjvndpq.png)

Once the build finishes you will see the build and deployment settings at the bottom and a link to your site at the top.

![08-success-site-built-and-deployed](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4ak5b7kse23ebhmnoke9.png)

Click the link to [redwood-cloudflare-pages.pages.dev](https://redwood-cloudflare-pages.pages.dev/) and you should see the following page.

![09-redwood-cloudflare-pages-deployed](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0pgiq37mfzk9gkuk8uqo.png)
