const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.findFirst();
  if (order) {
    await prisma.document.create({
      data: {
        orderId: order.id,
        documentType: 'SITE_PHOTO',
        fileUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=400'
      }
    });
    console.log('Mock document created for order:', order.id);
  } else {
    console.log('No order found to attach document to.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
