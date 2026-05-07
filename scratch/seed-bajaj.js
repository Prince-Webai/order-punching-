const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bajajUser = await prisma.user.upsert({
    where: { email: 'bajaj@tnsolarsolution.com' },
    update: {
      role: 'LOAN_PARTNER',
      password: 'Bajaj@Prince@786'
    },
    create: {
      email: 'bajaj@tnsolarsolution.com',
      name: 'Bajaj Finance Executive',
      role: 'LOAN_PARTNER',
      password: 'Bajaj@Prince@786'
    }
  });

  console.log('Created Bajaj User:', bajajUser);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
