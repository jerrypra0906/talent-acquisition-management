# Regenerate SSH Key (If You Forgot Passphrase)

## Option 1: Generate New Key WITHOUT Passphrase (Easiest)

**On Windows PowerShell:**

```powershell
# Generate new key without passphrase (just press Enter when asked)
ssh-keygen -t ed25519 -C "jerry.pratama.mail@gmail.com" -f $env:USERPROFILE\.ssh\id_ed25519_new

# When prompted:
# - "Enter passphrase": Just press Enter (no passphrase)
# - "Enter same passphrase again": Just press Enter
```

**Then replace the old key:**
```powershell
# Backup old key (optional)
Move-Item $env:USERPROFILE\.ssh\id_ed25519 $env:USERPROFILE\.ssh\id_ed25519.old
Move-Item $env:USERPROFILE\.ssh\id_ed25519.pub $env:USERPROFILE\.ssh\id_ed25519.pub.old

# Use new key
Move-Item $env:USERPROFILE\.ssh\id_ed25519_new $env:USERPROFILE\.ssh\id_ed25519
Move-Item $env:USERPROFILE\.ssh\id_ed25519_new.pub $env:USERPROFILE\.ssh\id_ed25519.pub
```

**Display new public key:**
```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

**Copy this new key and add it to:**
1. GitHub: https://github.com/settings/keys
2. AliCloud servers (replace the old key in `~/.ssh/authorized_keys`)

---

## Option 2: Generate New Key WITH Passphrase (More Secure)

**On Windows PowerShell:**

```powershell
# Generate new key with passphrase
ssh-keygen -t ed25519 -C "jerry.pratama.mail@gmail.com" -f $env:USERPROFILE\.ssh\id_ed25519_new

# When prompted:
# - "Enter passphrase": Enter a NEW passphrase (write it down!)
# - "Enter same passphrase again": Enter the same passphrase
```

**Then follow the same steps as Option 1 to replace the old key.**

---

## Option 3: Overwrite Existing Key (Simplest)

**On Windows PowerShell:**

```powershell
# Remove old keys
Remove-Item $env:USERPROFILE\.ssh\id_ed25519 -ErrorAction SilentlyContinue
Remove-Item $env:USERPROFILE\.ssh\id_ed25519.pub -ErrorAction SilentlyContinue

# Generate new key (no passphrase - just press Enter twice)
ssh-keygen -t ed25519 -C "jerry.pratama.mail@gmail.com"

# When prompted:
# - "Enter file in which to save the key": Press Enter (use default)
# - "Enter passphrase": Press Enter (no passphrase)
# - "Enter same passphrase again": Press Enter
```

**Display new public key:**
```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

**Copy the output and update:**

1. **GitHub:**
   - Go to: https://github.com/settings/keys
   - Delete old key (if exists)
   - Add new key

2. **AliCloud Backend Server (via PuTTY):**
   ```bash
   # Remove old key
   rm -f ~/.ssh/authorized_keys
   
   # Add new key (paste your NEW public key from Windows)
   echo "PASTE_YOUR_NEW_PUBLIC_KEY_HERE" > ~/.ssh/authorized_keys
   
   # Set permissions
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **AliCloud Frontend Server (via PuTTY):**
   ```bash
   # Same steps as backend server
   rm -f ~/.ssh/authorized_keys
   echo "PASTE_YOUR_NEW_PUBLIC_KEY_HERE" > ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

---

## Quick Steps Summary

1. **Generate new key** (without passphrase for simplicity)
2. **Get public key:** `type $env:USERPROFILE\.ssh\id_ed25519.pub`
3. **Add to GitHub:** https://github.com/settings/keys
4. **Add to both AliCloud servers** (replace old key in `authorized_keys`)
5. **Test connection:** `ssh -p 1819 root@147.139.176.70`

---

## Why This Might Solve Your Current Issue

If you set a passphrase and forgot it, Windows SSH might be waiting for you to enter it, but you're not seeing the prompt. Generating a new key without a passphrase eliminates this issue.

---

## After Regenerating Key

**Test from Windows:**
```powershell
ssh -p 1819 root@147.139.176.70
```

Should connect without any prompts!

