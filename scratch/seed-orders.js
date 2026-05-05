const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.hnjbcodnnagobiljxuja:Prince%40Gaur%40786@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=no-verify",
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function seedOrders() {
  try {
    await client.connect();
    console.log('Seeding sample orders for charts...');
    
    // Get the sales user
    const userRes = await client.query('SELECT id FROM "User" WHERE email = $1', ['sales@tnsolarsolution.com']);
    if (userRes.rows.length === 0) {
      console.error('Sales user not found. Please seed users first.');
      process.exit(1);
    }
    const salesUserId = userRes.rows[0].id;
    
    // Sample orders
    const orders = [
      { clientName: 'Amit Sharma', amount: 450000, size: 5.0, stage: 'ORDER' },
      { clientName: 'Priya Patel', amount: 720000, size: 8.2, stage: 'DOC_VERIFICATION' },
      { clientName: 'Rajesh Kumar', amount: 310000, size: 3.5, stage: 'EB_NET_METER' },
      { clientName: 'Sanjay Singh', amount: 580000, size: 6.5, stage: 'INSTALLATION' },
      { clientName: 'Vikram Mehta', amount: 940000, size: 10.0, stage: 'SHIPMENT' },
    ];
    
    for (const order of orders) {
      await client.query(
        'INSERT INTO "Order" (id, "salespersonId", "clientName", "mobileNumber", "emailId", "systemSizeKw", "quotationAmount", "paymentType", "currentStage", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())',
        [crypto.randomUUID(), salesUserId, order.clientName, '9876543210', 'client@example.com', order.size, order.amount, 'FULL_PAYMENT', order.stage]
      );
      console.log(`Created order for: ${order.clientName}`);
    }
    
    console.log('Order seeding successful!');
    await client.end();
  } catch (err) {
    console.error('Order seeding error:', err);
    process.exit(1);
  }
}

seedOrders();
