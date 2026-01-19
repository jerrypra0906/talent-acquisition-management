# Clone Repository on AliCloud Server

## Problem
The server doesn't have an SSH key added to GitHub, so SSH cloning fails.

## Solution 1: Use Personal Access Token (HTTPS) - RECOMMENDED

**On the server (via PuTTY):**

```bash
# Clone using HTTPS with Personal Access Token
git clone https://jerrypra0906:<YOUR_TOKEN>@github.com/jerrypra0906/talent-acquisition-management.git tas
```

**Replace `<YOUR_TOKEN>` with your GitHub Personal Access Token.**

**If you don't have a token:**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: `AliCloud Server Clone`
4. Select scope: `repo` (full control)
5. Generate and copy the token

**Example:**
```bash
git clone https://jerrypra0906:ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/jerrypra0906/talent-acquisition-management.git tas
```

---

## Solution 2: Add Server's SSH Key to GitHub

**On the server, generate SSH key:**

```bash
# Generate SSH key for the server
ssh-keygen -t ed25519 -C "jerry.pratama.mail@gmail.com"

# When prompted:
# - "Enter file in which to save the key": Press Enter (use default: /root/.ssh/id_ed25519)
# - "Enter passphrase": Press Enter (no passphrase)
# - "Enter same passphrase again": Press Enter
```

**Display the public key:**
```bash
cat ~/.ssh/id_ed25519.pub
```

**Copy the entire output** (starts with `ssh-ed25519`)

**Add to GitHub:**
1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: `AliCloud Backend Server` (or `AliCloud Frontend Server`)
4. Paste the public key
5. Save

**Test GitHub connection:**
```bash
ssh -T git@github.com
```

**Should see:**
```
Hi jerrypra0906! You've successfully authenticated, but GitHub does not provide shell access.
```

**Then clone:**
```bash
git clone git@github.com:jerrypra0906/talent-acquisition-management.git tas
```

---

## Solution 3: Use SSH Agent Forwarding (Advanced)

If you want to use your Windows SSH key from the server:

**On Windows, enable SSH agent:**
```powershell
# Start SSH agent
Start-Service ssh-agent

# Add your key
ssh-add $env:USERPROFILE\.ssh\id_ed25519
```

**Connect to server with agent forwarding:**
```powershell
ssh -A -p 1819 root@147.139.176.70
```

**Then on server, clone:**
```bash
git clone git@github.com:jerrypra0906/talent-acquisition-management.git tas
```

---

## Recommended: Use Personal Access Token

**For production servers, using HTTPS with a token is simpler:**

```bash
# Clone
git clone https://jerrypra0906:<TOKEN>@github.com/jerrypra0906/talent-acquisition-management.git tas

# For future updates
cd tas
git pull https://jerrypra0906:<TOKEN>@github.com/jerrypra0906/talent-acquisition-management.git
```

**Or configure Git to remember credentials:**
```bash
# Clone
git clone https://jerrypra0906:<TOKEN>@github.com/jerrypra0906/talent-acquisition-management.git tas

# Configure Git to use token
cd tas
git config credential.helper store
git config user.name "jerrypra0906"
git config user.email "jerry.pratama.mail@gmail.com"

# Test pull (will prompt for password - enter token)
git pull
```

---

## Quick Fix - Use Token Now

**On the server, run:**

```bash
# Get your GitHub Personal Access Token ready
# Then clone:
git clone https://jerrypra0906:<YOUR_TOKEN>@github.com/jerrypra0906/talent-acquisition-management.git tas

# Verify
cd tas
ls -la
```

This should work immediately!

