# SimuAI Platform - Deployment Guide

## 🚀 Production Deployment

This guide covers deploying the SimuAI platform to production.

---

## 📋 Pre-Deployment Checklist

- [ ] All code committed to git
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] SSL certificates ready
- [ ] Domain name configured
- [ ] Email service configured
- [ ] Payment gateway (Chapa) configured
- [ ] Monitoring tools set up

---

## 🔧 Environment Configuration

### Backend (.env)
```
# Database
DATABASE_URL=postgresql://user:password@host:5432/simuai_prod

# Security
JWT_SECRET=your-very-secure-random-string-here
NODE_ENV=production

# API Configuration
PORT=5000
CLIENT_URL=https://yourdomain.com

# Chapa Payment Gateway
CHAPA_API_KEY=your-chapa-api-key
CHAPA_SECRET_KEY=your-chapa-secret-key
CHAPA_WEBHOOK_URL=https://yourdomain.com/api/webhook/chapa

# Email Service (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Logging
LOG_LEVEL=info
```

### Frontend (.env)
```
# API Configuration
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_CHAPA_PUBLIC_KEY=your-chapa-public-key

# Environment
REACT_APP_ENV=production
```

---

## 🐳 Docker Deployment

### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: simuai
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: simuai_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./server
    environment:
      DATABASE_URL: postgresql://simuai:secure_password@postgres:5432/simuai_prod
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## ☁️ Cloud Deployment (AWS Example)

### 1. RDS Database Setup
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier simuai-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YourSecurePassword123 \
  --allocated-storage 20
```

### 2. EC2 Backend Deployment
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone repository
git clone https://github.com/yourusername/simuai.git
cd simuai/server

# Install dependencies
npm install

# Configure environment
nano .env

# Run migrations
npx prisma migrate deploy

# Start with PM2
npm install -g pm2
pm2 start npm --name "simuai-backend" -- start
pm2 save
```

### 3. S3 Frontend Deployment
```bash
# Build frontend
cd client
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## 🔒 SSL/TLS Configuration

### Using Let's Encrypt with Nginx
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# View logs
pm2 logs simuai-backend

# Monitor resources
pm2 monit
```

### Application Logging
```bash
# View error logs
tail -f server/logs/error.log

# View combined logs
tail -f server/logs/combined.log

# Archive old logs
gzip server/logs/combined.log.1
```

### Database Monitoring
```bash
# Connect to database
psql -h your-db-host -U admin -d simuai_prod

# Check connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔄 Backup & Recovery

### Database Backup
```bash
# Full backup
pg_dump -h your-db-host -U admin simuai_prod > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -h your-db-host -U admin simuai_prod | gzip > backup_$(date +%Y%m%d).sql.gz

# Automated daily backup
0 2 * * * pg_dump -h your-db-host -U admin simuai_prod | gzip > /backups/backup_$(date +\%Y\%m\%d).sql.gz
```

### Database Restore
```bash
# Restore from backup
psql -h your-db-host -U admin simuai_prod < backup_20260331.sql

# Restore from compressed backup
gunzip -c backup_20260331.sql.gz | psql -h your-db-host -U admin simuai_prod
```

---

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql -h your-db-host -U admin -d simuai_prod -c "SELECT 1"

# Check connection string
echo $DATABASE_URL

# Verify firewall rules
sudo ufw status
```

### Application Not Starting
```bash
# Check logs
pm2 logs simuai-backend

# Verify environment variables
env | grep DATABASE_URL

# Test database migrations
npx prisma migrate status
```

### High Memory Usage
```bash
# Check process memory
ps aux | grep node

# Restart application
pm2 restart simuai-backend

# Check for memory leaks
node --inspect server/index.js
```

---

## 📈 Performance Optimization

### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_applications_candidateId ON applications(candidateId);
CREATE INDEX idx_applications_jobId ON applications(jobId);
CREATE INDEX idx_interviews_candidateId ON interviews(candidateId);
CREATE INDEX idx_interviews_jobId ON interviews(jobId);
CREATE INDEX idx_jobs_createdById ON jobs(createdById);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM applications WHERE candidateId = 1;
```

### Application Optimization
```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Enable caching
const redis = require('redis');
const client = redis.createClient();

// Connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 🔐 Security Hardening

### Server Security
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Configure firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Set up fail2ban
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
```

### Application Security
```bash
# Keep dependencies updated
npm audit
npm audit fix

# Run security scan
npm install -g snyk
snyk test

# Check for vulnerabilities
npm outdated
```

---

## 📞 Post-Deployment

### Verification
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Database connection works
- [ ] Authentication works
- [ ] All dashboards load
- [ ] Cross-dashboard communication works
- [ ] Help center displays
- [ ] Error logging works

### Monitoring Setup
- [ ] Set up uptime monitoring
- [ ] Configure error alerts
- [ ] Set up performance monitoring
- [ ] Configure backup alerts
- [ ] Set up security monitoring

### Documentation
- [ ] Document deployment process
- [ ] Document emergency procedures
- [ ] Document rollback procedures
- [ ] Document support contacts

---

## 🎉 Deployment Complete!

Your SimuAI platform is now live in production with:
- ✅ Secure SSL/TLS encryption
- ✅ Database backups
- ✅ Monitoring and logging
- ✅ Performance optimization
- ✅ Security hardening
- ✅ Scalability ready

**Production deployment successful! 🚀**

---

**Last Updated**: March 31, 2026
**Version**: 1.0.0
