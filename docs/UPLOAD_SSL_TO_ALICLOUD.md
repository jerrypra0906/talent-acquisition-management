# How to Upload SSL Certificates to AliCloud Server

## Quick Reference

**Server Details:**
- **Frontend Server IP:** `147.139.176.70`
- **SSH Port:** `1818`
- **Username:** `root`
- **Target Directory:** `/opt/tas-production/ssl/`
- **Required Files:** `fullchain.pem` and `privkey.pem`

---

## Method 1: Using SCP (Command Line) - Recommended

### On Windows (PowerShell or Command Prompt)

**Step 1: Open PowerShell or Command Prompt**

**Step 2: Navigate to the folder containing your SSL certificates**

```powershell
cd C:\path\to\your\ssl\certificates
```

**Step 3: Upload the certificate files**

```powershell
# Upload fullchain.pem
scp -P 1818 fullchain.pem root@147.139.176.70:/opt/tas-production/ssl/

# Upload privkey.pem
scp -P 1818 privkey.pem root@147.139.176.70:/opt/tas-production/ssl/
```

**If you get a password prompt:**
- Enter your root password when prompted
- The password won't show as you type (this is normal for security)

**If you're using an SSH key:**
```powershell
scp -i C:\path\to\your\key.pem -P 1818 fullchain.pem root@147.139.176.70:/opt/tas-production/ssl/
scp -i C:\path\to\your\key.pem -P 1818 privkey.pem root@147.139.176.70:/opt/tas-production/ssl/
```

---

## Method 2: Using WinSCP (Windows GUI) - Easiest for Windows Users

### Step 1: Download and Install WinSCP

1. Download WinSCP from: https://winscp.net/eng/download.php
2. Install it on your Windows machine

### Step 2: Connect to Your Server

1. **Open WinSCP**
2. **Enter connection details:**
   - **File protocol:** SFTP
   - **Host name:** `147.139.176.70`
   - **Port number:** `1818`
   - **User name:** `root`
   - **Password:** (enter your root password)
   - Click **Login**

3. **If first time connecting:**
   - You'll see a security warning - click **Yes** to accept the server's host key

### Step 3: Navigate to SSL Directory

1. In the **right panel** (remote server), navigate to:
   ```
   /opt/tas-production/ssl
   ```

2. **If the `ssl` folder doesn't exist:**
   - Right-click in the right panel
   - Select **New** → **Directory**
   - Name it: `ssl`
   - Press Enter

### Step 4: Upload Certificate Files

1. In the **left panel** (your local computer), navigate to the folder containing your SSL certificates

2. **Drag and drop** the following files from left to right:
   - `fullchain.pem`
   - `privkey.pem`

3. Wait for the upload to complete

### Step 5: Set File Permissions (Important!)

1. **Right-click on `fullchain.pem`** in the right panel
2. Select **Properties**
3. Set permissions to: `644` (or check: Owner: Read+Write, Group: Read, Others: Read)
4. Click **OK**

5. **Right-click on `privkey.pem`** in the right panel
6. Select **Properties**
7. Set permissions to: `600` (or check: Owner: Read+Write only, uncheck all others)
8. Click **OK**

---

## Method 3: Using FileZilla (Alternative GUI Tool)

### Step 1: Download FileZilla

1. Download FileZilla Client from: https://filezilla-project.org/download.php?type=client
2. Install it

### Step 2: Connect to Server

1. **Open FileZilla**
2. **Enter connection details in the top bar:**
   - **Host:** `sftp://147.139.176.70`
   - **Username:** `root`
   - **Password:** (your root password)
   - **Port:** `1818`
   - Click **Quickconnect**

### Step 3: Upload Files

1. **Left panel:** Navigate to your local SSL certificate folder
2. **Right panel:** Navigate to `/opt/tas-production/ssl`
3. **Select both files** (`fullchain.pem` and `privkey.pem`)
4. **Right-click** → **Upload**

### Step 4: Set Permissions

1. **Right-click on `fullchain.pem`** → **File permissions**
2. Set to: `644`
3. **Right-click on `privkey.pem`** → **File permissions**
4. Set to: `600`

---

## Method 4: Using PuTTY/PSFTP (Windows)

### Step 1: Download PSFTP

1. Download PuTTY suite from: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
2. Extract `psftp.exe`

### Step 2: Connect and Upload

```powershell
# Open PowerShell in the folder containing psftp.exe and your certificates
.\psftp.exe -P 1818 root@147.139.176.70

# Enter password when prompted

# Navigate to ssl directory
cd /opt/tas-production/ssl

# Upload files
put fullchain.pem
put privkey.pem

# Set permissions
chmod 644 fullchain.pem
chmod 600 privkey.pem

# Exit
quit
```

---

## Method 5: Direct Copy-Paste (If Files Are Small)

### Step 1: SSH into Server

```powershell
ssh -p 1818 root@147.139.176.70
```

### Step 2: Create Directory and Files

```bash
# Create ssl directory
mkdir -p /opt/tas-production/ssl
cd /opt/tas-production/ssl

# Create fullchain.pem file
nano fullchain.pem
# Paste the entire certificate content (including -----BEGIN CERTIFICATE----- and -----END CERTIFICATE-----)
# Press Ctrl+X, then Y, then Enter to save

# Create privkey.pem file
nano privkey.pem
# Paste the entire private key content (including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)
# Press Ctrl+X, then Y, then Enter to save
```

### Step 3: Set Permissions

```bash
chmod 644 fullchain.pem
chmod 600 privkey.pem
```

---

## After Uploading: Verify and Restart

### Step 1: Verify Files Are in Place

```bash
# SSH into server
ssh -p 1818 root@147.139.176.70

# Check files exist
ls -la /opt/tas-production/ssl/

# Should show:
# -rw-r--r-- 1 root root  fullchain.pem
# -rw------- 1 root root  privkey.pem
```

### Step 2: Verify File Contents

```bash
# Check certificate file format
head -1 /opt/tas-production/ssl/fullchain.pem
# Should show: -----BEGIN CERTIFICATE-----

# Check private key file format
head -1 /opt/tas-production/ssl/privkey.pem
# Should show: -----BEGIN PRIVATE KEY----- or -----BEGIN RSA PRIVATE KEY-----
```

### Step 3: Verify Certificate Details

```bash
# Check certificate information
openssl x509 -in /opt/tas-production/ssl/fullchain.pem -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"
# Should show your domain and validity dates
```

### Step 4: Restart NGINX

```bash
cd /opt/tas-production

# Test NGINX configuration first
docker compose -f docker-compose.frontend.yml -p tas-production exec nginx nginx -t

# If test passes, restart NGINX
docker compose -f docker-compose.frontend.yml -p tas-production restart nginx

# Check NGINX is running
docker ps | grep nginx
# Should show: Up (not Restarting)
```

### Step 5: Check NGINX Logs

```bash
# Check for any errors
docker logs --tail=50 tas_nginx

# If you see SSL errors, verify certificates are correct
```

---

## Troubleshooting

### Error: "Permission denied"

**Solution:**
```bash
# On the server
chmod 644 /opt/tas-production/ssl/fullchain.pem
chmod 600 /opt/tas-production/ssl/privkey.pem
```

### Error: "No such file or directory"

**Solution:**
```bash
# Create the directory
mkdir -p /opt/tas-production/ssl
```

### Error: "Connection refused" or "Connection timed out"

**Possible causes:**
1. **Wrong port:** Make sure you're using port `1818`, not `22`
2. **Firewall:** Check AliCloud Security Group allows port 1818
3. **Server down:** Verify the server is running

**Solution:**
```powershell
# Test connection
ssh -p 1818 root@147.139.176.70
```

### Error: "SSL certificate file not found" in NGINX logs

**Solution:**
1. Verify files exist:
   ```bash
   ls -la /opt/tas-production/ssl/
   ```

2. Check files are readable:
   ```bash
   cat /opt/tas-production/ssl/fullchain.pem
   cat /opt/tas-production/ssl/privkey.pem
   ```

3. Verify Docker can see them:
   ```bash
   docker compose -f docker-compose.frontend.yml -p tas-production exec nginx ls -la /etc/nginx/ssl/
   ```

### Files uploaded but NGINX still fails

**Check:**
1. File permissions are correct (644 for fullchain.pem, 600 for privkey.pem)
2. Files are not empty
3. Files are in PEM format (text, not binary)
4. Certificate and key match (see verification step above)

---

## Quick Checklist

- [ ] SSL certificate files prepared (`fullchain.pem` and `privkey.pem`)
- [ ] Files uploaded to `/opt/tas-production/ssl/` on server
- [ ] Permissions set: `chmod 644 fullchain.pem` and `chmod 600 privkey.pem`
- [ ] Files verified (not empty, correct format)
- [ ] NGINX configuration tested: `docker exec tas_nginx nginx -t`
- [ ] NGINX restarted: `docker compose restart nginx`
- [ ] NGINX running without errors: `docker ps | grep nginx`
- [ ] HTTPS accessible: `https://tas.energi-up.com:8443`

---

## Recommended Method for Windows Users

**For Windows users, I recommend Method 2 (WinSCP)** because:
- ✅ Easy-to-use graphical interface
- ✅ Drag-and-drop file transfer
- ✅ Built-in file permission editor
- ✅ No command-line knowledge required
- ✅ Free and widely used

---

**Need Help?** If you encounter any issues, check the NGINX logs:
```bash
docker logs --tail=100 tas_nginx
```

