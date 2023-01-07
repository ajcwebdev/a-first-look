import pkg from '@prisma/client'
const { PrismaClient } = pkg
const prisma = new PrismaClient()

async function main() {
  await prisma.$connect()

  const posts = await prisma.post.findMany()

  console.dir(posts, { depth: Infinity })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())