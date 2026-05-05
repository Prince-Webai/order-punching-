const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.hnjbcodnnagobiljxuja:Prince%40Gaur%40786@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=no-verify",
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function check() {
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM "User" WHERE email = $1', ['admin@tnsolarsolution.com']);
    console.log('Admin user in DB:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error(err);
  }
}

check();
