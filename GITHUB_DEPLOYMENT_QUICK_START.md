# GitHub Deployment - Quick Start Guide

## Prerequisites

1. **Install Git** (if not already installed)
   - ⚠️ **If you see "git is not recognized" error, see `GIT_INSTALLATION_GUIDE.md`**
   - Download from: https://git-scm.com/download/win
   - Or use GitHub Desktop: https://desktop.github.com/ (easier alternative)

2. **Create GitHub Account** (if you don't have one)
   - Sign up at: https://github.com

3. **Create GitHub Repository**
   - Go to: https://github.com/new
   - Repository name: `talent-acquisition-management` (or your preferred name)
   - Visibility: **Private** (recommended for production)
   - **DO NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

## ⚠️ Troubleshooting: "git is not recognized"

If you get the error "git is not recognized", you need to install Git first:

1. **Quick Fix:** See `GIT_INSTALLATION_GUIDE.md` for detailed instructions
2. **Download Git:** https://git-scm.com/download/win
3. **Install Git:** Run the installer and follow the wizard
4. **Restart PowerShell:** Close and reopen PowerShell after installation
5. **Verify:** Run `git --version` to confirm installation

**Alternative:** Use GitHub Desktop instead (includes Git):
- Download: https://desktop.github.com/
- Easier to use with graphical interface
- See `GIT_INSTALLATION_GUIDE.md` for GitHub Desktop instructions

## Step-by-Step Instructions

### Step 1: Open Terminal/Command Prompt

- **Windows:** Open PowerShell or Command Prompt
- **Mac/Linux:** Open Terminal

### Step 2: Navigate to Project Directory

```bash
cd "D:\Cursor\Talent Acquisition Management Production"
```

### Step 3: Initialize Git Repository (if not already done)

```bash
git init
```

### Step 4: Check Git Status

```bash
git status
```

**Verify that `.env.prod` is NOT listed** (it should be ignored by .gitignore)

### Step 5: Add All Files

```bash
git add .
```

### Step 6: Verify What Will Be Committed

```bash
git status
```

**IMPORTANT:** Make sure these files are NOT in the list:
- ❌ `.env.prod`
- ❌ `.env`
- ❌ Any files with passwords or secrets
- ❌ `node_modules/`
- ❌ SSL certificates

**These files SHOULD be in the list:**
- ✅ `env.prod.template` (this is safe - it's just a template)
- ✅ All source code files
- ✅ Documentation files
- ✅ Docker files
- ✅ `.gitignore`

### Step 7: Create Initial Commit

```bash
git commit -m "Production build - Ready for AWS deployment

- Production environment configuration
- Security fixes applied
- Docker Compose production configuration
- Documentation updated
- Security audit completed
- Jerry Hakim admin user script created"
```

### Step 8: Add GitHub Remote

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/talent-acquisition-management.git
```

### Step 9: Push to GitHub

```bash
# Push to main branch (first time)
git push -u origin main

# If main branch doesn't exist, try master:
git push -u origin master
```

**If prompted for credentials:**
- Username: Your GitHub username
- Password: Your GitHub Personal Access Token (not your GitHub password)
  - Create token at: https://github.com/settings/tokens
  - Select scope: `repo` (full control of private repositories)

### Step 10: Verify Deployment

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/talent-acquisition-management`
2. Verify all files are present
3. Verify `.env.prod` is **NOT** in the repository
4. Verify documentation files are present

## Troubleshooting

### Error: "Nothing specified, nothing added" when running `git add`

**Problem:** You ran `git add` without the dot.

**Solution:** Use `git add .` (with a dot at the end):
```powershell
# Correct command (with dot)
git add .
```

**See `GITHUB_DEPLOYMENT_TROUBLESHOOTING.md` for more troubleshooting help.**

### Error: "git is not recognized"

**Solution:** Install Git from https://git-scm.com/downloads

### Error: "fatal: remote origin already exists"

**Solution:** Remove existing remote and add again:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/talent-acquisition-management.git
```

### Error: "Permission denied (publickey)"

**Solution:** Use HTTPS instead of SSH, or set up SSH keys:
```bash
# Use HTTPS (easier)
git remote set-url origin https://github.com/YOUR_USERNAME/talent-acquisition-management.git
```

### Error: "Authentication failed"

**Solution:** 
1. Use Personal Access Token instead of password
2. Create token at: https://github.com/settings/tokens
3. Select scope: `repo`
4. Use token as password when prompted

### Error: ".env.prod is being committed"

**Solution:** 
1. Remove from git (but keep local file):
   ```bash
   git rm --cached .env.prod
   ```
2. Verify `.gitignore` includes `.env.prod`
3. Commit the removal:
   ```bash
   git commit -m "Remove .env.prod from repository"
   ```
4. Push to GitHub:
   ```bash
   git push
   ```

## Using GitHub Desktop (Alternative)

If you prefer a graphical interface:

1. **Download GitHub Desktop:** https://desktop.github.com/
2. **Install and sign in** with your GitHub account
3. **Add repository:**
   - File → Add Local Repository
   - Select your project directory
4. **Review changes:**
   - Verify `.env.prod` is NOT in the list
   - Verify all other files are included
5. **Commit changes:**
   - Enter commit message: "Production build - Ready for AWS deployment"
   - Click "Commit to main"
6. **Publish repository:**
   - Click "Publish repository"
   - Select "Private" visibility
   - Click "Publish repository"

## Next Steps

After deploying to GitHub:

1. **Share repository access** with your deployment team
2. **Provide deployment team with:**
   - Repository URL
   - `PRODUCTION_DEPLOYMENT_GUIDE.md`
   - `CREATE_ADMIN_USER.md`
   - `env.prod.template`
3. **Deployment team will:**
   - Clone repository
   - Create `.env.prod` file
   - Deploy to AWS Cloud
   - Create Jerry Hakim SUPER_ADMIN user

## Quick Reference

### Common Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Check remote
git remote -v

# View commit history
git log
```

## Security Checklist

Before pushing to GitHub, verify:

- [ ] `.env.prod` is NOT in the repository
- [ ] `.env` is NOT in the repository
- [ ] No hardcoded passwords in code
- [ ] No API keys in code
- [ ] No database credentials in code
- [ ] `.gitignore` is properly configured
- [ ] `env.prod.template` is present (this is safe)
- [ ] All documentation is present

## Support

If you encounter issues:

1. Check troubleshooting section above
2. Review `GITHUB_DEPLOYMENT_GUIDE.md` for detailed instructions
3. Check Git documentation: https://git-scm.com/doc
4. Check GitHub documentation: https://docs.github.com

---

**Last Updated:** 2025-11-11  
**Version:** 1.0.0

