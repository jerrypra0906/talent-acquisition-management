const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

function mapUser(u) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phoneNumber || null,
    role: u.role,
    division: u.division || '-',
    sectionName: u.department || '-', // store section in department
    isActive: u.isActive,
    lastLoginAt: u.lastLoginAt || null,
  };
}

async function listUsers(search) {
  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {},
    orderBy: { createdAt: 'desc' },
  });
  return users.map(mapUser);
}

async function createUser(data) {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    division,
    sectionName,
  } = data;

  // Use environment variable for default password, require explicit password if not set
  const defaultPassword = process.env.DEFAULT_USER_PASSWORD;
  if (!password && !defaultPassword) {
    throw new Error('Password is required. DEFAULT_USER_PASSWORD environment variable must be set for default passwords.');
  }
  const hashed = await bcrypt.hash(password || defaultPassword, 12);
  
  // Use raw SQL to avoid Prisma enum case sensitivity issues
  // Escape single quotes in string values
  const escapeSql = (str) => (str || '').replace(/'/g, "''");
  const sql = `
    INSERT INTO users (id, email, password, "firstName", "lastName", "phoneNumber", role, division, department, "isActive", "isEmailVerified", "emailVerifiedAt", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      '${escapeSql(email)}',
      '${escapeSql(hashed)}',
      '${escapeSql(firstName)}',
      '${escapeSql(lastName)}',
      ${phone ? `'${escapeSql(phone)}'` : 'NULL'},
      '${escapeSql(role)}'::userrole,
      ${division ? `'${escapeSql(division)}'` : 'NULL'},
      ${sectionName ? `'${escapeSql(sectionName)}'` : 'NULL'},
      true,
      true,
      NOW(),
      NOW(),
      NOW()
    )
    RETURNING *
  `;
  const result = await prisma.$queryRawUnsafe(sql);
  return mapUser(result[0]);
}

async function updateUser(id, data) {
  // Use raw SQL to avoid Prisma enum case sensitivity issues
  // Escape single quotes in string values
  const escapeSql = (str) => (str || '').replace(/'/g, "''");
  const sql = `
    UPDATE users 
    SET "firstName" = '${escapeSql(data.firstName)}',
        "lastName" = '${escapeSql(data.lastName)}',
        email = '${escapeSql(data.email)}',
        "phoneNumber" = ${data.phone ? `'${escapeSql(data.phone)}'` : 'NULL'},
        role = '${escapeSql(data.role)}'::userrole,
        division = ${data.division ? `'${escapeSql(data.division)}'` : 'NULL'},
        department = ${data.sectionName ? `'${escapeSql(data.sectionName)}'` : 'NULL'},
        "updatedAt" = NOW()
    WHERE id = '${escapeSql(id)}'
    RETURNING *
  `;
  const result = await prisma.$queryRawUnsafe(sql);
  return mapUser(result[0]);
}

async function updateStatus(id, isActive) {
  const user = await prisma.user.update({ where: { id }, data: { isActive } });
  return mapUser(user);
}

async function resetPassword(id, newPassword) {
  // Require explicit password - no default fallback for security
  if (!newPassword) {
    throw new Error('New password is required');
  }
  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id },
    data: { password: hashed, failedLoginCount: 0, lockedUntil: null },
  });
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  updateStatus,
  resetPassword,
};


