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

  // Replace sqlite provider with postgresql for production
  if (content.includes('provider = "sqlite"')) {
    console.log('🔌 Switching database provider in schema.prisma from SQLite to PostgreSQL for production deployment...');
    content = content.replace('provider = "sqlite"', 'provider = "postgresql"');
    fs.writeFileSync(SCHEMA_PATH, content, 'utf8');
    console.log('✅ schema.prisma updated successfully.');
  } else {
    console.log('ℹ️ Database provider is already set to PostgreSQL (or not SQLite). No changes needed.');
  }

  // Generate Prisma client for PostgreSQL
  console.log('⚙️ Generating Prisma Client for PostgreSQL...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated successfully.');
  } catch (error) {
    console.error('❌ Failed to generate Prisma Client:', error);
    process.exit(1);
  }
}

main();
