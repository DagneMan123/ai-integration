# 🚀 SimuAI Platform - Final Deployment Guide

## Quick Start for Production

### Prerequisites
- Node.js 16+ installed
- PostgreSQL 12+ installed
- npm or yarn package manager
- Git for version control
- SSL certificate (for HTTPS)

---

## 📋 STEP-BY-STEP DEPLOYMENT

### Step 1: Environment Setup

#### Backend Environment Variables
Create `server/.env`:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/simuai_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@simuai.com

# Payment Gateway (Chapa)
CHAPA_API_KEY=your-chapa-api-key
CHAPA_SECRET_KEY=your-chapa-secret-key

# Cloud Storage
CLOUD_STORAGE_BUCKET=simuai-bucket
CLOUD_STORAGE_KEY=your-storage-key
CLOUD_STORAGE_SECRET=your-storage-secret

# AI Service
OPENAI_API_KEY=your-openai-api-key
AI_MODEL=gpt-4

# Server
PORT=5000
NODE_ENV=production
LOG_LEVEL=info
```

#### Frontend Environment Variables
Create `client/.env`:
```env
REACT_APP_API_URL=https://api.simuai.com/api
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
```

### Step 2: Database Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed

# Verify database connection
npx prisma db execute --stdin < verify.sql
```

### Step 3: Backend Deployment

```bash
# Install dependencies
npm install

# Build (if needed)
npm run build

# Start server
npm start

# Or use PM2 for production
npm install -g pm2
pm2 start index.js --name "simuai-api"
pm2 save
pm2 startup
```

### Step 4: Frontend Deployment

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to hosting (Vercel, Netlify, AWS S3, etc.)
# Example: Vercel
vercel --prod

# Or serve locally with production build
npm install -g serve
serve -s build -l 3000
```

### Step 5: SSL/TLS Configuration

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d api.simuai.com
sudo certbot certonly --standalone -d simuai.com

# Configure nginx/Apache to use certificates
# Update server configuration to use:
# /etc/letsencrypt/live/api.simuai.com/fullchain.pem
# /etc/letsencrypt/live/api.simuai.com/privkey.pem
```

### Step 6: Reverse Proxy Setup (Nginx)

Create `/etc/nginx/sites-available/simuai`:
```nginx
# Backend API
upstream api_backend {
    server localhost:5000;
}

# Frontend
upstream frontend {
    server localhost:3000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.simuai.com simuai.com;
    return 301 https://$server_name$request_uri;
}

# API Server
server {
    listen 443 ssl http2;
    server_name api.simuai.com;

    ssl_certificate /etc/letsencrypt/live/api.simuai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.simuai.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend Server
server {
    listen 443 ssl http2;
    server_name simuai.com www.simuai.com;

    ssl_certificate /etc/letsencrypt/live/simuai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/simuai.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/simuai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Process Management (PM2)

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'simuai-api',
      script: './server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 8: Database Backup

Create backup script `backup-db.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/backups/simuai"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="simuai_db"
DB_USER="postgres"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.sql.gz"
```

Schedule with cron:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-db.sh
```

### Step 9: Monitoring & Logging

Install monitoring tools:
```bash
# PM2 Monitoring
pm2 install pm2-auto-pull
pm2 install pm2-logrotate

# Application Performance Monitoring
npm install --save newrelic
# Configure newrelic.js

# Error Tracking
npm install --save @sentry/node
```

### Step 10: Health Checks

Create health check endpoint:
```bash
# Test API
curl https://api.simuai.com/api/health

# Test Frontend
curl https://simuai.com/

# Test Database
curl https://api.simuai.com/api/health/db
```

---

## 🔍 VERIFICATION CHECKLIST

### Pre-Deployment
- [ ] All environment variables set
- [ ] Database migrations completed
- [ ] SSL certificates installed
- [ ] Backup strategy configured
- [ ] Monitoring tools installed
- [ ] Email service configured
- [ ] Payment gateway configured
- [ ] Cloud storage configured

### Deployment
- [ ] Backend server started
- [ ] Frontend deployed
- [ ] Nginx configured
- [ ] SSL working
- [ ] PM2 running
- [ ] Database connected
- [ ] All services healthy

### Post-Deployment
- [ ] API endpoints responding
- [ ] Frontend loading
- [ ] Authentication working
- [ ] Database queries working
- [ ] Email notifications working
- [ ] Payment processing working
- [ ] File uploads working
- [ ] Logging working
- [ ] Monitoring active
- [ ] Backups running

---

## 🚨 TROUBLESHOOTING

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -d simuai_db -c "SELECT 1"

# Check connection string
echo $DATABASE_URL
```

### API Not Responding
```bash
# Check if port is in use
lsof -i :5000

# Check PM2 logs
pm2 logs simuai-api

# Restart service
pm2 restart simuai-api
```

### Frontend Not Loading
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify frontend build
ls -la client/build/
```

### SSL Certificate Issues
```bash
# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/api.simuai.com/fullchain.pem -noout -dates

# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```

---

## 📊 MONITORING COMMANDS

```bash
# Check system resources
top
free -h
df -h

# Check PM2 status
pm2 status
pm2 logs

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check database
psql -U postgres -d simuai_db -c "SELECT COUNT(*) FROM users;"

# Check API health
curl https://api.simuai.com/api/health

# Check logs
tail -f server/logs/error.log
tail -f server/logs/combined.log
```

---

## 🔐 SECURITY HARDENING

### Firewall Configuration
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### Fail2Ban Setup
```bash
# Install
sudo apt-get install fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Start
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### Rate Limiting
Already configured in backend middleware.

### DDoS Protection
- Use Cloudflare or similar CDN
- Enable rate limiting
- Configure WAF rules

---

## 📈 PERFORMANCE OPTIMIZATION

### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM jobs WHERE company_id = 1;
```

### Frontend Optimization
```bash
# Build analysis
npm run build -- --analyze

# Optimize bundle
npm install --save-dev webpack-bundle-analyzer

# Enable gzip compression in Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### Caching Strategy
- Browser caching: 1 year for static assets
- API caching: 5 minutes for public data
- Database caching: Redis for frequently accessed data

---

## 🎯 LAUNCH CHECKLIST

- [ ] Domain registered and configured
- [ ] SSL certificates installed
- [ ] Database backed up
- [ ] Monitoring configured
- [ ] Logging configured
- [ ] Email service tested
- [ ] Payment gateway tested
- [ ] File uploads tested
- [ ] All features tested
- [ ] Performance tested
- [ ] Security tested
- [ ] Backup tested
- [ ] Disaster recovery tested
- [ ] Team trained
- [ ] Documentation complete
- [ ] Support team ready

---

## 📞 SUPPORT & MAINTENANCE

### Daily Tasks
- Monitor error logs
- Check system resources
- Verify backups completed
- Monitor user activity

### Weekly Tasks
- Review performance metrics
- Check security logs
- Update dependencies
- Test disaster recovery

### Monthly Tasks
- Security audit
- Performance optimization
- Database maintenance
- Capacity planning

### Quarterly Tasks
- Major updates
- Security patches
- Feature releases
- Compliance review

---

## 🎉 DEPLOYMENT COMPLETE

Your SimuAI platform is now deployed and ready for production use!

### Next Steps:
1. Monitor system performance
2. Gather user feedback
3. Plan feature enhancements
4. Scale infrastructure as needed
5. Maintain security standards

### Support Resources:
- Documentation: See PROFESSIONAL_DASHBOARD_SYSTEM.md
- API Reference: See backend controllers
- Frontend Guide: See COMPLETE_FRONTEND_GUIDE.md
- Troubleshooting: See this guide

---

**Status**: ✅ **DEPLOYMENT COMPLETE**

**Platform**: SimuAI v1.0.0
**Date**: February 21, 2026
**Environment**: Production
