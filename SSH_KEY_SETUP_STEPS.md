# SSH Key Setup Steps for AliCloud Deployment

## Step 1: Generate SSH Key

**On Windows (PowerShell):**
```powershell
ssh-keygen -t ed25519 -C "jerry.pratama.mail@gmail.com"
```

**On Linux/Mac:**
```bash
ssh-keygen -t ed25519 -C "jerry.pratama.mail@gmail.com"
```

**When prompted:**
- Press **Enter** to accept default location
- Optionally enter a passphrase (recommended for security)

---

## Step 2: Display Your Public Key

**On Windows (PowerShell):**
```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

**On Linux/Mac:**
```bash
cat ~/.ssh/id_ed25519.pub
```

**Copy the entire output** - it should look like:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... jerry.pratama.mail@gmail.com
```

---

## Step 3: Add SSH Key to GitHub

1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"** button
3. Fill in:
   - **Title**: `AliCloud Production Server` (or any descriptive name)
   - **Key**: Paste the public key you copied in Step 2
4. Click **"Add SSH key"**
5. You may be prompted to enter your GitHub password to confirm

---

## Step 4: Copy SSH Key to AliCloud Servers

**From your local Windows machine (PowerShell):**

```powershell
# Copy SSH key to backend server (SSH port 1819)
ssh-copy-id -p 1819 root@147.139.176.70

# Copy SSH key to frontend server (SSH port 1818)
ssh-copy-id -p 1818 root@147.139.176.70
```

**If `ssh-copy-id` is not available on Windows**, use this alternative:

```powershell
# Get your public key
$pubkey = Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"

# Copy to backend server
ssh -p 1819 root@147.139.176.70 "mkdir -p ~/.ssh && echo '$pubkey' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"

# Copy to frontend server
ssh -p 1818 root@147.139.176.70 "mkdir -p ~/.ssh && echo '$pubkey' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
```

**Or manually (if above doesn't work):**

1. Display your public key:
   ```powershell
   type $env:USERPROFILE\.ssh\id_ed25519.pub
   ```

2. SSH into each server and add it:
   ```powershell
   # Backend server
   ssh -p 1819 root@147.139.176.70
   ```
   
   Then on the server:
   ```bash
   mkdir -p ~/.ssh
   nano ~/.ssh/authorized_keys
   # Paste your public key, save (Ctrl+X, Y, Enter)
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   exit
   ```
   
   Repeat for frontend server (port 1818).

---

## Step 5: Test SSH Connection

**Test connection to backend server:**
```powershell
ssh -p 1819 root@147.139.176.70 "echo 'SSH connection successful!'"
```

**Test connection to frontend server:**
```powershell
ssh -p 1818 root@147.139.176.70 "echo 'SSH connection successful!'"
```

If successful, you should see the message without being prompted for a password.

---

## Step 6: Test GitHub SSH Connection

**On AliCloud servers, test GitHub access:**

```bash
# SSH into backend server
ssh -p 1819 root@147.139.176.70

# Test GitHub SSH connection
ssh -T git@github.com
```

You should see:
```
Hi jerrypra0906! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## Step 7: Clone Repository Using SSH

**On backend server:**
```bash
cd /opt
git clone git@github.com:jerrypra0906/talent-acquisition-management.git tas
cd tas
ls -la
```

**On frontend server:**
```bash
cd /opt
git clone git@github.com:jerrypra0906/talent-acquisition-management.git tas
cd tas
ls -la
```

---

## Troubleshooting

### "Permission denied (publickey)" when connecting to server

**Check:**
1. Public key is in `~/.ssh/authorized_keys` on the server
2. Permissions are correct:
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```
3. SSH service is running:
   ```bash
   systemctl status ssh
   ```

### "Permission denied (publickey)" when connecting to GitHub

**Check:**
1. Public key is added to GitHub (https://github.com/settings/keys)
2. You're using the correct GitHub username
3. Test connection: `ssh -T git@github.com`

### "Host key verification failed"

**Solution:**
```bash
ssh-keygen -R 147.139.176.70
ssh-keygen -R github.com
```

Then try connecting again.

---

## Quick Reference Commands

```powershell
# Generate SSH key
ssh-keygen -t ed25519 -C "jerry.pratama.mail@gmail.com"

# Display public key
type $env:USERPROFILE\.ssh\id_ed25519.pub

# Copy to server (if ssh-copy-id available)
ssh-copy-id -p 1819 root@147.139.176.70
ssh-copy-id -p 1818 root@147.139.176.70

# Test GitHub connection
ssh -T git@github.com

# Clone repository
git clone git@github.com:jerrypra0906/talent-acquisition-management.git tas
```

---

**Next Steps:** After SSH keys are set up, follow `ALICLOUD_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

