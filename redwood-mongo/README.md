## Setup

Create a `.env` file for the MongoDB connection string.

```terminal
touch .env
```

Create an environment variable called `DATABASE_URL` in a `.env` file with your database connection string. Example connection string:

```
DATABASE_URL=mongodb+srv://ajcwebdev:dont-steal-my-db-ill-kill-you@nailed-it.5mngs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

Install dependencies and start development server

```terminal
yarn
yarn rw dev
```

Open `http://localhost:8910/posts` to see the admin dashboard and create a post. After doing so you will see it displayed like so:

<img width="900" alt="01-redwood-admin-with-mongodb" src="https://user-images.githubusercontent.com/12433465/157195130-4efbc76b-f6e8-480f-a896-544f7da02009.png">

This should match your data in Atlas.

<img width="900" alt="02-mongodb-atlas-with-seed-data" src="https://user-images.githubusercontent.com/12433465/157194976-e1d724c0-27b8-453f-9fbe-7f9340460f76.png">

## Resources

* [MongoDB Atlas Guide](https://dev.to/ajcwebdev/can-i-use-mongodb-with-prisma-yet-50go)
* [MongoDB on Railway Guide](https://dev.to/ajcwebdev/query-a-mongodb-database-with-prisma-and-railway-ig8)
* [Redwood Tutorial Blog with MongoDB](https://github.com/thedavidprice/redwood-tutorial-mongo)
* [Issue #840, MongoDB: Create a Doc or Cookbook](https://github.com/redwoodjs/redwoodjs.com/issues/840)

## Prisma Schema

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["mongoDb"]
}

model Post {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  body      String
  createdAt DateTime @default(now())
}
```