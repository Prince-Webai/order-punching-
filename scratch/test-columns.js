const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.hnjbcodnnagobiljxuja:Prince%40Gaur%40786@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=no-verify",
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function test() {
  try {
    await client.connect();
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'User'");
    console.log('Columns in User table:', res.rows.map(r => r.column_name));
    await client.end();
  } catch (err) {
    console.error(err);
  }
}

test();
