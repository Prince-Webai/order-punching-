const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.hnjbcodnnagobiljxuja:Prince%40Gaur%40786@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=no-verify",
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const users = [
  { name: 'Sales User', email: 'sales@tnsolarsolution.com', role: 'SALESPERSON' },
  { name: 'Manager User', email: 'manager@tnsolarsolution.com', role: 'MANAGER' },
  { name: 'Admin User', email: 'admin@tnsolarsolution.com', role: 'ADMIN' },
];

async function seed() {
  try {
    await client.connect();
    console.log('Updating Supabase users to tnsolarsolution.com...');
    
    // Clear old users
    await client.query('DELETE FROM "User"');
    
    for (const user of users) {
      await client.query(
        'INSERT INTO "User" (id, name, email, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
        [crypto.randomUUID(), user.name, user.email, user.role]
      );
      console.log(`Created user: ${user.email}`);
    }
    
    console.log('Update successful!');
    await client.end();
  } catch (err) {
    console.error('Update error:', err);
    process.exit(1);
  }
}

seed();
