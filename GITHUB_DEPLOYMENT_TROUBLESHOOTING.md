# GitHub Deployment - Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Nothing specified, nothing added" when running `git add`

**Error Message:**
```
Nothing specified, nothing added.
hint: Maybe you wanted to say 'git add .'?
```

**Problem:** You ran `git add` without specifying what to add.

**Solution:** Use `git add .` (with a dot at the end):

```powershell
# Correct command (with dot)
git add .

# The dot (.) means "add all files in current directory and subdirectories"
```

**Explanation:**
- `git add` - Needs to know WHAT to add
- `git add .` - Adds all files in current directory (the dot means "current directory")
- `git add filename` - Adds a specific file
- `git add *.js` - Adds all JavaScript files

### Issue 2: "git is not recognized"

**Error Message:**
```
git : The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

**Solution:** See `GIT_INSTALLATION_QUICK_FIX.md` for installation instructions.

### Issue 3: ".env.prod is being committed"

**Problem:** You see `.env.prod` in the list of files to be committed.

**Solution:**
```powershell
# Remove from git (but keep local file)
git rm --cached .env.prod

# Verify .gitignore includes .env.prod
Get-Content .gitignore | Select-String ".env.prod"

# Commit the removal
git commit -m "Remove .env.prod from repository"

# Push to GitHub
git push
```

**Prevention:** Make sure `.gitignore` includes:
```
.env
.env.prod
.env.*
```

### Issue 4: "fatal: remote origin already exists"

**Error Message:**
```
fatal: remote origin already exists
```

**Solution:**
```powershell
# Remove existing remote
git remote remove origin

# Add remote again
git remote add origin https://github.com/YOUR_USERNAME/talent-acquisition-management.git

# Verify remote was added
git remote -v
```

### Issue 5: "Authentication failed" when pushing

**Error Message:**
```
remote: Support for password authentication was removed on August 13, 2021.
fatal: Authentication failed
```

**Solution:** Use Personal Access Token instead of password:

1. **Create Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: "Talent Acquisition Management"
   - Select scope: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again)

2. **Use token as password:**
   - When prompted for password, paste the token
   - Username: Your GitHub username
   - Password: Your Personal Access Token

### Issue 6: "Permission denied (publickey)"

**Error Message:**
```
Permission denied (publickey)
```

**Solution:** Use HTTPS instead of SSH:

```powershell
# Check current remote URL
git remote -v

# Change to HTTPS URL
git remote set-url origin https://github.com/YOUR_USERNAME/talent-acquisition-management.git

# Verify change
git remote -v
```

### Issue 7: "error: failed to push some refs"

**Error Message:**
```
error: failed to push some refs to 'https://github.com/...'
hint: Updates were rejected because the remote contains work that you do not have locally.
```

**Solution:** Pull changes first, then push:

```powershell
# Pull changes from GitHub
git pull origin main --allow-unrelated-histories

# Resolve any conflicts (if any)
# Then push again
git push -u origin main
```

### Issue 8: "fatal: not a git repository"

**Error Message:**
```
fatal: not a git repository (or any of the parent directories): .git
```

**Solution:** Initialize git repository first:

```powershell
# Initialize git repository
git init

# Then add files
git add .

# Then commit
git commit -m "Initial commit"
```

### Issue 9: "Please tell me who you are" error

**Error Message:**
```
*** Please tell me who you are.

Run
  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"
```

**Solution:** Configure Git with your name and email:

```powershell
# Set your name
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"

# Verify configuration
git config --global --list
```

### Issue 10: "Branch 'main' does not exist"

**Error Message:**
```
error: src refspec main does not exist
```

**Solution:** Use 'master' instead, or create 'main' branch:

```powershell
# Option 1: Push to master branch
git push -u origin master

# Option 2: Create and push to main branch
git branch -M main
git push -u origin main
```

## Quick Command Reference

### Common Git Commands

```powershell
# Initialize repository
git init

# Check status
git status

# Add all files (IMPORTANT: use dot)
git add .

# Add specific file
git add filename

# Commit changes
git commit -m "Your commit message"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/repository.git

# Push to GitHub
git push -u origin main

# Pull from GitHub
git pull origin main

# Check remote
git remote -v

# Remove file from git (but keep local)
git rm --cached filename

# View commit history
git log

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Common Mistakes

1. **Forgetting the dot in `git add .`**
   - ❌ Wrong: `git add`
   - ✅ Correct: `git add .`

2. **Committing sensitive files**
   - ❌ Wrong: Committing `.env.prod`
   - ✅ Correct: Only commit `env.prod.template`

3. **Using password instead of token**
   - ❌ Wrong: Using GitHub password
   - ✅ Correct: Using Personal Access Token

4. **Not checking status before committing**
   - ❌ Wrong: Committing without checking what's included
   - ✅ Correct: Always run `git status` first

## Verification Checklist

Before pushing to GitHub, verify:

- [ ] Git is installed and working (`git --version`)
- [ ] Git is configured (`git config --global --list`)
- [ ] Repository is initialized (`git status` works)
- [ ] Files are added (`git add .` completed)
- [ ] `.env.prod` is NOT in the list (`git status` shows it's ignored)
- [ ] All source files are in the list (`git status`)
- [ ] Changes are committed (`git commit` completed)
- [ ] Remote is added (`git remote -v` shows origin)
- [ ] Ready to push (`git push` should work)

## Getting Help

If you still have issues:

1. **Check Git status:**
   ```powershell
   git status
   ```

2. **Check Git configuration:**
   ```powershell
   git config --global --list
   ```

3. **Check remote:**
   ```powershell
   git remote -v
   ```

4. **View Git help:**
   ```powershell
   git help
   git help add
   git help commit
   git help push
   ```

5. **Check documentation:**
   - Git documentation: https://git-scm.com/doc
   - GitHub documentation: https://docs.github.com
   - See `GITHUB_DEPLOYMENT_STEP_BY_STEP.md` for detailed instructions

## Common Workflow

Here's the correct workflow:

```powershell
# 1. Navigate to project directory
cd "D:\Cursor\Talent Acquisition Management Production"

# 2. Initialize repository (if not already done)
git init

# 3. Check status
git status

# 4. Add all files (WITH DOT)
git add .

# 5. Check status again (verify what will be committed)
git status

# 6. Commit changes
git commit -m "Production build - Ready for AWS deployment"

# 7. Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/talent-acquisition-management.git

# 8. Push to GitHub
git push -u origin main
```

---

**Last Updated:** 2025-11-11  
**Version:** 1.0.0

