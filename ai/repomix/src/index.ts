// src/index.ts

export async function greet(name: string) {
  return `Hello, ${name}`
}

console.log(await greet('World'))