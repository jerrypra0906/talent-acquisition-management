# Quick Fix: GitHub Authentication for AliCloud Deployment

## Problem
GitHub no longer accepts passwords. You need to use a Personal Access Token or SSH keys.

## Solution 1: Personal Access Token (Fastest - Do This Now)

### Step 1: Create Token on GitHub
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name: `AliCloud Production Deploy`
4. Expiration: Choose 90 days or custom
5. Select scope: **`repo`** (check the box - this gives full control of private repositories)
6. Click **"Generate token"**
7. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

### Step 2: Use Token to Clone

On your AliCloud server, run:

```bash
# Replace <YOUR_TOKEN> with the token you just copied
git clone https://jerrypra0906:<YOUR_TOKEN>@github.com/jerrypra0906/talent-acquisition-management.git tas
```

**Example:**
```bash
git clone https://jerrypra0906:ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/jerrypra0906/talent-acquisition-management.git tas
```

### Step 3: Verify
```bash
cd tas
ls -la
# Should see your project files
```

---

## Solution 2: SSH Keys (Better for Production)

### Step 1: Generate SSH Key (if you don't have one)

**On your local Windows machine (PowerShell):**
```powershell
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter to accept default location (C:\Users\YourName\.ssh\id_ed25519)
# Optionally set a passphrase
```

### Step 2: Copy Public Key
```powershell
# Display your public key
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

### Step 3: Add to GitHub
1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: `AliCloud Production Server`
4. Paste your public key
5. Click **"Add SSH key"**

### Step 4: Copy SSH Key to AliCloud Server

**From your local machine:**
```powershell
# Copy SSH key to backend server
ssh-copy-id -p 1819 root@147.139.176.70

# Copy SSH key to frontend server
ssh-copy-id -p 1818 root@147.139.176.70
```

**Or manually:**
```powershell
# Display your public key
type $env:USERPROFILE\.ssh\id_ed25519.pub

# Then SSH into server and add it:
ssh -p 1819 root@147.139.176.70
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Paste your public key, save and exit
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Step 5: Clone Using SSH
```bash
# On AliCloud server
git clone git@github.com:jerrypra0906/talent-acquisition-management.git tas
```

---

## Quick Command Reference

### Using Personal Access Token:
```bash
# Clone
git clone https://jerrypra0906:<TOKEN>@github.com/jerrypra0906/talent-acquisition-management.git tas

# Update later
cd tas
git pull https://jerrypra0906:<TOKEN>@github.com/jerrypra0906/talent-acquisition-management.git
```

### Using SSH:
```bash
# Clone
git clone git@github.com:jerrypra0906/talent-acquisition-management.git tas

# Update later
cd tas
git pull
```

---

## Troubleshooting

### "Permission denied (publickey)" when using SSH
- Make sure you added the public key to GitHub
- Verify key is in `~/.ssh/authorized_keys` on the server
- Check permissions: `chmod 600 ~/.ssh/authorized_keys`

### "Invalid username or token" when using PAT
- Make sure you copied the entire token (starts with `ghp_`)
- Verify token has `repo` scope
- Token might have expired - generate a new one

### "Repository not found"
- Make sure the repository is accessible (not private or you have access)
- Verify username is correct: `jerrypra0906`

---

## Recommended Approach

**For quick deployment:** Use Personal Access Token (Solution 1)  
**For production:** Set up SSH keys (Solution 2) - more secure and convenient long-term

