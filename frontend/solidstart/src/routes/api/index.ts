import { json } from "solid-start"
 
export function GET() {
  return json(
    { hello: "world" }
  )
}