import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      name: 'Admin',
      email: 'admin@tnsolarsolution.com',
      role: 'ADMIN',
      password: 'Prince@Gaur@786',
    },
    {
      name: 'Sales',
      email: 'sales@tnsolarsolution.com',
      role: 'SALESPERSON',
      password: 'Prince@Gaur@786',
    },
    {
      name: 'Manager',
      email: 'manager@tnsolarsolution.com',
      role: 'MANAGER',
      password: 'Prince@Gaur@786',
    },
  ];

  console.log('Seeding users...');

  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`Created user: ${createdUser.name} (${createdUser.role})`);
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
