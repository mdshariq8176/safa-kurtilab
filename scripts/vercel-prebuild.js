// scripts/vercel-prebuild.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');

function main() {
  console.log('🔄 Running Vercel prebuild hook...');
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error('❌ schema.prisma not found at:', SCHEMA_PATH);
    process.exit(1);
  }

  let content = fs.readFileSync(SCHEMA_PATH, 'utf8');

  // Only replace sqlite provider with postgresql when building on Vercel
  if (process.env.VERCEL && content.includes('provider = "sqlite"')) {
    console.log('🔌 Switching database provider in schema.prisma from SQLite to PostgreSQL for Vercel production deployment...');
    content = content.replace('provider = "sqlite"', 'provider = "postgresql"');
    fs.writeFileSync(SCHEMA_PATH, content, 'utf8');
    console.log('✅ schema.prisma updated successfully.');
  } else {
    console.log('ℹ️ Running in local development environment (SQLite preserved).');
  }

  // Generate Prisma client for PostgreSQL
  console.log('⚙️ Generating Prisma Client for PostgreSQL...');
  try {
    const prismaBin = process.platform === 'win32'
      ? path.join(__dirname, '../node_modules/.bin/prisma.cmd')
      : path.join(__dirname, '../node_modules/.bin/prisma');

    if (fs.existsSync(prismaBin)) {
      execSync(`"${prismaBin}" generate`, { stdio: 'inherit' });
    } else {
      execSync('npx prisma generate', { stdio: 'inherit', shell: true });
    }
    console.log('✅ Prisma Client generated successfully.');
  } catch (error) {
    console.warn('⚠️ Warning during Prisma Client generation:', error.message || error);
  }
}

main();

