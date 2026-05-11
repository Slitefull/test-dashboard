import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  const admin = await prisma.authUser.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash: adminPassword, role: Role.ADMIN },
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  })

  await prisma.authUser.upsert({
    where: { email: 'user@example.com' },
    update: { passwordHash: userPassword, role: Role.USER },
    create: {
      email: 'user@example.com',
      passwordHash: userPassword,
      role: Role.USER,
    },
  })

  await prisma.ratedUser.deleteMany({})
  {
    const firstNames = [
      'Alice', 'Bohdan', 'Camille', 'Dmytro', 'Elena', 'Farhan', 'Greta',
      'Hassan', 'Ivanna', 'Jonas', 'Kira', 'Leo', 'Maya', 'Niko', 'Olena',
      'Petro', 'Quinn', 'Rosa', 'Sasha', 'Taras', 'Uma', 'Viktor', 'Wren',
      'Xenia', 'Yana', 'Zane', 'Anna', 'Bilal', 'Clara', 'Dario',
    ]
    const lastNames = [
      'Johnson', 'Koval', 'Dupont', 'Shevchenko', 'Rossi', 'Ahmed', 'Berg',
      'Mendez', 'Park', 'Nilsen', 'Okafor', 'Lopez', 'Tanaka', 'Singh',
      'Marek', 'Becker', 'Costa', 'Ivanov', 'Klein', 'Müller', 'Petrov',
      'Reyes', 'Suzuki', 'Vasquez', 'Walsh',
    ]
    const seen = new Set<string>()
    const rows: Array<{ name: string; rating: number; createdById: string }> = []
    let attempts = 0
    while (rows.length < 50 && attempts < 500) {
      attempts++
      const f = firstNames[Math.floor(Math.random() * firstNames.length)]
      const l = lastNames[Math.floor(Math.random() * lastNames.length)]
      const name = `${f} ${l}`
      if (seen.has(name)) continue
      seen.add(name)
      const rating = Math.floor(Math.random() * 101)
      rows.push({ name, rating, createdById: admin.id })
    }
    await prisma.ratedUser.createMany({ data: rows })
    console.log(`Inserted ${rows.length} rated users.`)
  }

  console.log('Seed complete.')
  console.log('  admin@example.com / admin123  (ADMIN)')
  console.log('  user@example.com  / user123   (USER)')
}

main()
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
