const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUpdate() {
  try {
    const order = await prisma.order.findFirst();
    if (!order) {
      console.log("No orders found to test.");
      return;
    }
    
    console.log("Found order:", order.id, "Current Sub-stage:", order.loanSubStage);
    
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        loanStage: 'PRE_SALES',
        loanSubStage: 'Eligibility came'
      }
    });
    
    console.log("Updated order:", updated.id, "New Sub-stage:", updated.loanSubStage);
    
    const verified = await prisma.order.findUnique({ where: { id: order.id } });
    console.log("Verified from DB:", verified.loanSubStage);
    
    if (verified.loanSubStage === 'Eligibility came') {
      console.log("SUCCESS: Database is persisting data correctly.");
    } else {
      console.log("FAILURE: Database did NOT persist the change.");
    }
  } catch (err) {
    console.error("ERROR during update:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testUpdate();
