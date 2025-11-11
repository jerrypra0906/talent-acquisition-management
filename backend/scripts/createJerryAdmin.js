const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createJerryAdmin() {
  try {
    const email = 'jerry.hakim@energi-up.com';
    const password = 'Password123!';
    const firstName = 'Jerry';
    const lastName = 'Hakim';
    const role = 'SUPER_ADMIN';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('⚠️  User already exists:', email);
      console.log('🔄 Updating user to SUPER_ADMIN role...');
      
      // Update existing user to SUPER_ADMIN
      const hashedPassword = await bcrypt.hash(password, 12);
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          firstName,
          lastName,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          failedLoginCount: 0,
          lockedUntil: null,
        },
      });

      console.log('✅ User updated successfully!');
      console.log('📧 Email:', updatedUser.email);
      console.log('👤 Name:', `${updatedUser.firstName} ${updatedUser.lastName}`);
      console.log('🔑 Role:', updatedUser.role);
      console.log('🆔 User ID:', updatedUser.id);
      console.log('⚠️  Password has been reset to: Password123!');
      return;
    }

    // Create new user
    console.log('📝 Creating new SUPER_ADMIN user...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Use raw SQL to avoid Prisma enum issues
    const now = new Date();
    await prisma.$executeRawUnsafe(
      `INSERT INTO users (id, email, password, "firstName", "lastName", "phoneNumber", role, division, department, "isActive", "isEmailVerified", "emailVerifiedAt", "lastLoginAt", "failedLoginCount", "lockedUntil", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6::userrole, $7, $8, true, true, $9, NULL, 0, NULL, $10, $10)`,
      email,
      hashedPassword,
      firstName,
      lastName,
      null, // phoneNumber
      role,
      null, // division
      null, // department
      now,
      now
    );

    // Get the created user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log('✅ SUPER_ADMIN user created successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', `${user.firstName} ${user.lastName}`);
    console.log('🔑 Role:', user.role);
    console.log('🆔 User ID:', user.id);
    console.log('🔐 Password: Password123!');
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    console.log('⚠️  Store the credentials securely!');

  } catch (error) {
    console.error('❌ Error creating/updating user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createJerryAdmin();

