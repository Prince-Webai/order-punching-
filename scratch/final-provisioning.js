const { Client } = require('pg');
const crypto = require('crypto');

const client = new Client({
  connectionString: "postgresql://postgres.hnjbcodnnagobiljxuja:Prince%40Gaur%40786@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=no-verify",
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const users = [
  { name: 'Sales Executive', email: 'sales@tnsolarsolution.com', password: 'TN@Sales786', role: 'SALESPERSON' },
  { name: 'Ops Manager', email: 'manager@tnsolarsolution.com', password: 'TN@Manager786', role: 'PROJECT_MANAGER' },
  { name: 'System Administrator', email: 'admin@tnsolarsolution.com', password: 'TN@Admin786', role: 'ADMIN' },
  { name: 'Bajaj Partner', email: 'bajaj@tnsolarsolution.com', password: 'TN@Bajaj786', role: 'LOAN_PARTNER' },
  { name: 'Internal Finance', email: 'finance@tnsolarsolution.com', password: 'TN@Finance786', role: 'LOAN_EXECUTIVE' },
  { name: 'Lead Installer', email: 'installer@tnsolarsolution.com', password: 'TN@Installer786', role: 'INSTALLER' }
];

async function seed() {
  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected! Provisioning users...');
    
    // Ensure password column exists
    await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT DEFAULT \'Prince@Gaur@786\'');
    
    // Upsert users instead of deleting (to preserve foreign key relations)
    console.log('🔄 Syncing user accounts...');
    
    for (const user of users) {
      await client.query(`
        INSERT INTO "User" (id, name, email, password, role) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          password = EXCLUDED.password,
          role = EXCLUDED.role
      `, [crypto.randomUUID(), user.name, user.email, user.password, user.role]);
      
      console.log(`✅ Synced ${user.role}: ${user.email}`);
    }
    
    console.log('🎉 Provisioning complete! All roles are now active.');
    await client.end();
  } catch (err) {
    console.error('❌ Provisioning error:', err);
    process.exit(1);
  }
}

seed();
