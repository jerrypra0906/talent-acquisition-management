# Fix SSH Key Authentication - Keys Match But Still Failing

## ✅ Keys Match Confirmed
- Windows fingerprint: `SHA256:Rqd3NicsAnKD1iurUfQgCs9TdO4bB83oha+rOxoeV1k`
- Server fingerprint: `SHA256:Rqd3NicsAnKD1iurUfQgCs9TdO4bB83oha+rOxoeV1k`

Since keys match, the issue is server configuration.

## Step 1: Check SSH Server Configuration

**On the server, run:**
```bash
# Check SSH config
grep -E "PubkeyAuthentication|AuthorizedKeysFile|StrictModes" /etc/ssh/sshd_config
```

**Should see:**
```
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
StrictModes yes
```

**If StrictModes is yes, check home directory permissions:**
```bash
# Check home directory permissions
ls -ld ~
# Should be: drwx------ or drwxr-xr-x (not drwxrwxrwx)

# Fix if needed
chmod 755 ~
```

## Step 2: Check SELinux (if applicable)

**On the server:**
```bash
# Check if SELinux is enabled
getenforce

# If it shows "Enforcing", fix context:
restorecon -R ~/.ssh
```

## Step 3: Verify Exact Key Content Match

**On Windows PowerShell:**
```powershell
# Get exact key content
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

**On server, verify it matches exactly:**
```bash
# Check key content
cat ~/.ssh/authorized_keys

# Check for hidden characters
cat ~/.ssh/authorized_keys | od -c | head -3
```

## Step 4: Check SSH Logs for Detailed Error

**On the server, watch logs:**
```bash
# Watch auth logs
tail -f /var/log/auth.log
# Or
journalctl -u ssh -f
```

**Then from Windows, try connecting:**
```powershell
ssh -v -p 1819 root@147.139.176.70
```

**Look for error messages in the server logs.**

## Step 5: Test with Explicit Key

**On Windows PowerShell:**
```powershell
# Try with explicit key specification
ssh -i $env:USERPROFILE\.ssh\id_ed25519 -p 1819 root@147.139.176.70
```

## Step 6: Check Home Directory Ownership

**On the server:**
```bash
# Check ownership
ls -ld ~
ls -ld ~/.ssh

# Fix ownership if needed
chown -R root:root ~/.ssh
chown root:root ~
```

## Step 7: Restart SSH Service

**On the server:**
```bash
# Restart SSH service
systemctl restart sshd
# Or
service ssh restart
```

## Step 8: Nuclear Option - Recreate Everything

**On the server:**
```bash
# Backup
cp -r ~/.ssh ~/.ssh.backup

# Remove everything
rm -rf ~/.ssh

# Recreate
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Get your public key from Windows and add it
# (You'll need to paste it)
nano ~/.ssh/authorized_keys
# Paste key, save: Ctrl+X, Y, Enter

# Set permissions
chmod 600 ~/.ssh/authorized_keys
chown -R root:root ~/.ssh

# Verify
cat ~/.ssh/authorized_keys
ls -la ~/.ssh/
```

## Most Likely Issues

1. **StrictModes** - Home directory or .ssh directory has wrong permissions
2. **SELinux** - Context needs to be restored
3. **SSH config** - PubkeyAuthentication might be disabled
4. **Hidden characters** - Key has invisible characters

## Quick Diagnostic Script

**Run this on the server:**
```bash
echo "=== SSH Key Diagnostic ==="
echo "1. Key exists:"
ls -la ~/.ssh/authorized_keys
echo ""
echo "2. Permissions:"
ls -ld ~/.ssh
ls -l ~/.ssh/authorized_keys
echo ""
echo "3. Ownership:"
ls -ld ~
ls -ld ~/.ssh
echo ""
echo "4. Key content:"
cat ~/.ssh/authorized_keys
echo ""
echo "5. Key fingerprint:"
ssh-keygen -lf ~/.ssh/authorized_keys
echo ""
echo "6. SSH config:"
grep -E "PubkeyAuthentication|AuthorizedKeysFile|StrictModes" /etc/ssh/sshd_config
echo ""
echo "7. SELinux:"
getenforce 2>/dev/null || echo "SELinux not installed"
```

Run this diagnostic and share the output!

