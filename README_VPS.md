# VPS Setup Instructions for KGC ERP

Follow these steps to set up the production backend on your Ubuntu VPS.

## 1. Install System Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (Version 20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb-server
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

## 2. Deploy Code
1. Clone your git repo to `/var/www/edusec`.
2. Install frontend dependencies: `npm install && npm run build`.
3. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

## 3. Configure Environment
1. Create `server/.env`:
   ```bash
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/edusec
   ```
2. Create frontend `.env` (in root):
   ```bash
   VITE_API_URL=http://your-vps-ip # No trailing slash
   ```

## 4. Start the Backend
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 5. Setup Nginx
1. Use the `nginx.conf.example` provided in the root.
2. `sudo nano /etc/nginx/sites-available/edusec`
3. Paste the config, save, and exit.
4. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/edusec /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 6. Security (Recommended)
Install SSL:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```
