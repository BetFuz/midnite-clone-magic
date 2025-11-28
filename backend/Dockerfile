# Betfuz Backend - Source-of-Truth Clock Configuration
# Ensures NTP synchronization to Africa/Lagos timezone for accurate bet settlement

FROM node:20-alpine

# Install chrony for NTP synchronization
RUN apk add --no-cache chrony tzdata

# Configure chrony for NTP pool synchronization
RUN echo "server pool.ntp.org iburst" >> /etc/chrony/chrony.conf && \
    echo "server 0.africa.pool.ntp.org iburst" >> /etc/chrony/chrony.conf && \
    echo "server 1.africa.pool.ntp.org iburst" >> /etc/chrony/chrony.conf && \
    echo "server 2.africa.pool.ntp.org iburst" >> /etc/chrony/chrony.conf && \
    echo "driftfile /var/lib/chrony/chrony.drift" >> /etc/chrony/chrony.conf && \
    echo "makestep 1.0 3" >> /etc/chrony/chrony.conf && \
    echo "rtcsync" >> /etc/chrony/chrony.conf

# Set timezone to Africa/Lagos (WAT - West Africa Time)
ENV TZ=Africa/Lagos
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Create chrony pid directory
RUN mkdir -p /var/run/chrony

# Create startup script that launches chrony and then the app
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'chronyd -d &' >> /start.sh && \
    echo 'sleep 5' >> /start.sh && \
    echo 'chronyc -a makestep' >> /start.sh && \
    echo 'node dist/main.js' >> /start.sh && \
    chmod +x /start.sh

# Expose application port
EXPOSE 3000

# Health check to verify NTP sync
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD chronyc tracking | grep "System time" || exit 1

# Start chrony and application
CMD ["/start.sh"]
