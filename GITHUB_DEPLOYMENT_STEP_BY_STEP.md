# GitHub Deployment - Step by Step (With Git Installation)

## Step 1: Install Git

### Option A: Install Git for Windows (Command Line)

1. **Download Git:**
   - Go to: https://git-scm.com/download/win
   - Click "Download for Windows"
   - Save the installer file

2. **Install Git:**
   - Run the installer (e.g., `Git-2.43.0-64-bit.exe`)
   - Click "Next" through the installation wizard
   - **Important:** Select "Git from the command line and also from 3rd-party software" for PATH
   - Click "Install"
   - Wait for installation to complete
   - Click "Finish"

3. **Verify Installation:**
   - **Close PowerShell completely** (important!)
   - **Open a new PowerShell window**
   - Run: `git --version`
   - You should see: `git version 2.43.0` (or similar)

### Option B: Install GitHub Desktop (Easier - Graphical Interface)

1. **Download GitHub Desktop:**
   - Go to: https://desktop.github.com/
   - Click "Download for Windows"
   - Save the installer file

2. **Install GitHub Desktop:**
   - Run the installer
   - Follow the installation wizard
   - Sign in with your GitHub account
   - GitHub Desktop includes Git, so you don't need to install it separately

3. **Skip to Step 6** if using GitHub Desktop (see GitHub Desktop section below)

## Step 2: Configure Git (Command Line Only)

Open PowerShell and run:

```powershell
# Set your name (replace with your actual name)
git config --global user.name "Your Name"

# Set your email (replace with your GitHub email)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --global --list
```

## Step 3: Create GitHub Repository

1. **Go to GitHub:**
   - Open: https://github.com/new
   - Sign in if needed

2. **Create Repository:**
   - Repository name: `talent-acquisition-management`
   - Description: "Talent Acquisition Management System - Production Build"
   - Visibility: **Private** (recommended)
   - **DO NOT** check "Initialize this repository with a README"
   - **DO NOT** check "Add .gitignore"
   - **DO NOT** check "Choose a license"
   - Click "Create repository"

3. **Copy Repository URL:**
   - You'll see a page with repository URL
   - Copy the URL (e.g., `https://github.com/YOUR_USERNAME/talent-acquisition-management.git`)
   - You'll need this in Step 5

## Step 4: Navigate to Project Directory

Open PowerShell and run:

```powershell
# Navigate to your project directory
cd "D:\Cursor\Talent Acquisition Management Production"

# Verify you're in the right directory
pwd
# Should show: D:\Cursor\Talent Acquisition Management Production
```

## Step 5: Initialize Git Repository (Command Line)

```powershell
# Initialize git repository
git init

# Check status
git status

# Verify .env.prod is NOT listed (it should be ignored)
# If .env.prod is listed, check .gitignore file
```

## Step 6: Add Files to Git

```powershell
# Add all files (respecting .gitignore)
git add .

# Check status again
git status

# Verify:
# ✅ env.prod.template IS in the list (this is safe)
# ✅ All source code files are in the list
# ✅ Documentation files are in the list
# ❌ .env.prod is NOT in the list (this is correct)
# ❌ node_modules is NOT in the list (this is correct)
```

## Step 7: Commit Changes

```powershell
# Create initial commit
git commit -m "Production build - Ready for AWS deployment

- Production environment configuration
- Security fixes applied
- Docker Compose production configuration
- Documentation updated
- Security audit completed
- Jerry Hakim admin user script created"
```

## Step 8: Add GitHub Remote

```powershell
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/talent-acquisition-management.git

# Verify remote was added
git remote -v
# Should show:
# origin  https://github.com/YOUR_USERNAME/talent-acquisition-management.git (fetch)
# origin  https://github.com/YOUR_USERNAME/talent-acquisition-management.git (push)
```

## Step 9: Push to GitHub

```powershell
# Push to GitHub (first time)
git push -u origin main

# If you get an error about "main" branch, try "master":
git push -u origin master
```

### If Prompted for Credentials:

1. **Username:** Your GitHub username
2. **Password:** Your GitHub **Personal Access Token** (not your GitHub password)
   - Create token at: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: "Talent Acquisition Management"
   - Select scope: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again)
   - Use this token as your password

## Step 10: Verify Deployment

1. **Go to GitHub:**
   - Open: https://github.com/YOUR_USERNAME/talent-acquisition-management

2. **Verify:**
   - ✅ All files are present
   - ✅ Documentation files are present
   - ✅ Source code files are present
   - ✅ `.env.prod` is NOT in the repository (this is correct)
   - ✅ `env.prod.template` IS in the repository (this is safe)

## Alternative: Using GitHub Desktop

If you installed GitHub Desktop instead of Git:

### Step 1: Open GitHub Desktop

1. Open GitHub Desktop
2. Sign in with your GitHub account (if not already signed in)

### Step 2: Add Local Repository

1. Click "File" → "Add Local Repository"
2. Click "Choose..."
3. Navigate to: `D:\Cursor\Talent Acquisition Management Production`
4. Click "Select Folder"
5. Click "Add repository"

### Step 3: Review Changes

1. You'll see a list of all files to be committed
2. **Verify:**
   - ✅ All source code files are listed
   - ✅ Documentation files are listed
   - ✅ `env.prod.template` is listed (this is safe)
   - ❌ `.env.prod` is NOT listed (this is correct)
   - ❌ `node_modules` is NOT listed (this is correct)

### Step 4: Commit Changes

1. Enter commit message:
   ```
   Production build - Ready for AWS deployment

   - Production environment configuration
   - Security fixes applied
   - Docker Compose production configuration
   - Documentation updated
   - Security audit completed
   - Jerry Hakim admin user script created
   ```
2. Click "Commit to main" (or "Commit to master")

### Step 5: Publish Repository

1. Click "Publish repository" button (top right)
2. Repository name: `talent-acquisition-management`
3. Description: "Talent Acquisition Management System - Production Build"
4. Visibility: **Private**
5. Click "Publish repository"

### Step 6: Verify

1. GitHub Desktop will open your repository in browser
2. Verify all files are present
3. Verify `.env.prod` is NOT in the repository

## Troubleshooting

### Error: "git is not recognized"

**Solution:** See `GIT_INSTALLATION_GUIDE.md` for detailed installation instructions.

### Error: "fatal: remote origin already exists"

**Solution:**
```powershell
# Remove existing remote
git remote remove origin

# Add remote again
git remote add origin https://github.com/YOUR_USERNAME/talent-acquisition-management.git
```

### Error: "Authentication failed"

**Solution:**
1. Use Personal Access Token instead of password
2. Create token at: https://github.com/settings/tokens
3. Select scope: `repo`
4. Use token as password when prompted

### Error: "Permission denied (publickey)"

**Solution:** Use HTTPS instead of SSH:
```powershell
# Use HTTPS URL
git remote set-url origin https://github.com/YOUR_USERNAME/talent-acquisition-management.git
```

### Error: ".env.prod is being committed"

**Solution:**
```powershell
# Remove from git (but keep local file)
git rm --cached .env.prod

# Verify .gitignore includes .env.prod
cat .gitignore | findstr ".env.prod"

# Commit the removal
git commit -m "Remove .env.prod from repository"

# Push to GitHub
git push
```

## Next Steps

After successfully deploying to GitHub:

1. ✅ **Share Repository Access:**
   - Go to repository settings
   - Navigate to "Collaborators" or "Access"
   - Add your deployment team members
   - Grant "Read" access

2. ✅ **Provide Deployment Team With:**
   - Repository URL
   - `PRODUCTION_DEPLOYMENT_GUIDE.md`
   - `CREATE_ADMIN_USER.md`
   - `env.prod.template`

3. ✅ **Deployment Team Will:**
   - Clone repository
   - Create `.env.prod` file
   - Deploy to AWS Cloud
   - Create Jerry Hakim SUPER_ADMIN user

## Quick Reference

### Git Commands

```powershell
# Check Git version
git --version

# Initialize repository
git init

# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Your commit message"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/talent-acquisition-management.git

# Push to GitHub
git push -u origin main

# Check remote
git remote -v
```

### GitHub Desktop

1. File → Add Local Repository
2. Select project directory
3. Review changes
4. Commit changes
5. Publish repository

## Support

If you encounter issues:

1. Check `GIT_INSTALLATION_GUIDE.md` for Git installation help
2. Check `GITHUB_DEPLOYMENT_GUIDE.md` for detailed instructions
3. Check Git documentation: https://git-scm.com/doc
4. Check GitHub documentation: https://docs.github.com

---

**Last Updated:** 2025-11-11  
**Version:** 1.0.0

