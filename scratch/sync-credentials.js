const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: 'admin@tnsolarsolution.com', name: 'System Administrator', role: 'ADMIN', password: 'TN@Admin786' },
    { email: 'manager@tnsolarsolution.com', name: 'Ops Manager', role: 'PROJECT_MANAGER', password: 'TN@Manager786' },
    { email: 'sales@tnsolarsolution.com', name: 'Sales Executive', role: 'SALESPERSON', password: 'TN@Sales786' },
    { email: 'bajaj@tnsolarsolution.com', name: 'Bajaj Partner', role: 'LOAN_PARTNER', password: 'TN@Bajaj786' },
    { email: 'finance@tnsolarsolution.com', name: 'Internal Finance', role: 'LOAN_EXECUTIVE', password: 'TN@Finance786' },
    { email: 'installer@tnsolarsolution.com', name: 'Lead Installer', role: 'INSTALLER', password: 'TN@Installer786' }
  ];

  console.log('🚀 Starting user synchronization...');

  for (const user of users) {
    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: { 
        name: user.name, 
        role: user.role, 
        password: user.password 
      },
      create: user
    });
    console.log(`✅ Synced: ${result.email} [${result.role}]`);
  }

  console.log('🎉 All users synchronized successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error syncing users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
