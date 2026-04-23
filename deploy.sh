#!/bin/bash

# EduSec ERP - Ubuntu VPS Deployment Script
# This script prepares your Ubuntu server for hosting the EduSec ERP.

# 1. Update System
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# 2. Install Dependencies
echo "Installing Nginx, Node.js, and Certbot..."
sudo apt install nginx nodejs npm certbot python3-certbot-nginx -y

# 3. Build Application
echo "Building EduSec ERP..."
npm install
npm run build

# 4. Configure Nginx
echo "Configuring Nginx..."
cat <<EOF | sudo tee /etc/nginx/sites-available/edusec
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    root $(pwd)/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
EOF

sudo ln -s /etc/nginx/sites-available/edusec /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 5. SSL Setup (Optional - Uncomment after setting YOUR_DOMAIN_OR_IP)
# echo "Setting up SSL..."
# sudo certbot --nginx -d YOUR_DOMAIN_OR_IP

echo "Deployment completed! Access your site at http://YOUR_DOMAIN_OR_IP"
