const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.hnjbcodnnagobiljxuja:Prince%40Gaur%40786@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=no-verify",
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function test() {
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected!');
    const res = await client.query('SELECT current_user');
    console.log('Current user:', res.rows[0].current_user);
    
    // Test if we can see tables
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', tables.rows.map(r => r.table_name));
    
    await client.end();
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

test();
