// db/seed.ts

import { Database } from "bun:sqlite"

async function main() {
  const db = new Database('mydb.sqlite', { create: true })
  await db.run("CREATE TABLE hello (greeting TEXT)")
  await db.run("INSERT INTO hello VALUES (?)", "Hello from Bun")
  await db.run("INSERT INTO hello VALUES (?)", "Hello from SQLite")
  db.close()
}

main()