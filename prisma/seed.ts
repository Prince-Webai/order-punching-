import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      name: 'John Sales',
      email: 'john@solarcrm.test',
      role: 'SALESPERSON',
    },
    {
      name: 'Sarah Manager',
      email: 'manager@solarcrm.test',
      role: 'MANAGER',
    },
    {
      name: 'Admin User',
      email: 'admin@solarcrm.test',
      role: 'ADMIN',
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
