const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('No users found');
    return;
  }
  
  const firstUser = users[0];
  console.log(`Reassigning all orders to: ${firstUser.name} (${firstUser.role})`);
  
  const updated = await prisma.order.updateMany({
    data: {
      salespersonId: firstUser.id
    }
  });
  
  console.log(`Updated ${updated.count} orders.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
