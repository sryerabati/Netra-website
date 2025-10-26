# netrapp.tech Deployment Guide

This document lists every command needed to provision netrapp.tech so that the Django API and the Vite frontend start automatically and keep running in the background. Replace `deploy` with the actual SSH user for the server and adjust paths if you store the repository somewhere else.

---

## 1. Log in to the production server

```bash
ssh deploy@netrapp.tech
```

## 2. Install system dependencies (run once)

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip git curl nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 3. Check out the application

```bash
cd /var/www
sudo mkdir -p netra
sudo chown "$USER":"$USER" netra
cd netra
git clone https://github.com/<your-org>/Netra-website.git
cd Netra-website
```

If the repository already exists, pull the latest code instead:

```bash
cd /var/www/netra/Netra-website
git fetch origin
git checkout main
git pull origin main
```

## 4. Configure the Django backend

```bash
cd /var/www/netra/Netra-website/backend/netra_backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt  # fallback below if no file exists
```

If `requirements.txt` is missing, install the known dependencies manually:

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow torch torchvision timm
```

Finish the one-time database setup:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser  # skip if already created
deactivate
```

## 5. Configure the Vite frontend

```bash
cd /var/www/netra/Netra-website
npm install
npm run build
```

## 6. Create persistent PM2 processes

Run each command exactly once; PM2 will remember the processes across reboots.

### Backend service (Django)

```bash
cd /var/www/netra/Netra-website
pm2 start backend/netra_backend/manage.py --name netra-backend --interpreter ./backend/netra_backend/venv/bin/python -- runserver 0.0.0.0:8000
pm2 save
```

### Frontend service (Vite preview)

Use Vite's preview server so the built files are served efficiently.

```bash
cd /var/www/netra/Netra-website
pm2 start "npm run preview -- --host 0.0.0.0 --port 4173" --name netra-frontend
pm2 save
```

If you prefer to serve the static build with Nginx, skip the PM2 frontend step and follow the optional reverse-proxy configuration below.

## 7. Configure Nginx reverse proxy (recommended)

Create a server block that forwards HTTPS traffic to the backend and frontend ports.

```bash
sudo tee /etc/nginx/sites-available/netrapp.tech <<'NGINX'
server {
    listen 80;
    server_name netrapp.tech www.netrapp.tech;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:4173/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
```

Enable the site and reload Nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/netrapp.tech /etc/nginx/sites-enabled/netrapp.tech
sudo nginx -t
sudo systemctl reload nginx
```

Use `certbot` if you need HTTPS certificates:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d netrapp.tech -d www.netrapp.tech
```

## 8. Managing the processes

```bash
pm2 status
pm2 logs netra-backend
pm2 logs netra-frontend
pm2 restart netra-backend
pm2 restart netra-frontend
pm2 stop netra-backend
pm2 stop netra-frontend
```

## 9. Update and redeploy

```bash
ssh deploy@netrapp.tech
cd /var/www/netra/Netra-website
git pull
cd backend/netra_backend
source venv/bin/activate
pip install -r requirements.txt  # or the manual list
python manage.py migrate
python manage.py collectstatic --noinput
deactivate
cd /var/www/netra/Netra-website
npm install
npm run build
pm2 restart netra-backend
pm2 restart netra-frontend
pm2 save
```

These commands ensure that both the backend API and the frontend stay online on netrapp.tech.
