# Founder Network Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Founder Network platform to production environments. It covers infrastructure setup, deployment processes, monitoring, and maintenance procedures.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Architecture Overview](#architecture-overview)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [WebSocket Server Deployment](#websocket-server-deployment)
8. [Continuous Integration/Continuous Deployment](#continuous-integrationcontinuous-deployment)
9. [SSL Configuration](#ssl-configuration)
10. [Monitoring and Logging](#monitoring-and-logging)
11. [Backup and Recovery](#backup-and-recovery)
12. [Scaling Strategies](#scaling-strategies)
13. [Performance Optimization](#performance-optimization)
14. [Security Considerations](#security-considerations)
15. [Troubleshooting](#troubleshooting)

## System Requirements

### Production Environment

- **CPU**: Minimum 4 cores, recommended 8+ cores
- **RAM**: Minimum 8GB, recommended 16GB+
- **Storage**: Minimum 100GB SSD, recommended 250GB+ SSD
- **Network**: 1Gbps connection, low latency
- **Operating System**: Ubuntu 20.04 LTS or later

### Development Environment

- **CPU**: 2+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+
- **Operating System**: macOS, Windows, or Linux

## Architecture Overview

Founder Network uses a microservices architecture with the following components:

1. **Frontend**: Next.js React application
2. **Backend API**: Node.js Express server
3. **WebSocket Server**: Socket.IO for real-time communication
4. **Database**: PostgreSQL for relational data
5. **Redis**: For caching and session management
6. **Object Storage**: AWS S3 or compatible service for file storage
7. **CDN**: For static asset delivery
8. **Load Balancer**: For distributing traffic

### Architecture Diagram

```
                                  ┌─────────────┐
                                  │   CDN       │
                                  └──────┬──────┘
                                         │
                                         ▼
┌─────────────┐               ┌──────────────────┐
│  Web Client │◄──────────────►   Load Balancer  │
└─────────────┘               └─────────┬────────┘
                                        │
                     ┌──────────────────┴──────────────────┐
                     │                                     │
                     ▼                                     ▼
              ┌─────────────┐                     ┌─────────────────┐
              │  Frontend   │                     │  Backend API    │
              │  (Next.js)  │◄───────────────────►│  (Node.js)      │
              └──────┬──────┘                     └────────┬────────┘
                     │                                     │
                     │                                     │
                     │                              ┌──────┴───────┐
                     │                              │              │
                     │                              ▼              ▼
                     │                      ┌─────────────┐ ┌─────────────┐
                     └─────────────────────►│ WebSocket   │ │ PostgreSQL  │
                                            │ Server      │ │ Database    │
                                            └──────┬──────┘ └──────┬──────┘
                                                   │               │
                                                   ▼               │
                                            ┌─────────────┐        │
                                            │   Redis     │◄───────┘
                                            └─────────────┘
```

## Environment Setup

### Setting Up Production Environment Variables

Create a `.env.production` file with the following variables:

```
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.foundernetwork.com
FRONTEND_URL=https://foundernetwork.com

# Database
DATABASE_URL=postgresql://username:password@hostname:port/database
REDIS_URL=redis://username:password@hostname:port

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
COOKIE_SECRET=your_cookie_secret

# Storage
S3_BUCKET=your-bucket-name
S3_REGION=us-west-2
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# Email
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@foundernetwork.com

# Analytics
GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X

# Monitoring
SENTRY_DSN=https://your_sentry_dsn
```

### Setting Up Infrastructure with Terraform

We use Terraform to provision and manage infrastructure. The configuration files are in the `/terraform` directory.

To initialize and apply the Terraform configuration:

```bash
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

## Database Setup

### PostgreSQL Setup

1. Create the database:

```sql
CREATE DATABASE founder_network;
CREATE USER founder_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE founder_network TO founder_user;
```

2. Run migrations:

```bash
cd server
npm run migrate:production
```

3. Set up database backups:

```bash
# Add to crontab
0 2 * * * pg_dump -U founder_user founder_network | gzip > /backups/founder_network_$(date +\%Y\%m\%d).sql.gz
```

### Redis Setup

1. Install and configure Redis:

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
```

2. Update Redis configuration for production:

```bash
sudo nano /etc/redis/redis.conf
```

Set the following parameters:

```
maxmemory 2gb
maxmemory-policy allkeys-lru
appendonly yes
```

3. Restart Redis:

```bash
sudo systemctl restart redis-server
```

## Backend Deployment

### Preparing the Backend

1. Build the backend:

```bash
cd server
npm ci
npm run build
```

2. Set up PM2 for process management:

```bash
npm install -g pm2
pm2 startup
```

3. Create a PM2 ecosystem file (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [
    {
      name: 'founder-network-api',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      combine_logs: true
    }
  ]
};
```

4. Start the application:

```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

### Deploying with Docker

Alternatively, deploy using Docker:

1. Build the Docker image:

```bash
docker build -t founder-network-api:latest .
```

2. Run the container:

```bash
docker run -d --name founder-network-api \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  founder-network-api:latest
```

## Frontend Deployment

### Building the Frontend

1. Install dependencies and build:

```bash
cd client
npm ci
npm run build
```

2. Optimize static assets:

```bash
npx next-compress
```

### Deploying to Vercel

For Vercel deployment:

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy to production:

```bash
vercel --prod
```

### Deploying to Nginx

For Nginx deployment:

1. Install Nginx:

```bash
sudo apt update
sudo apt install nginx
```

2. Configure Nginx:

```bash
sudo nano /etc/nginx/sites-available/founder-network
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name foundernetwork.com www.foundernetwork.com;

    location / {
        root /var/www/founder-network;
        try_files $uri $uri.html $uri/ /index.html;
        expires 30d;
    }

    location /_next/static {
        alias /var/www/founder-network/_next/static;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/founder-network /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## WebSocket Server Deployment

### Setting Up the WebSocket Server

1. Build the WebSocket server:

```bash
cd websocket-server
npm ci
npm run build
```

2. Create a PM2 configuration:

```javascript
module.exports = {
  apps: [
    {
      name: 'founder-network-websocket',
      script: 'dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      max_memory_restart: '1G'
    }
  ]
};
```

3. Start the WebSocket server:

```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

### Configuring Nginx for WebSockets

Update your Nginx configuration to proxy WebSocket connections:

```nginx
location /socket.io {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

## Continuous Integration/Continuous Deployment

### Setting Up GitHub Actions

Create a workflow file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: |
          cd server
          npm ci
          cd ../client
          npm ci
          
      - name: Run tests
        run: |
          cd server
          npm test
          cd ../client
          npm test
          
      - name: Build
        run: |
          cd server
          npm run build
          cd ../client
          npm run build
          
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/founder-network
            git pull
            cd server
            npm ci
            npm run build
            pm2 reload founder-network-api
            cd ../client
            npm ci
            npm run build
            cd ../websocket-server
            npm ci
            npm run build
            pm2 reload founder-network-websocket
```

### Setting Up Deployment Hooks

For Vercel, set up a deployment hook:

1. Go to Vercel project settings
2. Navigate to Git Integration
3. Create a deploy hook
4. Add the hook URL to your CI/CD pipeline

## SSL Configuration

### Obtaining SSL Certificates with Let's Encrypt

1. Install Certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

2. Obtain and install certificates:

```bash
sudo certbot --nginx -d foundernetwork.com -d www.foundernetwork.com
```

3. Set up auto-renewal:

```bash
sudo systemctl status certbot.timer
```

### Configuring Nginx for SSL

Update your Nginx configuration:

```nginx
server {
    listen 80;
    server_name foundernetwork.com www.foundernetwork.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name foundernetwork.com www.foundernetwork.com;
    
    ssl_certificate /etc/letsencrypt/live/foundernetwork.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/foundernetwork.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # HSTS (optional)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    
    # Other headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    # Rest of your configuration...
}
```

## Monitoring and Logging

### Setting Up Monitoring with Prometheus and Grafana

1. Install Prometheus:

```bash
wget https://github.com/prometheus/prometheus/releases/download/v2.30.3/prometheus-2.30.3.linux-amd64.tar.gz
tar xvfz prometheus-2.30.3.linux-amd64.tar.gz
cd prometheus-2.30.3.linux-amd64
```

2. Configure Prometheus (`prometheus.yml`):

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'founder-network-api'
    static_configs:
      - targets: ['localhost:3000']
  
  - job_name: 'founder-network-websocket'
    static_configs:
      - targets: ['localhost:3001']
```

3. Install Grafana:

```bash
sudo apt-get install -y apt-transport-https software-properties-common
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
sudo apt-get update
sudo apt-get install grafana
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

4. Configure Grafana:
   - Access Grafana at http://your-server-ip:3000
   - Default login: admin/admin
   - Add Prometheus as a data source
   - Import dashboards for Node.js monitoring

### Setting Up Logging with ELK Stack

1. Install Elasticsearch:

```bash
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
sudo apt-get install apt-transport-https
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt-get update
sudo apt-get install elasticsearch
sudo systemctl enable elasticsearch
sudo systemctl start elasticsearch
```

2. Install Kibana:

```bash
sudo apt-get install kibana
sudo systemctl enable kibana
sudo systemctl start kibana
```

3. Install Logstash:

```bash
sudo apt-get install logstash
```

4. Configure Logstash (`/etc/logstash/conf.d/founder-network.conf`):

```
input {
  file {
    path => "/home/ubuntu/.pm2/logs/founder-network-api-out.log"
    type => "founder-network-api"
  }
  file {
    path => "/home/ubuntu/.pm2/logs/founder-network-websocket-out.log"
    type => "founder-network-websocket"
  }
}

filter {
  json {
    source => "message"
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "founder-network-%{+YYYY.MM.dd}"
  }
}
```

5. Start Logstash:

```bash
sudo systemctl enable logstash
sudo systemctl start logstash
```

### Setting Up Error Tracking with Sentry

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project for your application
3. Get your DSN
4. Add the DSN to your environment variables
5. Integrate Sentry in your application code

## Backup and Recovery

### Database Backup Strategy

1. Set up daily backups:

```bash
# Create backup script
cat > /usr/local/bin/backup-database.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/postgres"
FILENAME="founder_network_$TIMESTAMP.sql.gz"

mkdir -p $BACKUP_DIR

pg_dump -U founder_user founder_network | gzip > $BACKUP_DIR/$FILENAME

# Keep only last 30 daily backups
find $BACKUP_DIR -name "founder_network_*.sql.gz" -type f -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-database.sh

# Add to crontab
echo "0 2 * * * /usr/local/bin/backup-database.sh" | sudo tee -a /etc/crontab
```

2. Set up weekly offsite backups:

```bash
# Create offsite backup script
cat > /usr/local/bin/offsite-backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d")
BACKUP_DIR="/backups/postgres"
FILENAME="founder_network_$TIMESTAMP.sql.gz"

# Copy latest backup to S3
aws s3 cp $BACKUP_DIR/$FILENAME s3://founder-network-backups/postgres/

# Keep only last 12 weekly backups in S3
aws s3 ls s3://founder-network-backups/postgres/ --recursive | sort | head -n -12 | awk '{print $4}' | xargs -I {} aws s3 rm s3://founder-network-backups/postgres/{}
EOF

chmod +x /usr/local/bin/offsite-backup.sh

# Add to crontab
echo "0 3 * * 0 /usr/local/bin/offsite-backup.sh" | sudo tee -a /etc/crontab
```

### File Storage Backup

For S3 or similar object storage:

1. Enable versioning on your S3 bucket:

```bash
aws s3api put-bucket-versioning --bucket founder-network-uploads --versioning-configuration Status=Enabled
```

2. Set up lifecycle rules to manage versions:

```bash
aws s3api put-bucket-lifecycle-configuration --bucket founder-network-uploads --lifecycle-configuration file://lifecycle.json
```

Where `lifecycle.json` contains:

```json
{
  "Rules": [
    {
      "ID": "Delete old versions",
      "Status": "Enabled",
      "Filter": {
        "Prefix": ""
      },
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 90
      }
    }
  ]
}
```

### Disaster Recovery Plan

1. Document recovery procedures:

```markdown
# Disaster Recovery Procedure

## Database Recovery

1. Identify the latest backup file
2. Restore the database:
   ```
   gunzip -c /backups/postgres/founder_network_YYYYMMDD.sql.gz | psql -U founder_user -d founder_network
   ```
   or from S3:
   ```
   aws s3 cp s3://founder-network-backups/postgres/founder_network_YYYYMMDD.sql.gz - | gunzip | psql -U founder_user -d founder_network
   ```

## Application Recovery

1. Clone the repository:
   ```
   git clone https://github.com/your-org/founder-network.git
   ```
2. Install dependencies and build:
   ```
   cd server
   npm ci
   npm run build
   
   cd ../client
   npm ci
   npm run build
   
   cd ../websocket-server
   npm ci
   npm run build
   ```
3. Start services:
   ```
   pm2 start ecosystem.config.js --env production
   ```

## Infrastructure Recovery

1. Apply Terraform configuration:
   ```
   cd terraform
   terraform apply -auto-approve
   ```
2. Configure DNS to point to new infrastructure
```

2. Test recovery procedures regularly:

```bash
# Schedule monthly recovery tests
echo "0 4 1 * * /usr/local/bin/test-recovery.sh" | sudo tee -a /etc/crontab
```

## Scaling Strategies

### Horizontal Scaling

1. Set up load balancing with Nginx:

```nginx
upstream api_servers {
    server api1.foundernetwork.com:3000;
    server api2.foundernetwork.com:3000;
    server api3.foundernetwork.com:3000;
}

server {
    listen 80;
    server_name api.foundernetwork.com;
    
    location / {
        proxy_pass http://api_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

2. Set up auto-scaling with Kubernetes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: founder-network-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: founder-network-api
  template:
    metadata:
      labels:
        app: founder-network-api
    spec:
      containers:
      - name: founder-network-api
        image: founder-network-api:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
---
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: founder-network-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: founder-network-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling

1. Set up read replicas:

```sql
-- On primary database
SELECT pg_create_physical_replication_slot('replica_1_slot');

-- On replica
PRIMARY_CONNINFO='host=primary_host port=5432 user=replication_user password=password'
PRIMARY_SLOT_NAME='replica_1_slot'
```

2. Implement connection pooling with PgBouncer:

```ini
[databases]
founder_network = host=localhost port=5432 dbname=founder_network

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

## Performance Optimization

### Frontend Optimization

1. Implement code splitting:

```javascript
// In Next.js
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});
```

2. Optimize images:

```bash
# Install image optimization tools
npm install -g sharp

# Add to build process
find public/images -type f -name "*.jpg" -exec sharp {} -o {}.optimized.jpg \;
```

3. Implement caching headers:

```nginx
location /_next/static {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location /images {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
}
```

### Backend Optimization

1. Implement API response caching with Redis:

```javascript
const cacheMiddleware = async (req, res, next) => {
  const cacheKey = `api:${req.originalUrl}`;
  
  try {
    const cachedResponse = await redisClient.get(cacheKey);
    
    if (cachedResponse) {
      return res.json(JSON.parse(cachedResponse));
    }
    
    // Store original res.json function
    const originalJson = res.json;
    
    // Override res.json
    res.json = function(data) {
      // Cache the response
      redisClient.set(cacheKey, JSON.stringify(data), 'EX', 300); // 5 minutes
      
      // Call original function
      return originalJson.call(this, data);
    };
    
    next();
  } catch (error) {
    console.error('Cache error:', error);
    next();
  }
};
```

2. Optimize database queries:

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Add composite indexes for common query patterns
CREATE INDEX idx_jobs_location_type ON jobs(location, type);
```

3. Implement database query caching:

```javascript
const cachedQuery = async (query, params, cacheKey, ttl = 300) => {
  try {
    // Check cache first
    const cachedResult = await redisClient.get(cacheKey);
    
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }
    
    // Execute query if not in cache
    const result = await db.query(query, params);
    
    // Cache the result
    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', ttl);
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
```

## Security Considerations

### Implementing Security Headers

Add security headers to your Nginx configuration:

```nginx
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://analytics.foundernetwork.com; img-src 'self' data: https://storage.foundernetwork.com; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://api.foundernetwork.com wss://ws.foundernetwork.com;";
add_header Referrer-Policy strict-origin-when-cross-origin;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
```

### Setting Up a Web Application Firewall (WAF)

1. Install ModSecurity for Nginx:

```bash
sudo apt update
sudo apt install libmodsecurity3 libmodsecurity-dev
git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git
```

2. Configure ModSecurity:

```bash
# Create configuration file
sudo nano /etc/nginx/modsecurity/main.conf
```

Add the following configuration:

```
SecRuleEngine On
SecRequestBodyAccess On
SecRule REQUEST_HEADERS:Content-Type "(?:application(?:/soap\+|/)|text/)xml" \
     "id:'200000',phase:1,t:none,t:lowercase,pass,nolog,ctl:requestBodyProcessor=XML"
SecRule REQUEST_HEADERS:Content-Type "application/json" \
     "id:'200001',phase:1,t:none,t:lowercase,pass,nolog,ctl:requestBodyProcessor=JSON"
Include /etc/nginx/modsecurity/owasp-crs/crs-setup.conf
Include /etc/nginx/modsecurity/owasp-crs/rules/*.conf
```

3. Enable ModSecurity in Nginx:

```nginx
server {
    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsecurity/main.conf;
    
    # Rest of your configuration...
}
```

### Implementing Rate Limiting

Add rate limiting to your Nginx configuration:

```nginx
# Define rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=3r/m;

server {
    # Apply rate limiting to API endpoints
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:3000;
    }
    
    # Apply stricter rate limiting to authentication endpoints
    location /api/auth/ {
        limit_req zone=login_limit burst=5 nodelay;
        proxy_pass http://localhost:3000;
    }
}
```

## Troubleshooting

### Common Issues and Solutions

#### Application Won't Start

1. Check for port conflicts:

```bash
sudo netstat -tulpn | grep 3000
```

2. Check for permission issues:

```bash
ls -la /path/to/founder-network
```

3. Check logs:

```bash
pm2 logs founder-network-api
```

#### Database Connection Issues

1. Check database status:

```bash
sudo systemctl status postgresql
```

2. Verify connection parameters:

```bash
psql -U founder_user -h localhost -d founder_network
```

3. Check firewall rules:

```bash
sudo ufw status
```

#### High Server Load

1. Identify resource usage:

```bash
top
htop
```

2. Check disk space:

```bash
df -h
```

3. Monitor network traffic:

```bash
sudo iftop
```

### Debugging Tools

1. Node.js debugging:

```bash
NODE_ENV=production NODE_DEBUG=http,net,stream pm2 restart founder-network-api --update-env
```

2. Database query debugging:

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 200; -- Log queries taking more than 200ms
ALTER SYSTEM SET log_statement = 'all'; -- Log all statements
SELECT pg_reload_conf();
```

3. Network debugging:

```bash
# Check connectivity
curl -v https://api.foundernetwork.com/health

# Monitor network traffic
sudo tcpdump -i eth0 port 3000
```

### Support Resources

- Internal documentation: https://docs.foundernetwork.com
- GitHub repository: https://github.com/your-org/founder-network
- Support email: devops@foundernetwork.com
- Emergency contact: +1-555-123-4567

---

## Conclusion

This deployment guide provides comprehensive instructions for deploying and maintaining the Founder Network platform in production environments. Follow these guidelines to ensure a stable, secure, and performant application.

For additional assistance, contact the DevOps team at devops@foundernetwork.com.

---

Last updated: 2023-10-15