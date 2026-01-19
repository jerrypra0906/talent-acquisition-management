# Fix SSH Config for Public Key Authentication

## Issue Found
SSH config has PubkeyAuthentication commented out. We need to explicitly enable it.

## Solution: Enable Public Key Authentication

**On the server, run:**

```bash
# Backup SSH config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Edit SSH config
nano /etc/ssh/sshd_config
```

**Find these lines (they're commented with #):**
```
#PubkeyAuthentication yes
#AuthorizedKeysFile     .ssh/authorized_keys .ssh/authorized_keys2
#StrictModes yes
```

**Uncomment and ensure they say:**
```
PubkeyAuthentication yes
AuthorizedKeysFile     .ssh/authorized_keys .ssh/authorized_keys2
StrictModes yes
```

**Also check for any Match blocks that might restrict public key auth. Look for lines like:**
```
Match User root
    PasswordAuthentication yes
```

**If you find a Match block for root, add:**
```
Match User root
    PubkeyAuthentication yes
    PasswordAuthentication yes
```

**Save: Ctrl+X, Y, Enter**

**Test the config:**
```bash
sshd -t
```

**If it says "Syntax OK", restart SSH:**
```bash
systemctl restart sshd
```

**Then test from Windows:**
```powershell
ssh -v -p 1819 root@147.139.176.70
```

---

## Alternative: Quick Fix with sed

**If you prefer command line:**
```bash
# Backup
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Uncomment PubkeyAuthentication
sed -i 's/^#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/^#PubkeyAuthentication no/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Uncomment AuthorizedKeysFile
sed -i 's/^#AuthorizedKeysFile/AuthorizedKeysFile/' /etc/ssh/sshd_config

# Test config
sshd -t

# If OK, restart
systemctl restart sshd
```

---

## Verify After Fix

**Check active settings:**
```bash
sshd -T | grep -E "pubkeyauthentication|authorizedkeysfile|strictmodes"
```

**Should show:**
```
pubkeyauthentication yes
authorizedkeysfile .ssh/authorized_keys .ssh/authorized_keys2
strictmodes yes
```

