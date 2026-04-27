/**
 * Promote an existing user to SUPER_ADMIN by email.
 * Usage: node scripts/promoteToSuperAdmin.js <email>
 *    or:  PROMOTE_EMAIL=you@x.com node scripts/promoteToSuperAdmin.js
 * Requires DATABASE_URL in backend/.env and run from backend/: cd backend && node scripts/promoteToSuperAdmin.js …
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const emailArg = (process.argv[2] || process.env.PROMOTE_EMAIL || '').trim();
  if (!emailArg) {
    console.error('Usage: node scripts/promoteToSuperAdmin.js <email>');
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: emailArg, mode: 'insensitive' } },
  });

  if (!user) {
    console.error(`No user found with email: ${emailArg}`);
    process.exit(1);
  }

  if (user.role === 'SUPER_ADMIN') {
    console.log(`User ${user.email} is already SUPER_ADMIN.`);
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'SUPER_ADMIN' },
    select: { email: true, role: true, firstName: true, lastName: true },
  });

  console.log('Updated to SUPER_ADMIN:', updated);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
