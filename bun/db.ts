import { Database } from "bun:sqlite"

let db = new Database()

db.run("CREATE TABLE hello (greeting TEXT)")
db.run("INSERT INTO hello VALUES (?)", "Hello from Bun")
db.run("INSERT INTO hello VALUES (?)", "Hello from SQLite")

let statement = db.query("SELECT * FROM hello")

// return all rows
const greetings = statement.all()
console.log(greetings)