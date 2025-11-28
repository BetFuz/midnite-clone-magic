# Cloudflare WAF & Rate Limiting Configuration

## Overview
Betfuz uses Cloudflare as the edge security layer, providing DDoS protection, rate limiting, and access controls for public and admin infrastructure.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE                          │
│  ┌────────────────────┐        ┌─────────────────────────┐ │
│  │   betfuz.com       │        │  admin.betfuz.com       │ │
│  │   (Public Site)    │        │  (VPN-Only)             │ │
│  │                    │        │                         │ │
│  │  WAF Rules:        │        │  Cloudflare Access:     │ │
│  │  - Rate Limits     │        │  - Corporate SSO        │ │
│  │  - Geo Blocking    │        │  - IP Allowlist         │ │
│  │  - Bot Detection   │        │  - MFA Required         │ │
│  └────────────────────┘        └─────────────────────────┘ │
│           │                              │                  │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
            ▼                              ▼
   ┌────────────────┐           ┌──────────────────┐
   │  Public API    │           │   Admin API      │
   │  /api/*        │           │   /admin/*       │
   │  (Backend)     │           │   (Backend)      │
   └────────────────┘           └──────────────────┘
```

---

## Public Site Configuration (betfuz.com)

### Cloudflare Page Rules

```yaml
# betfuz.com/* (All Public Routes)
Page Rule 1: betfuz.com/*
  - Security Level: High
  - Cache Level: Standard
  - Browser Cache TTL: 4 hours
  - WAF: ON
  - DDoS Protection: ON

# API Routes
Page Rule 2: betfuz.com/api/*
  - Security Level: High
  - Cache Level: Bypass
  - WAF: ON
  - Rate Limiting: ON
```

### WAF Custom Rules

#### 1. Rate Limiting (General)
```yaml
Rule Name: General API Rate Limit
Expression: (http.request.uri.path contains "/api/")
Action: Block
Rate: 100 requests per minute per IP
Duration: 60 seconds
```

#### 2. Rate Limiting (Bet Placement)
```yaml
Rule Name: Bet Placement Rate Limit
Expression: (http.request.uri.path eq "/api/bet-placement")
Action: Challenge
Rate: 10 requests per minute per user
Duration: 60 seconds
```

#### 3. Rate Limiting (Authentication)
```yaml
Rule Name: Auth Rate Limit
Expression: (http.request.uri.path contains "/auth/")
Action: Block
Rate: 5 requests per minute per IP
Duration: 300 seconds (5 minutes)
```

#### 4. Geographic Blocking (Optional)
```yaml
Rule Name: Block High-Risk Countries
Expression: (ip.geoip.country in {"CN" "RU" "KP"})
Action: Block
```

#### 5. Bot Detection
```yaml
Rule Name: Block Known Bots
Expression: (cf.bot_management.score lt 30)
Action: Challenge
```

#### 6. SQL Injection Protection
```yaml
Rule Name: SQL Injection Block
Expression: (http.request.uri.query contains "' OR 1=1" or 
            http.request.uri.query contains "UNION SELECT" or
            http.request.body contains "'; DROP TABLE")
Action: Block
```

### Firewall Rules Dashboard

```javascript
// Export Cloudflare WAF rules as Terraform configuration
resource "cloudflare_ruleset" "betfuz_waf" {
  zone_id     = var.cloudflare_zone_id
  name        = "Betfuz WAF Ruleset"
  description = "Custom WAF rules for Betfuz platform"
  kind        = "zone"
  phase       = "http_request_firewall_custom"

  rules {
    action = "block"
    expression = "(http.request.uri.path contains \"/api/\") and (rate(http.request.uri.path, 1m) > 100)"
    description = "General API Rate Limit"
  }

  rules {
    action = "challenge"
    expression = "(http.request.uri.path eq \"/api/bet-placement\") and (rate(http.request.uri.path, 1m) > 10)"
    description = "Bet Placement Rate Limit"
  }

  rules {
    action = "block"
    expression = "(http.request.uri.path contains \"/auth/\") and (rate(http.request.uri.path, 1m) > 5)"
    description = "Auth Rate Limit"
  }

  rules {
    action = "block"
    expression = "ip.geoip.country in {\"CN\" \"RU\" \"KP\"}"
    description = "Block High-Risk Countries"
  }

  rules {
    action = "challenge"
    expression = "cf.bot_management.score lt 30"
    description = "Bot Detection"
  }
}
```

---

## Admin Site Configuration (admin.betfuz.com)

### Cloudflare Access Setup

#### Access Application
```yaml
Application Name: Betfuz Admin Portal
Domain: admin.betfuz.com
Session Duration: 4 hours

Identity Providers:
  - Google Workspace SSO (betfuz.com domain)
  - Azure AD (for enterprise accounts)

Access Policies:
  1. Require: Email ends with @betfuz.com
  2. Require: MFA enrollment
  3. Require: IP in allowlist (office IPs)
  4. Exclude: Service accounts
```

#### IP Allowlist
```yaml
# Office IP addresses (Update with your actual IPs)
Allowed IPs:
  - 102.89.XXX.XXX/32  # Lagos Office
  - 197.210.XXX.XXX/32 # Abuja Office
  - 41.203.XXX.XXX/32  # South Africa Office
  - 154.0.XXX.XXX/32   # Kenya Office
  - VPN IP Range: 10.8.0.0/24 (if using VPN)
```

### Admin WAF Rules
```yaml
Rule Name: Admin IP Allowlist
Expression: (http.host eq "admin.betfuz.com") and not (ip.src in {102.89.XXX.XXX 197.210.XXX.XXX 41.203.XXX.XXX})
Action: Block
```

### Cloudflare Access Configuration (Terraform)

```hcl
# Terraform configuration for Cloudflare Access
resource "cloudflare_access_application" "betfuz_admin" {
  zone_id          = var.cloudflare_zone_id
  name             = "Betfuz Admin Portal"
  domain           = "admin.betfuz.com"
  session_duration = "4h"
  
  cors_headers {
    allowed_origins = ["https://admin.betfuz.com"]
    allow_all_methods = true
  }
}

resource "cloudflare_access_policy" "betfuz_admin_policy" {
  application_id = cloudflare_access_application.betfuz_admin.id
  zone_id        = var.cloudflare_zone_id
  name           = "Admin Access Policy"
  precedence     = 1
  decision       = "allow"

  include {
    email_domain = ["betfuz.com"]
  }

  require {
    ip = [
      "102.89.XXX.XXX/32",
      "197.210.XXX.XXX/32",
      "41.203.XXX.XXX/32"
    ]
  }

  require {
    auth_method = "mfa"
  }
}
```

---

## DDoS Protection Settings

### Layer 3/4 DDoS Protection
```yaml
# Automatically enabled for all Cloudflare zones
DDoS Sensitivity: High
Advanced TCP Protection: ON
SYN Flood Protection: ON
UDP Flood Protection: ON
```

### Layer 7 DDoS Protection
```yaml
# Custom HTTP DDoS rules
Rule 1: HTTP Flood Protection
  - Trigger: > 10,000 requests/second from single IP
  - Action: Rate Limit (1 request per 10 seconds for 1 hour)

Rule 2: Slowloris Protection
  - Trigger: Connection open > 30 seconds without data
  - Action: Block

Rule 3: HTTP POST Flood
  - Trigger: > 100 POST requests/minute to /api/bet-placement
  - Action: Challenge
```

---

## Rate Limiting Strategy

### Tiered Rate Limits

| Endpoint Category | Anonymous Users | Authenticated Users | Premium Users |
|-------------------|----------------|---------------------|---------------|
| `/api/matches` (GET) | 60/min | 120/min | 300/min |
| `/api/bet-placement` (POST) | N/A | 10/min | 20/min |
| `/auth/login` (POST) | 5/min | N/A | N/A |
| `/auth/signup` (POST) | 3/min | N/A | N/A |
| `/api/withdraw` (POST) | N/A | 5/hour | 10/hour |
| `/admin/*` (ALL) | N/A | 100/min | N/A |

### Implementation (Backend)

```typescript
// backend/apps/api-gateway/src/middleware/rate-limit.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id || req.ip;
    const endpoint = req.path;
    const key = `rate_limit:${endpoint}:${userId}`;

    const limit = this.getLimit(req);
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, 60); // 1 minute window
    }

    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current).toString());

    if (current > limit) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: await this.redis.ttl(key),
      });
    }

    next();
  }

  private getLimit(req: Request): number {
    const endpoint = req.path;
    const userTier = req.user?.tier || 'anonymous';

    const limits: Record<string, Record<string, number>> = {
      '/api/matches': { anonymous: 60, authenticated: 120, premium: 300 },
      '/api/bet-placement': { authenticated: 10, premium: 20 },
      '/auth/login': { anonymous: 5 },
      '/auth/signup': { anonymous: 3 },
      '/api/withdraw': { authenticated: 5, premium: 10 },
      '/admin': { authenticated: 100 },
    };

    // Find matching endpoint pattern
    const pattern = Object.keys(limits).find((p) => endpoint.startsWith(p));
    return pattern ? limits[pattern][userTier] || 60 : 60;
  }
}
```

---

## Monitoring & Alerts

### Cloudflare Analytics Dashboard
- Real-time traffic monitoring
- Threat analytics and blocking statistics
- Geographic distribution of requests
- Bot detection reports

### Alerts Configuration
```yaml
Alert 1: High Traffic Spike
  Condition: Requests > 100,000/minute
  Action: Send email to security@betfuz.com

Alert 2: High Block Rate
  Condition: Blocked requests > 10% of total
  Action: Send Slack notification to #security channel

Alert 3: Admin Portal Access
  Condition: Failed authentication attempts > 5 in 1 minute
  Action: Send SMS to security team
```

---

## Testing & Validation

### Rate Limit Testing
```bash
# Test general API rate limit (should block after 100 requests)
for i in {1..120}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://betfuz.com/api/matches
  sleep 0.5
done

# Test bet placement rate limit (should challenge after 10 requests)
for i in {1..15}; do
  curl -X POST https://betfuz.com/api/bet-placement \
    -H "Authorization: Bearer YOUR_JWT" \
    -H "Content-Type: application/json" \
    -d '{"matchId":"123","stake":100}'
  sleep 5
done
```

### Admin Access Testing
```bash
# Test admin portal without VPN (should be blocked)
curl -I https://admin.betfuz.com
# Expected: 403 Forbidden or Cloudflare Access challenge page

# Test admin portal with VPN (should require SSO)
curl -I https://admin.betfuz.com
# Expected: Redirect to Google Workspace SSO
```

---

## Production Deployment Checklist

- [ ] Configure Cloudflare DNS for betfuz.com and admin.betfuz.com
- [ ] Enable WAF and DDoS protection
- [ ] Create custom WAF rules for rate limiting
- [ ] Set up Cloudflare Access for admin.betfuz.com
- [ ] Configure Google Workspace SSO integration
- [ ] Add office IP addresses to allowlist
- [ ] Test rate limits with load testing tool
- [ ] Set up Cloudflare alerts and notifications
- [ ] Document incident response procedures
- [ ] Train operations team on Cloudflare dashboard

---

## Security Contacts

- **WAF/Cloudflare Admin**: ops@betfuz.com
- **Security Incidents**: security@betfuz.com
- **24/7 Hotline**: +234-XXX-XXX-XXXX
