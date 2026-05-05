const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.hnjbcodnnagobiljxuja:Prince%40Gaur%40786@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=no-verify",
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function fix() {
  try {
    await client.connect();
    console.log('Fixing schema...');
    
    // Add missing columns if they don't exist
    await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    
    console.log('Schema fixed!');
    await client.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
