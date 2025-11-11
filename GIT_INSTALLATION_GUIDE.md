# Git Installation Guide - Windows

## Error: "git is not recognized"

This error means Git is not installed on your system or not in your PATH. Follow the steps below to fix this.

## Solution 1: Install Git for Windows (Recommended)

### Step 1: Download Git

1. Go to: https://git-scm.com/download/win
2. The download should start automatically
3. Or click "Download for Windows" button

### Step 2: Install Git

1. Run the downloaded installer (e.g., `Git-2.43.0-64-bit.exe`)
2. Click "Next" through the installation wizard
3. **Important settings:**
   - **Select Editor:** Choose your preferred editor (Notepad++, VS Code, etc.)
   - **Default Branch Name:** Leave as "main" or change to "master" (your choice)
   - **PATH Environment:** Select "Git from the command line and also from 3rd-party software" (recommended)
   - **Line Ending Conversions:** Select "Checkout Windows-style, commit Unix-style line endings" (recommended)
   - **Terminal Emulator:** Select "Use Windows' default console window"
   - **Default Behavior:** Select "Git Credential Manager" (for GitHub authentication)
4. Click "Install"
5. Wait for installation to complete
6. Click "Finish"

### Step 3: Verify Installation

1. **Close and reopen PowerShell** (important - to reload PATH)
2. Run:
   ```powershell
   git --version
   ```
3. You should see: `git version 2.43.0` (or similar version number)

### Step 4: Configure Git (Optional but Recommended)

```powershell
# Set your name
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"

# Verify configuration
git config --global --list
```

## Solution 2: Use GitHub Desktop (Easier Alternative)

If you prefer a graphical interface, use GitHub Desktop instead:

### Step 1: Download GitHub Desktop

1. Go to: https://desktop.github.com/
2. Click "Download for Windows"
3. Run the installer

### Step 2: Install GitHub Desktop

1. Run the installer
2. Follow the installation wizard
3. Sign in with your GitHub account
4. GitHub Desktop includes Git, so you don't need to install it separately

### Step 3: Use GitHub Desktop

1. Open GitHub Desktop
2. File → Add Local Repository
3. Select your project directory: `D:\Cursor\Talent Acquisition Management Production`
4. Review changes
5. Commit and push to GitHub

## Solution 3: Add Git to PATH (If Already Installed)

If Git is installed but not in PATH:

### Step 1: Find Git Installation

Git is usually installed in one of these locations:
- `C:\Program Files\Git\cmd\git.exe`
- `C:\Program Files (x86)\Git\cmd\git.exe`
- `C:\Users\YourUsername\AppData\Local\Programs\Git\cmd\git.exe`

### Step 2: Add to PATH

1. Press `Win + X` and select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", find "Path" and click "Edit"
5. Click "New" and add: `C:\Program Files\Git\cmd`
6. Click "OK" on all dialogs
7. **Close and reopen PowerShell**

### Step 3: Verify

```powershell
git --version
```

## Quick Test After Installation

After installing Git, test it:

```powershell
# Check Git version
git --version

# Check Git configuration
git config --global --list

# Navigate to your project
cd "D:\Cursor\Talent Acquisition Management Production"

# Initialize git repository
git init

# Check status
git status
```

## Troubleshooting

### Issue: "git is not recognized" after installation

**Solution:**
1. Close all PowerShell/Command Prompt windows
2. Open a new PowerShell window
3. Try `git --version` again
4. If still not working, restart your computer

### Issue: Git is installed but command not found

**Solution:**
1. Check if Git is in PATH (see Solution 3 above)
2. Verify Git installation location
3. Add Git to PATH manually

### Issue: Permission denied errors

**Solution:**
1. Run PowerShell as Administrator
2. Or check file permissions in project directory

### Issue: Authentication errors when pushing

**Solution:**
1. Use Personal Access Token instead of password
2. Create token at: https://github.com/settings/tokens
3. Select scope: `repo` (full control)
4. Use token as password when prompted

## After Git Installation

Once Git is installed, continue with GitHub deployment:

```powershell
# Navigate to project directory
cd "D:\Cursor\Talent Acquisition Management Production"

# Initialize git repository
git init

# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Production build - Ready for AWS deployment"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/talent-acquisition-management.git

# Push to GitHub
git push -u origin main
```

## Alternative: Using GitHub Desktop

If you installed GitHub Desktop:

1. **Open GitHub Desktop**
2. **Sign in** with your GitHub account
3. **Add Local Repository:**
   - File → Add Local Repository
   - Click "Choose..."
   - Select: `D:\Cursor\Talent Acquisition Management Production`
   - Click "Add repository"
4. **Review Changes:**
   - Verify all files are listed
   - Verify `.env.prod` is NOT in the list
5. **Commit Changes:**
   - Enter commit message: "Production build - Ready for AWS deployment"
   - Click "Commit to main"
6. **Publish Repository:**
   - Click "Publish repository"
   - Repository name: `talent-acquisition-management`
   - Description: "Talent Acquisition Management System - Production Build"
   - Visibility: **Private**
   - Click "Publish repository"

## Next Steps

After Git is installed and working:

1. ✅ Verify Git installation: `git --version`
2. ✅ Configure Git: `git config --global user.name "Your Name"`
3. ✅ Continue with GitHub deployment (see `GITHUB_DEPLOYMENT_QUICK_START.md`)
4. ✅ Deploy to GitHub
5. ✅ Share repository access with deployment team

## Support

If you still have issues:

1. Check Git installation: https://git-scm.com/download/win
2. Check GitHub Desktop: https://desktop.github.com/
3. Check Git documentation: https://git-scm.com/doc
4. Check GitHub documentation: https://docs.github.com

---

**Last Updated:** 2025-11-11  
**Version:** 1.0.0

