# Troubleshooting SSH Key Authentication

## Issue: Still asking for password after adding SSH key

### Step 1: Verify SSH Key on Server

**On the server (via PuTTY), check:**
```bash
# Check if authorized_keys exists and has content
cat ~/.ssh/authorized_keys

# Check permissions
ls -la ~/.ssh/
```

**Expected output:**
```
-rw------- 1 root root   XXX date authorized_keys
drwx------ 2 root root 4096 date .
```

**If permissions are wrong, fix them:**
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown root:root ~/.ssh
chown root:root ~/.ssh/authorized_keys
```

### Step 2: Verify SSH Key Format

**On the server, check the key format:**
```bash
cat ~/.ssh/authorized_keys
```

**Should be exactly one line:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHHzhNhuyc3o1E1o76ydClxnYwj2EmfOV/e9Q8DCn46Q jerry.pratama.mail@gmail.com
```

**Common issues:**
- Extra spaces or line breaks
- Missing parts of the key
- Wrong key format

**Fix: Re-add the key properly:**
```bash
# Backup existing file
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup

# Remove and recreate
rm ~/.ssh/authorized_keys
nano ~/.ssh/authorized_keys
# Paste the key (make sure it's ONE line, no line breaks)
# Save: Ctrl+X, Y, Enter

# Set permissions
chmod 600 ~/.ssh/authorized_keys
```

### Step 3: Verify Windows is Using the Correct SSH Key

**On Windows PowerShell, check which key is being used:**
```powershell
# Display your public key
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

**Compare this with what's on the server:**
```bash
# On server
cat ~/.ssh/authorized_keys
```

**They must match exactly!**

### Step 4: Test with Verbose Output

**On Windows, test with verbose mode to see what's happening:**
```powershell
ssh -v -p 1819 root@147.139.176.70
```

**Look for these lines:**
```
debug1: Offering public key: C:\Users\...\.ssh\id_ed25519 ED25519 SHA256:...
debug1: Server accepts key: ...
```

**If you see:**
```
debug1: Authentications that can continue: publickey,password
debug1: Next authentication method: password
```

This means the server didn't accept your key.

### Step 5: Check SSH Server Configuration

**On the server, check SSH config:**
```bash
# Check SSH server config
cat /etc/ssh/sshd_config | grep -E "PubkeyAuthentication|PasswordAuthentication|AuthorizedKeysFile"
```

**Should see:**
```
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
```

**If PasswordAuthentication is set to no, you MUST use SSH keys.**

**Restart SSH service if you made changes:**
```bash
systemctl restart sshd
# Or
service ssh restart
```

### Step 6: Try Specifying the Key Explicitly

**On Windows, try specifying the key file:**
```powershell
ssh -i $env:USERPROFILE\.ssh\id_ed25519 -p 1819 root@147.139.176.70
```

### Step 7: Check SELinux (if applicable)

**On the server, check SELinux:**
```bash
# Check if SELinux is enabled
getenforce

# If it's Enforcing, try:
restorecon -R ~/.ssh
```

### Step 8: Alternative - Use SSH Agent

**On Windows PowerShell:**
```powershell
# Start SSH agent
Start-Service ssh-agent

# Add your key
ssh-add $env:USERPROFILE\.ssh\id_ed25519

# Test connection
ssh -p 1819 root@147.139.176.70
```

---

## Quick Fix Checklist

1. ✅ Key is in `~/.ssh/authorized_keys` on server
2. ✅ Permissions: `chmod 700 ~/.ssh` and `chmod 600 ~/.ssh/authorized_keys`
3. ✅ Key format is correct (one line, no breaks)
4. ✅ Public key on Windows matches key on server
5. ✅ SSH server allows public key authentication
6. ✅ Try specifying key explicitly: `ssh -i ~/.ssh/id_ed25519 ...`

---

## Nuclear Option: Re-add Key from Scratch

**On the server:**
```bash
# Remove everything
rm -rf ~/.ssh/authorized_keys

# Recreate
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add key
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHHzhNhuyc3o1E1o76ydClxnYwj2EmfOV/e9Q8DCn46Q jerry.pratama.mail@gmail.com" > ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Verify:**
```bash
cat ~/.ssh/authorized_keys
ls -la ~/.ssh/
```

---

## Still Not Working?

**Check SSH logs on server:**
```bash
tail -f /var/log/auth.log
# Or
journalctl -u ssh -f
```

**Then try connecting from Windows and watch the logs for errors.**

