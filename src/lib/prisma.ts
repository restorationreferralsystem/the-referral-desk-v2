// Prisma client singleton for Next.js development mode
// The PrismaClient is generated from the schema by `npx prisma generate`

let prismaInstance: any

const globalForPrisma = global as unknown as { prisma: any }

if (process.env.NODE_ENV === 'production') {
  // In production, require the generated client directly
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client')
  prismaInstance = new PrismaClient()
} else {
  // In development, use the singleton pattern to prevent multiple instances
  if (!globalForPrisma.prisma) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('@prisma/client')
    globalForPrisma.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
  prismaInstance = globalForPrisma.prisma
}

export const prisma = prismaInstance
