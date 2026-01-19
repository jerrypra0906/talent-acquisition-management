const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const logger = require('../utils/logger');

// Map frontend role names to backend enum values
function mapRoleToEnum(role) {
  if (!role) return role;
  const roleMap = {
    'SUPER_ADMIN': 'SUPER_ADMIN',
    'Management': 'CHRO', // Assuming Management maps to CHRO
    'Head of Division': 'DEPARTMENT_HEAD',
    'HRBP': 'HRBP',
    'TA_TEAM': 'TA_TEAM',
    'HIRING_MANAGER': 'HIRING_MANAGER',
    'INTERVIEWER': 'INTERVIEWER',
    'CANDIDATE': 'CANDIDATE',
  };
  const mapped = roleMap[role] || role; // Fallback to original if not in map
  if (mapped !== role) {
    logger.info(`Role mapping: "${role}" -> "${mapped}"`);
  }
  return mapped;
}

// Map backend enum values to frontend role names
function mapEnumToRole(role) {
  const roleMap = {
    'SUPER_ADMIN': 'SUPER_ADMIN',
    'CHRO': 'Management',
    'DEPARTMENT_HEAD': 'Head of Division',
    'HRBP': 'HRBP',
    'TA_TEAM': 'TA_TEAM',
    'HIRING_MANAGER': 'HIRING_MANAGER',
    'INTERVIEWER': 'INTERVIEWER',
    'CANDIDATE': 'CANDIDATE',
  };
  return roleMap[role] || role; // Fallback to original if not in map
}

function mapUser(u) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phoneNumber || null,
    role: mapEnumToRole(u.role), // Map backend enum to frontend role name
    division: u.division || '-',
    sectionName: u.department || '-', // store section in department
    pt: u.pt || null,
    area: u.area || null,
    areaDetail: u.areaDetail || null,
    isActive: u.isActive,
    lastLoginAt: u.lastLoginAt || null,
  };
}

async function listUsers(search, role) {
  const where = {};
  
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (role) {
    // Map frontend role name to backend enum
    const mappedRole = mapRoleToEnum(role);
    where.role = mappedRole;
  }
  
  const users = await prisma.user.findMany({
    where,
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
    pt,
    area,
    areaDetail,
  } = data;

  const hashed = await bcrypt.hash(password || 'DefaultPassword123!', 12);
  
  // Map role to enum value
  const mappedRole = mapRoleToEnum(role);
  logger.info(`Creating user with role: "${role}" -> mapped to: "${mappedRole}"`);
  
  // Use Prisma client to avoid enum type name mismatch issues
  // Prisma handles enum mapping correctly
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      phoneNumber: phone || null,
      role: mappedRole, // Prisma will map enum correctly
      division: division || null,
      department: sectionName || null,
      pt: pt || null,
      area: area || null,
      areaDetail: areaDetail || null,
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  
  return mapUser(user);
}

async function updateUser(id, data) {
  // Map role to enum value
  const mappedRole = mapRoleToEnum(data.role);
  
  // Use Prisma client to avoid enum type name mismatch issues
  // Prisma handles enum mapping correctly
  const updateData = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phone || null,
    role: mappedRole, // Prisma will map enum correctly
    division: data.division || null,
    department: data.sectionName || null,
    pt: data.pt || null,
    area: data.area || null,
    areaDetail: data.areaDetail || null,
  };
  
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });
  
  return mapUser(user);
}

async function updateStatus(id, isActive) {
  const user = await prisma.user.update({ where: { id }, data: { isActive } });
  return mapUser(user);
}

async function resetPassword(id, newPassword) {
  const hashed = await bcrypt.hash(newPassword || 'DefaultPassword123!', 12);
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


