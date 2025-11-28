# Multi-stage build for Betfuz production deployment
FROM node:20-alpine AS builder

# Install chrony for NTP time synchronization (Africa/Lagos timezone)
RUN apk add --no-cache chrony tzdata

# Configure chrony for Lagos timezone with pool.ntp.org
RUN echo "server pool.ntp.org iburst" > /etc/chrony/chrony.conf && \
    echo "driftfile /var/lib/chrony/drift" >> /etc/chrony/chrony.conf && \
    echo "makestep 1.0 3" >> /etc/chrony/chrony.conf && \
    echo "rtcsync" >> /etc/chrony/chrony.conf

# Set timezone to Africa/Lagos
ENV TZ=Africa/Lagos
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY public ./public

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install chrony and tzdata for NTP sync
RUN apk add --no-cache chrony tzdata

# Copy chrony config from builder
COPY --from=builder /etc/chrony/chrony.conf /etc/chrony/chrony.conf

# Set timezone to Africa/Lagos
ENV TZ=Africa/Lagos
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install serve for production deployment
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start chrony daemon and application
CMD chronyd -d && serve -s dist -l 3000
