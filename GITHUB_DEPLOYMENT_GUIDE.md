# GitHub Deployment Guide

This guide explains how to deploy the Talent Acquisition Management System to GitHub so that your deployment team can access it for AWS Cloud deployment.

## Prerequisites

1. GitHub account
2. Git installed on your local machine
3. GitHub repository (create one if you don't have it)
4. All changes committed and ready

## Step-by-Step Deployment to GitHub

### Step 1: Verify .gitignore Configuration

Ensure that `.gitignore` is properly configured to exclude sensitive files:

```bash
# Check .gitignore file
cat .gitignore
```

The `.gitignore` should exclude:
- `.env` files
- `node_modules`
- Log files
- SSL certificates
- Upload directories
- Backup files

### Step 2: Check Current Git Status

```bash
# Check if this is already a git repository
git status

# If not a git repository, initialize it
git init
```

### Step 3: Check What Files Will Be Committed

```bash
# See what files will be committed
git status

# Verify sensitive files are NOT listed
# Make sure .env.prod, .env, and other sensitive files are NOT in the list
```

### Step 4: Add Files to Git

```bash
# Add all files (respecting .gitignore)
git add .

# Verify what will be committed
git status
```

**IMPORTANT:** Double-check that no sensitive files (like `.env.prod`, `.env`, etc.) are being committed!

### Step 5: Create Initial Commit

```bash
# Create initial commit
git commit -m "Initial production build - Ready for AWS deployment

- Production environment configuration
- Security fixes applied
- Docker Compose production configuration
- Documentation updated
- Security audit completed"

# Or if you already have commits, just commit current changes
git commit -m "Production build preparation complete"
```

### Step 6: Create GitHub Repository

1. Go to GitHub: https://github.com
2. Click "New" or "New repository"
3. Repository name: `talent-acquisition-management` (or your preferred name)
4. Description: "Talent Acquisition Management System - Production Build"
5. Visibility: Choose **Private** (recommended for production)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### Step 7: Add GitHub Remote

```bash
# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/talent-acquisition-management.git

# Or using SSH (if you have SSH keys set up)
git remote add origin git@github.com:YOUR_USERNAME/talent-acquisition-management.git

# Verify remote was added
git remote -v
```

### Step 8: Push to GitHub

```bash
# Push to GitHub (first time)
git push -u origin main

# Or if your default branch is 'master'
git push -u origin master

# For subsequent pushes
git push
```

### Step 9: Verify Deployment

1. Go to your GitHub repository
2. Verify all files are present
3. Verify `.env.prod` is **NOT** in the repository
4. Verify sensitive files are excluded
5. Check that all documentation files are present

### Step 10: Create Release Tag (Optional but Recommended)

```bash
# Create a release tag for production
git tag -a v1.0.0 -m "Production Release v1.0.0 - Ready for AWS deployment"

# Push tags to GitHub
git push origin v1.0.0
```

### Step 11: Share Repository Access

1. Go to repository settings
2. Navigate to "Collaborators" or "Access"
3. Add your deployment team members
4. Grant appropriate permissions (Read access is sufficient for deployment)

## Post-Deployment Checklist

### Verify Repository Contents

- [ ] All source code is present
- [ ] Documentation files are present
- [ ] Docker files are present
- [ ] `.gitignore` is present and working
- [ ] `.env.prod` is **NOT** in repository
- [ ] No sensitive files are committed
- [ ] `env.prod.template` is present (this is safe to commit)

### Verify Security

- [ ] No hardcoded passwords in code
- [ ] No API keys in code
- [ ] No database credentials in code
- [ ] All secrets use environment variables
- [ ] `.gitignore` excludes all sensitive files

### Verify Documentation

- [ ] `README_PRODUCTION.md` is present
- [ ] `PRODUCTION_DEPLOYMENT_GUIDE.md` is present
- [ ] `SECURITY_AUDIT_REPORT.md` is present
- [ ] `FUNCTIONAL_TEST_PLAN.md` is present
- [ ] `GITHUB_DEPLOYMENT_GUIDE.md` is present (this file)
- [ ] `env.prod.template` is present

## For Your Deployment Team

### What Your Deployment Team Needs

1. **Repository Access**
   - GitHub repository URL
   - Access credentials (or added as collaborators)

2. **Documentation**
   - `PRODUCTION_DEPLOYMENT_GUIDE.md` - Complete deployment instructions
   - `README_PRODUCTION.md` - Quick start guide
   - `env.prod.template` - Environment variable template

3. **Environment Variables**
   - They need to create `.env.prod` file from `env.prod.template`
   - They need to set all required environment variables
   - Database credentials are already provided:
     - POSTGRES_USER: tas_user
     - POSTGRES_PASSWORD: taskpn@2025
     - POSTGRES_DB: tas_db

4. **Additional Requirements**
   - SSL certificates (if using HTTPS)
   - Domain names (if using custom domains)
   - AWS resources (if not already provisioned)

### Instructions for Deployment Team

Your deployment team should:

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/talent-acquisition-management.git
   cd talent-acquisition-management
   ```

2. Follow `PRODUCTION_DEPLOYMENT_GUIDE.md` for deployment steps

3. Create `.env.prod` from template:
   ```bash
   cp env.prod.template .env.prod
   # Edit .env.prod with production values
   ```

4. Deploy using Docker Compose:
   ```bash
   export $(cat .env.prod | xargs)
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## Troubleshooting

### If .env.prod Was Accidentally Committed

```bash
# Remove from git (but keep local file)
git rm --cached .env.prod

# Commit the removal
git commit -m "Remove .env.prod from repository"

# Push to GitHub
git push

# Verify it's removed from GitHub
# The file will still exist locally but won't be tracked by git
```

### If Sensitive Files Were Committed

```bash
# Remove sensitive files from git history (use with caution)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.prod" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to GitHub (WARNING: This rewrites history)
git push origin --force --all
```

**Note:** If sensitive data was committed, consider:
1. Rotating all secrets and credentials
2. Removing the repository and creating a new one
3. Using GitHub's secret scanning features

### If Push Fails

```bash
# Check remote URL
git remote -v

# Verify you have access
git fetch origin

# Try pushing again
git push -u origin main
```

## Security Best Practices

1. **Never Commit Sensitive Files**
   - `.env.prod` should never be committed
   - `.env` should never be committed
   - SSL certificates should never be committed
   - API keys should never be committed

2. **Use Environment Variables**
   - All secrets should use environment variables
   - Use `env.prod.template` as a reference
   - Never hardcode credentials

3. **Use Private Repositories**
   - Use private repositories for production code
   - Limit access to authorized personnel only
   - Regularly review access permissions

4. **Regular Security Audits**
   - Run security audit script before commits
   - Review changes for security issues
   - Keep dependencies updated

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

# Pull from GitHub
git pull

# Check remote
git remote -v

# View commit history
git log

# Create tag
git tag -a v1.0.0 -m "Release v1.0.0"

# Push tags
git push origin --tags
```

## Next Steps

After deploying to GitHub:

1. Share repository access with deployment team
2. Provide deployment team with:
   - Repository URL
   - `PRODUCTION_DEPLOYMENT_GUIDE.md`
   - `env.prod.template`
   - Database credentials (already in template)
3. Deployment team will:
   - Clone repository
   - Create `.env.prod` file
   - Deploy to AWS Cloud
   - Configure SSL certificates
   - Set up monitoring

---

**Last Updated:** 2025-11-11  
**Version:** 1.0.0

