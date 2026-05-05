const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.hnjbcodnnagobiljxuja:Prince%40Gaur%40786@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=no-verify",
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const users = [
  { name: 'John Sales', email: 'john@solarcrm.test', role: 'SALESPERSON' },
  { name: 'Sarah Manager', email: 'manager@solarcrm.test', role: 'MANAGER' },
  { name: 'Admin User', email: 'admin@solarcrm.test', role: 'ADMIN' },
];

async function seed() {
  try {
    await client.connect();
    console.log('Connected to Supabase for seeding...');
    
    for (const user of users) {
      await client.query(
        'INSERT INTO "User" (id, name, email, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) ON CONFLICT (email) DO NOTHING',
        [crypto.randomUUID(), user.name, user.email, user.role]
      );
      console.log(`Ensured user exists: ${user.name}`);
    }
    
    console.log('Seeding successful!');
    await client.end();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
