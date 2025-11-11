# Create Jerry Hakim SUPER_ADMIN User

This guide explains how to create the SUPER_ADMIN user for Jerry Hakim after deployment.

## User Details

- **First Name:** Jerry
- **Last Name:** Hakim
- **Email:** jerry.hakim@energi-up.com
- **Password:** Password123!
- **Role:** SUPER_ADMIN

## Option 1: Using Docker (Recommended for Production)

### Step 1: Ensure Services Are Running

```bash
# Check if services are running
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# If not running, start them
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Step 2: Wait for Database to Be Ready

```bash
# Wait for database to be ready (usually takes 10-20 seconds)
sleep 10

# Verify database is ready
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec postgres \
  pg_isready -U tas_user -d tas_db
```

### Step 3: Run the Script

```bash
# Create Jerry Hakim SUPER_ADMIN user
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  node scripts/createJerryAdmin.js
```

### Step 4: Verify User Creation

```bash
# Verify user was created (optional)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.user.findUnique({ where: { email: 'jerry.hakim@energi-up.com' } })
      .then(user => {
        if (user) {
          console.log('✅ User found:');
          console.log('   Email:', user.email);
          console.log('   Name:', user.firstName, user.lastName);
          console.log('   Role:', user.role);
          console.log('   Active:', user.isActive);
        } else {
          console.log('❌ User not found');
        }
        prisma.\$disconnect();
      });
  "
```

## Option 2: Using Local Environment (Development)

### Step 1: Ensure Database Is Running

```bash
# Start database (if using Docker)
docker-compose up -d postgres

# Or ensure your local PostgreSQL is running
```

### Step 2: Set Environment Variables

```bash
# Set DATABASE_URL in your environment
export DATABASE_URL="postgresql://tas_user:taskpn@2025@localhost:5432/tas_db?schema=public"
```

### Step 3: Run the Script

```bash
# Navigate to backend directory
cd backend

# Run the script
node scripts/createJerryAdmin.js
```

## Option 3: Manual Creation via Prisma Studio

### Step 1: Open Prisma Studio

```bash
# In Docker
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  npx prisma studio

# Or locally
cd backend
npx prisma studio
```

### Step 2: Create User Manually

1. Open Prisma Studio in browser (usually http://localhost:5555)
2. Navigate to "User" model
3. Click "Add record"
4. Fill in the fields:
   - **email:** jerry.hakim@energi-up.com
   - **firstName:** Jerry
   - **lastName:** Hakim
   - **password:** (hashed password - use bcrypt to hash "Password123!")
   - **role:** SUPER_ADMIN
   - **isActive:** true
   - **isEmailVerified:** true
   - **emailVerifiedAt:** (current date)
5. Save the record

### Step 3: Hash Password Manually

```bash
# Hash the password
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Password123!', 12).then(hash => console.log(hash));"
```

## Verification

### Test Login

After creating the user, test login:

```bash
# Test login via API
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jerry.hakim@energi-up.com",
    "password": "Password123!"
  }'
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "jerry.hakim@energi-up.com",
      "firstName": "Jerry",
      "lastName": "Hakim",
      "role": "SUPER_ADMIN"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

## Security Notes

### ⚠️ Important Security Considerations

1. **Change Password After First Login**
   - The default password is "Password123!"
   - User should change it immediately after first login
   - Consider implementing forced password change on first login

2. **Secure Password Storage**
   - Password is hashed using bcrypt (12 rounds)
   - Never store plain text passwords
   - Use environment variables for sensitive data

3. **Access Control**
   - SUPER_ADMIN role has full access to the system
   - Limit SUPER_ADMIN users to necessary personnel only
   - Regularly review user access and roles

4. **Credentials Management**
   - Store credentials securely
   - Use password managers
   - Never share credentials via unsecure channels
   - Rotate passwords regularly

## Troubleshooting

### Error: User Already Exists

If the user already exists, the script will:
- Update the user to SUPER_ADMIN role
- Reset the password to "Password123!"
- Activate the user account

### Error: Database Connection Failed

```bash
# Check if database is running
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps postgres

# Check database logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs postgres

# Verify DATABASE_URL is correct
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  node -e "console.log(process.env.DATABASE_URL)"
```

### Error: Prisma Client Not Generated

```bash
# Generate Prisma client
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  npx prisma generate
```

### Error: Permission Denied

```bash
# Check file permissions
ls -la backend/scripts/createJerryAdmin.js

# Make script executable (if needed)
chmod +x backend/scripts/createJerryAdmin.js
```

## Script Location

The script is located at:
- `backend/scripts/createJerryAdmin.js`

## Alternative: Using createUser Script

You can also use the generic createUser script:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  EMAIL=jerry.hakim@energi-up.com \
  PASSWORD=Password123! \
  ROLE=SUPER_ADMIN \
  FIRST_NAME=Jerry \
  LAST_NAME=Hakim \
  node scripts/createUser.js
```

## Post-Creation Tasks

1. **Verify User Creation**
   - Check user exists in database
   - Verify role is SUPER_ADMIN
   - Verify user is active

2. **Test Login**
   - Test login via API
   - Test login via frontend
   - Verify access to admin features

3. **Change Password**
   - User should change password after first login
   - Use strong password policy
   - Store new password securely

4. **Document Access**
   - Document user credentials (securely)
   - Update access documentation
   - Notify user of account creation

## Support

If you encounter issues:
1. Check troubleshooting section
2. Review application logs
3. Verify database connection
4. Check user permissions
5. Contact development team

---

**Last Updated:** 2025-11-11  
**Version:** 1.0.0

