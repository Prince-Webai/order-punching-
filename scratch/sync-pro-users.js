const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      name: 'Admin User',
      email: 'admin@tnsolarsolution.com',
      password: 'TN@Admin786',
      role: 'ADMIN'
    },
    {
      name: 'Manager User',
      email: 'manager@tnsolarsolution.com',
      password: 'TN@Manager786',
      role: 'PROJECT_MANAGER'
    },
    {
      name: 'Sales User',
      email: 'sales@tnsolarsolution.com',
      password: 'TN@Sales786',
      role: 'SALESPERSON'
    }
  ];

  console.log('Syncing professional credentials...');

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { password: user.password, role: user.role },
      create: user
    });
  }

  console.log('✅ Credentials synced successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
