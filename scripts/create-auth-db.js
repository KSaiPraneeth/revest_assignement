/**
 * Creates auth_db for auth-service (requires postgres superuser password).
 *
 * PowerShell:
 *   $env:PGPASSWORD="YOUR_POSTGRES_PASSWORD"
 *   node scripts/create-auth-db.js
 *
 * Git Bash:
 *   PGPASSWORD=YOUR_POSTGRES_PASSWORD node scripts/create-auth-db.js
 */

const path = require('path');

// Use pg from auth-service (already installed)
const { Client } = require(
  path.join(__dirname, '../backend/auth-service/node_modules/pg'),
);

async function main() {
  const password = process.env.PGPASSWORD;

  if (!password) {
    console.error('\nMissing PGPASSWORD environment variable.\n');
    console.error('PowerShell:');
    console.error('  $env:PGPASSWORD="your_postgres_password"');
    console.error('  node scripts/create-auth-db.js\n');
    console.error('Use the password you set when installing PostgreSQL 16.\n');
    process.exit(1);
  }

  const admin = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password,
    database: 'postgres',
  });

  await admin.connect();

  const exists = await admin.query(
    `SELECT 1 FROM pg_database WHERE datname = 'auth_db'`,
  );

  if (exists.rowCount) {
    console.log('auth_db already exists — nothing to do.');
  } else {
    await admin.query('CREATE DATABASE auth_db OWNER revest');
    console.log('Created database: auth_db');
  }

  await admin.end();

  const authDb = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password,
    database: 'auth_db',
  });

  await authDb.connect();
  await authDb.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await authDb.end();

  console.log('uuid-ossp extension ready.');
  console.log('\nRestart auth-service: cd backend/auth-service && npm run start:dev');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  if (err.message.includes('password authentication failed')) {
    console.error('\nWrong postgres password. Use the one from PostgreSQL installation.');
  }
  process.exit(1);
});
