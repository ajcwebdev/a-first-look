// db/query.ts

import { Database } from "bun:sqlite"

async function main() {
  const db = new Database('mydb.sqlite')
  const query = db.query("SELECT * FROM hello")
  const greetings = await query.all()
  const firstGreeting = await query.get()
  console.log(
    "Greetings Array:\n", JSON.stringify(greetings),
    "\n\nFirst Greeting:\n", JSON.stringify(firstGreeting)
  )
  db.close()
}

main()