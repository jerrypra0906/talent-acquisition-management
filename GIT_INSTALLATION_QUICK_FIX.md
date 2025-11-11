# Quick Fix: "git is not recognized" Error

## The Problem

You're seeing this error:
```
git : The term 'git' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

This means Git is not installed on your Windows computer.

## Quick Solution

### Option 1: Install Git (5 minutes)

1. **Download Git:**
   - Go to: https://git-scm.com/download/win
   - Click "Download for Windows"
   - The download will start automatically

2. **Install Git:**
   - Run the downloaded file (e.g., `Git-2.43.0-64-bit.exe`)
   - Click "Next" through all steps
   - **Important:** When asked about PATH, select "Git from the command line and also from 3rd-party software"
   - Click "Install"
   - Wait for installation to finish
   - Click "Finish"

3. **Test Installation:**
   - **Close PowerShell completely**
   - **Open a new PowerShell window**
   - Run: `git --version`
   - You should see: `git version 2.43.0` (or similar)

4. **Continue with GitHub Deployment:**
   - Go back to `GITHUB_DEPLOYMENT_QUICK_START.md`
   - Continue from Step 3

### Option 2: Use GitHub Desktop (Easier - No Command Line)

1. **Download GitHub Desktop:**
   - Go to: https://desktop.github.com/
   - Click "Download for Windows"
   - Run the installer

2. **Install and Sign In:**
   - Install GitHub Desktop
   - Sign in with your GitHub account
   - GitHub Desktop includes Git, so you don't need to install it separately

3. **Use GitHub Desktop:**
   - Open GitHub Desktop
   - File → Add Local Repository
   - Select: `D:\Cursor\Talent Acquisition Management Production`
   - Review changes
   - Commit and push to GitHub

## After Installation

Once Git is installed, verify it works:

```powershell
# Check Git version
git --version

# Configure Git (replace with your info)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Then continue with GitHub deployment using `GITHUB_DEPLOYMENT_QUICK_START.md`.

## Need More Help?

- **Detailed Installation Guide:** See `GIT_INSTALLATION_GUIDE.md`
- **Step-by-Step Deployment:** See `GITHUB_DEPLOYMENT_STEP_BY_STEP.md`
- **Git Documentation:** https://git-scm.com/doc

## Quick Links

- **Download Git:** https://git-scm.com/download/win
- **Download GitHub Desktop:** https://desktop.github.com/
- **Git Documentation:** https://git-scm.com/doc

---

**Last Updated:** 2025-11-11

