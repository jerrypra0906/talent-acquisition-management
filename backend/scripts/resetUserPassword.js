const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.EMAIL;
  const newPassword = process.env.PASSWORD;

  if (!email) {
    console.error('❌ EMAIL environment variable is required');
    console.error('   Usage: EMAIL=user@example.com PASSWORD=secure-password node scripts/resetUserPassword.js');
    process.exit(1);
  }

  if (!newPassword) {
    console.error('❌ PASSWORD environment variable is required');
    console.error('   Usage: EMAIL=user@example.com PASSWORD=secure-password node scripts/resetUserPassword.js');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        failedLoginCount: 0,
        lockedUntil: null,
        isActive: true,
        emailVerifiedAt: user.emailVerifiedAt || new Date(),
        isEmailVerified: true,
      },
    });

    console.log('✅ Password reset');
    console.log('📧 Email:', email);
    console.log('🔑 New Password:', newPassword);
  } catch (err) {
    console.error('❌ Failed to reset password:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();


