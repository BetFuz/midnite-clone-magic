# Betfuz n8n + Lovable Complete Workflow Templates

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              n8n CLOUD                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Odds Sync   │  │ Settlement  │  │ Payments    │  │ Compliance  │         │
│  │ Workflows   │  │ Workflows   │  │ Workflows   │  │ Workflows   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                │                 │
│         └────────────────┴────────────────┴────────────────┘                 │
│                                    │                                         │
│                          HTTP Request Node                                   │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOVABLE CLOUD (Supabase)                             │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Edge Functions Layer                              │    │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │    │
│  │  │n8n-webhook-      │  │update-matches    │  │update-leagues    │   │    │
│  │  │receiver          │  │                  │  │                  │   │    │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘   │    │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │    │
│  │  │settle-bet        │  │instant-payout    │  │kyc-verification  │   │    │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Supabase Database                            │    │
│  │  matches │ bet_slips │ profiles │ ledger_entries │ kyc_verifications │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Realtime Channels                               │    │
│  │     odds:updates  │  bets:settlements  │  user:{id}  │  system:alerts │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Configuration

### Supabase Credentials (Store in n8n Credentials)

| Credential Name | Value |
|-----------------|-------|
| `supabase_url` | `https://aacjfdrctnmnenebzdxg.supabase.co` |
| `supabase_service_key` | Your `SUPABASE_SERVICE_ROLE_KEY` |
| `n8n_bearer_token` | Your `N8N_BEARER_TOKEN` secret |

### Edge Function URLs

| Function | URL |
|----------|-----|
| n8n-webhook-receiver | `https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/n8n-webhook-receiver` |
| update-matches | `https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/update-matches` |
| update-leagues | `https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/update-leagues` |
| marketing-post | `https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/marketing-post` |

---

## WORKFLOW 1: Odds Sync (Every 30 seconds)

**Trigger:** Schedule (Cron)
**Purpose:** Fetch live odds and push to Betfuz

```json
{
  "name": "Betfuz - Odds Sync Primary",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{ "field": "seconds", "secondsInterval": 30 }]
        }
      },
      "name": "Every 30 Seconds",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [240, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://api.the-odds-api.com/v4/sports/soccer_epl/odds",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpQueryAuth",
        "options": {
          "queryParameters": {
            "parameters": [
              { "name": "apiKey", "value": "={{$credentials.oddsApiKey}}" },
              { "name": "regions", "value": "eu" },
              { "name": "markets", "value": "h2h,spreads,totals" },
              { "name": "oddsFormat", "value": "decimal" }
            ]
          }
        }
      },
      "name": "Fetch Odds API",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 300]
    },
    {
      "parameters": {
        "jsCode": "// Transform Odds API response to Betfuz format\nconst matches = $input.all().map(item => {\n  const data = item.json;\n  return data.map(match => ({\n    match_id: match.id,\n    sport: 'soccer',\n    league: 'EPL',\n    home_team: match.home_team,\n    away_team: match.away_team,\n    commence_time: match.commence_time,\n    odds: {\n      home: match.bookmakers[0]?.markets[0]?.outcomes.find(o => o.name === match.home_team)?.price || 0,\n      draw: match.bookmakers[0]?.markets[0]?.outcomes.find(o => o.name === 'Draw')?.price || 0,\n      away: match.bookmakers[0]?.markets[0]?.outcomes.find(o => o.name === match.away_team)?.price || 0\n    },\n    bookmaker: match.bookmakers[0]?.key || 'unknown',\n    last_updated: new Date().toISOString()\n  }));\n}).flat();\n\nreturn matches.map(m => ({ json: m }));"
      },
      "name": "Transform Data",
      "type": "n8n-nodes-base.code",
      "position": [680, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/update-matches",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ matches: $input.all().map(i => i.json) }) }}",
        "options": {
          "headers": {
            "parameters": [
              { "name": "Authorization", "value": "Bearer {{$credentials.n8nBearerToken}}" },
              { "name": "Content-Type", "value": "application/json" }
            ]
          }
        }
      },
      "name": "Push to Betfuz",
      "type": "n8n-nodes-base.httpRequest",
      "position": [900, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/n8n-webhook-receiver",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "event_type", "value": "odds_update" },
            { "name": "data", "value": "={{ $json }}" },
            { "name": "source_workflow", "value": "odds-sync-primary" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" },
              { "name": "x-n8n-source", "value": "odds-sync-primary" }
            ]
          }
        }
      },
      "name": "Broadcast Realtime",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1120, 300]
    }
  ],
  "connections": {
    "Every 30 Seconds": { "main": [[{ "node": "Fetch Odds API", "type": "main", "index": 0 }]] },
    "Fetch Odds API": { "main": [[{ "node": "Transform Data", "type": "main", "index": 0 }]] },
    "Transform Data": { "main": [[{ "node": "Push to Betfuz", "type": "main", "index": 0 }]] },
    "Push to Betfuz": { "main": [[{ "node": "Broadcast Realtime", "type": "main", "index": 0 }]] }
  }
}
```

---

## WORKFLOW 2: Bet Settlement (On Match End)

**Trigger:** Webhook (from Sportradar/live score provider)
**Purpose:** Settle all bets when match ends

```json
{
  "name": "Betfuz - Bet Settlement",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "match-ended",
        "options": {}
      },
      "name": "Match Ended Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/bet_slips",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          },
          "queryParameters": {
            "parameters": [
              { "name": "select", "value": "*,bet_selections(*)" },
              { "name": "status", "value": "eq.pending" }
            ]
          }
        }
      },
      "name": "Get Pending Bets",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 300]
    },
    {
      "parameters": {
        "jsCode": "const matchResult = $('Match Ended Webhook').first().json;\nconst bets = $input.all();\n\nconst settledBets = bets.map(bet => {\n  const slip = bet.json;\n  const selections = slip.bet_selections || [];\n  \n  // Check if any selection matches this match\n  const relevantSelections = selections.filter(s => s.match_id === matchResult.match_id);\n  \n  if (relevantSelections.length === 0) return null;\n  \n  // Determine win/loss\n  const allWon = relevantSelections.every(sel => {\n    if (sel.selection_type === '1x2') {\n      if (matchResult.home_score > matchResult.away_score && sel.selection_value === 'home') return true;\n      if (matchResult.home_score < matchResult.away_score && sel.selection_value === 'away') return true;\n      if (matchResult.home_score === matchResult.away_score && sel.selection_value === 'draw') return true;\n    }\n    return false;\n  });\n  \n  return {\n    bet_slip_id: slip.id,\n    user_id: slip.user_id,\n    status: allWon ? 'won' : 'lost',\n    payout: allWon ? slip.potential_win : 0,\n    settled_at: new Date().toISOString()\n  };\n}).filter(Boolean);\n\nreturn settledBets.map(b => ({ json: b }));"
      },
      "name": "Calculate Settlement",
      "type": "n8n-nodes-base.code",
      "position": [680, 300]
    },
    {
      "parameters": {
        "method": "PATCH",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/bet_slips",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "status", "value": "={{ $json.status }}" },
            { "name": "settled_at", "value": "={{ $json.settled_at }}" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" },
              { "name": "Prefer", "value": "return=representation" }
            ]
          },
          "queryParameters": {
            "parameters": [
              { "name": "id", "value": "eq.{{ $json.bet_slip_id }}" }
            ]
          }
        }
      },
      "name": "Update Bet Status",
      "type": "n8n-nodes-base.httpRequest",
      "position": [900, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [{ "value1": "={{ $json.status }}", "value2": "won" }]
        }
      },
      "name": "If Won",
      "type": "n8n-nodes-base.if",
      "position": [1120, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/rpc/credit_user_balance",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "p_user_id", "value": "={{ $json.user_id }}" },
            { "name": "p_amount", "value": "={{ $json.payout }}" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          }
        }
      },
      "name": "Credit Winnings",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1340, 200]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/n8n-webhook-receiver",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "event_type", "value": "bet_settlement" },
            { "name": "data", "value": "={{ $json }}" },
            { "name": "target_user_id", "value": "={{ $json.user_id }}" },
            { "name": "source_workflow", "value": "bet-settlement" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          }
        }
      },
      "name": "Notify User",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1560, 300]
    }
  ],
  "connections": {
    "Match Ended Webhook": { "main": [[{ "node": "Get Pending Bets", "type": "main", "index": 0 }]] },
    "Get Pending Bets": { "main": [[{ "node": "Calculate Settlement", "type": "main", "index": 0 }]] },
    "Calculate Settlement": { "main": [[{ "node": "Update Bet Status", "type": "main", "index": 0 }]] },
    "Update Bet Status": { "main": [[{ "node": "If Won", "type": "main", "index": 0 }]] },
    "If Won": {
      "main": [
        [{ "node": "Credit Winnings", "type": "main", "index": 0 }],
        [{ "node": "Notify User", "type": "main", "index": 0 }]
      ]
    },
    "Credit Winnings": { "main": [[{ "node": "Notify User", "type": "main", "index": 0 }]] }
  }
}
```

---

## WORKFLOW 3: KYC Verification (On Submit)

**Trigger:** Webhook (from Betfuz frontend)
**Purpose:** Verify user identity via YouVerify

```json
{
  "name": "Betfuz - KYC Verification",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "kyc-submit",
        "options": {}
      },
      "name": "KYC Submit Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.youverify.co/v2/api/identity/ng/nin",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "id", "value": "={{ $json.nin }}" },
            { "name": "isSubjectConsent", "value": "true" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "token", "value": "{{$credentials.youVerifyApiKey}}" }
            ]
          }
        }
      },
      "name": "Verify NIN",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.youverify.co/v2/api/identity/ng/liveness",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "image", "value": "={{ $('KYC Submit Webhook').first().json.selfie_url }}" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "token", "value": "{{$credentials.youVerifyApiKey}}" }
            ]
          }
        }
      },
      "name": "Liveness Check",
      "type": "n8n-nodes-base.httpRequest",
      "position": [680, 300]
    },
    {
      "parameters": {
        "jsCode": "const ninResult = $('Verify NIN').first().json;\nconst livenessResult = $('Liveness Check').first().json;\nconst userId = $('KYC Submit Webhook').first().json.user_id;\n\nconst isVerified = ninResult.success && livenessResult.data?.liveness_score > 0.85;\n\nreturn [{\n  json: {\n    user_id: userId,\n    nin_verified: ninResult.success,\n    liveness_score: livenessResult.data?.liveness_score || 0,\n    status: isVerified ? 'verified' : 'failed',\n    verified_at: isVerified ? new Date().toISOString() : null,\n    nin_data: ninResult.data || {},\n    rejection_reason: !isVerified ? 'Liveness check failed or NIN mismatch' : null\n  }\n}];"
      },
      "name": "Process Result",
      "type": "n8n-nodes-base.code",
      "position": [900, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/kyc_verifications",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify($json) }}",
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" },
              { "name": "Prefer", "value": "return=representation" }
            ]
          }
        }
      },
      "name": "Store Result",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1120, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/n8n-webhook-receiver",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "event_type", "value": "user_notification" },
            { "name": "data", "value": "={{ { title: 'KYC ' + ($json.status === 'verified' ? 'Approved' : 'Rejected'), message: $json.status === 'verified' ? 'Your identity has been verified!' : $json.rejection_reason, type: 'kyc' } }}" },
            { "name": "target_user_id", "value": "={{ $json.user_id }}" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          }
        }
      },
      "name": "Notify User",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1340, 300]
    }
  ],
  "connections": {
    "KYC Submit Webhook": { "main": [[{ "node": "Verify NIN", "type": "main", "index": 0 }]] },
    "Verify NIN": { "main": [[{ "node": "Liveness Check", "type": "main", "index": 0 }]] },
    "Liveness Check": { "main": [[{ "node": "Process Result", "type": "main", "index": 0 }]] },
    "Process Result": { "main": [[{ "node": "Store Result", "type": "main", "index": 0 }]] },
    "Store Result": { "main": [[{ "node": "Notify User", "type": "main", "index": 0 }]] }
  }
}
```

---

## WORKFLOW 4: Withdrawal Processing (60s SLA)

**Trigger:** Webhook (from Betfuz withdrawal request)
**Purpose:** Process withdrawals within 60-second SLA

```json
{
  "name": "Betfuz - Withdrawal 60s SLA",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "withdrawal-request",
        "options": {}
      },
      "name": "Withdrawal Request",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "jsCode": "// Record start time for SLA tracking\nconst startTime = Date.now();\nconst request = $json;\n\nreturn [{\n  json: {\n    ...request,\n    sla_start: startTime,\n    sla_deadline: startTime + 60000 // 60 seconds\n  }\n}];"
      },
      "name": "Start SLA Timer",
      "type": "n8n-nodes-base.code",
      "position": [460, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/profiles",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          },
          "queryParameters": {
            "parameters": [
              { "name": "id", "value": "eq.{{ $json.user_id }}" },
              { "name": "select", "value": "balance,kyc_verified" }
            ]
          }
        }
      },
      "name": "Check Balance & KYC",
      "type": "n8n-nodes-base.httpRequest",
      "position": [680, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            { "value1": "={{ $json[0].balance >= $('Withdrawal Request').first().json.amount }}", "value2": true },
            { "value1": "={{ $json[0].kyc_verified || $('Withdrawal Request').first().json.amount < 50000 }}", "value2": true }
          ]
        }
      },
      "name": "Validate Request",
      "type": "n8n-nodes-base.if",
      "position": [900, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.flutterwave.com/v3/transfers",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "account_bank", "value": "={{ $('Withdrawal Request').first().json.bank_code }}" },
            { "name": "account_number", "value": "={{ $('Withdrawal Request').first().json.account_number }}" },
            { "name": "amount", "value": "={{ $('Withdrawal Request').first().json.amount }}" },
            { "name": "currency", "value": "NGN" },
            { "name": "reference", "value": "={{ 'WD-' + Date.now() }}" },
            { "name": "narration", "value": "Betfuz Withdrawal" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "Authorization", "value": "Bearer {{$credentials.flutterwaveSecretKey}}" }
            ]
          }
        }
      },
      "name": "Process Flutterwave",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1120, 200]
    },
    {
      "parameters": {
        "jsCode": "const slaStart = $('Start SLA Timer').first().json.sla_start;\nconst now = Date.now();\nconst processingTime = now - slaStart;\nconst slaBreach = processingTime > 60000;\n\nconst result = $json;\n\nreturn [{\n  json: {\n    user_id: $('Withdrawal Request').first().json.user_id,\n    amount: $('Withdrawal Request').first().json.amount,\n    status: result.status === 'success' ? 'completed' : 'failed',\n    reference: result.data?.reference,\n    processing_time_ms: processingTime,\n    sla_breach: slaBreach,\n    compensation: slaBreach ? 1000 : 0 // ₦1000 if SLA breached\n  }\n}];"
      },
      "name": "Check SLA & Compensation",
      "type": "n8n-nodes-base.code",
      "position": [1340, 200]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [{ "value1": "={{ $json.sla_breach }}", "value2": true }]
        }
      },
      "name": "SLA Breached?",
      "type": "n8n-nodes-base.if",
      "position": [1560, 200]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/rpc/credit_user_balance",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "p_user_id", "value": "={{ $json.user_id }}" },
            { "name": "p_amount", "value": "1000" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          }
        }
      },
      "name": "Credit Compensation",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1780, 100]
    },
    {
      "parameters": {
        "channel": "#withdrawals-alerts",
        "text": "⚠️ SLA BREACH: Withdrawal for user {{ $json.user_id }} took {{ Math.round($json.processing_time_ms/1000) }}s. ₦1000 compensation credited.",
        "otherOptions": {}
      },
      "name": "Slack Alert",
      "type": "n8n-nodes-base.slack",
      "position": [1780, 200]
    }
  ],
  "connections": {
    "Withdrawal Request": { "main": [[{ "node": "Start SLA Timer", "type": "main", "index": 0 }]] },
    "Start SLA Timer": { "main": [[{ "node": "Check Balance & KYC", "type": "main", "index": 0 }]] },
    "Check Balance & KYC": { "main": [[{ "node": "Validate Request", "type": "main", "index": 0 }]] },
    "Validate Request": { "main": [[{ "node": "Process Flutterwave", "type": "main", "index": 0 }], []] },
    "Process Flutterwave": { "main": [[{ "node": "Check SLA & Compensation", "type": "main", "index": 0 }]] },
    "Check SLA & Compensation": { "main": [[{ "node": "SLA Breached?", "type": "main", "index": 0 }]] },
    "SLA Breached?": {
      "main": [
        [{ "node": "Credit Compensation", "type": "main", "index": 0 }, { "node": "Slack Alert", "type": "main", "index": 0 }],
        []
      ]
    }
  }
}
```

---

## WORKFLOW 5: NLRC License Check (Hourly)

**Trigger:** Schedule (Cron hourly)
**Purpose:** Verify betting license is active, block bets if expired

```json
{
  "name": "Betfuz - NLRC License Check",
  "nodes": [
    {
      "parameters": {
        "rule": { "interval": [{ "field": "hours", "hoursInterval": 1 }] }
      },
      "name": "Every Hour",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [240, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://api.nlrc.gov.ng/v1/license/verify",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {
          "queryParameters": {
            "parameters": [
              { "name": "license_number", "value": "{{$credentials.nlrcLicenseNumber}}" }
            ]
          },
          "headers": {
            "parameters": [
              { "name": "Authorization", "value": "Bearer {{$credentials.nlrcApiKey}}" }
            ]
          }
        }
      },
      "name": "Check NLRC API",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/platform_settings",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "key", "value": "nlrc_license_status" },
            { "name": "value", "value": "={{ $json.status }}" },
            { "name": "updated_at", "value": "={{ new Date().toISOString() }}" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" },
              { "name": "Prefer", "value": "resolution=merge-duplicates" }
            ]
          }
        }
      },
      "name": "Update License Status",
      "type": "n8n-nodes-base.httpRequest",
      "position": [680, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [{ "value1": "={{ $json.status }}", "operation": "notEqual", "value2": "ACTIVE" }]
        }
      },
      "name": "License Invalid?",
      "type": "n8n-nodes-base.if",
      "position": [900, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/n8n-webhook-receiver",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "event_type", "value": "system_alert" },
            { "name": "data", "value": "={{ { type: 'license_expired', message: 'NLRC license expired - all betting suspended', severity: 'critical' } }}" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          }
        }
      },
      "name": "Broadcast System Alert",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1120, 200]
    },
    {
      "parameters": {
        "channel": "#critical-alerts",
        "text": "🚨 CRITICAL: NLRC License EXPIRED! All betting operations suspended immediately. Contact compliance team.",
        "otherOptions": {}
      },
      "name": "Slack Critical Alert",
      "type": "n8n-nodes-base.slack",
      "position": [1120, 400]
    }
  ],
  "connections": {
    "Every Hour": { "main": [[{ "node": "Check NLRC API", "type": "main", "index": 0 }]] },
    "Check NLRC API": { "main": [[{ "node": "Update License Status", "type": "main", "index": 0 }]] },
    "Update License Status": { "main": [[{ "node": "License Invalid?", "type": "main", "index": 0 }]] },
    "License Invalid?": {
      "main": [
        [{ "node": "Broadcast System Alert", "type": "main", "index": 0 }, { "node": "Slack Critical Alert", "type": "main", "index": 0 }],
        []
      ]
    }
  }
}
```

---

## WORKFLOW 6: Affiliate Commission (On Referred Bet)

**Trigger:** Webhook (from bet placement with affiliate code)
**Purpose:** Calculate and credit affiliate commission

```json
{
  "name": "Betfuz - Affiliate Commission",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "referred-bet",
        "options": {}
      },
      "name": "Referred Bet Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/affiliate_links",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          },
          "queryParameters": {
            "parameters": [
              { "name": "code", "value": "eq.{{ $json.affiliate_code }}" },
              { "name": "select", "value": "*" }
            ]
          }
        }
      },
      "name": "Get Affiliate",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/affiliate_boost_periods",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          },
          "queryParameters": {
            "parameters": [
              { "name": "is_active", "value": "eq.true" },
              { "name": "start_time", "value": "lte.{{ new Date().toISOString() }}" },
              { "name": "end_time", "value": "gte.{{ new Date().toISOString() }}" }
            ]
          }
        }
      },
      "name": "Check Boost Period",
      "type": "n8n-nodes-base.httpRequest",
      "position": [680, 300]
    },
    {
      "parameters": {
        "jsCode": "const affiliate = $('Get Affiliate').first().json[0];\nconst bet = $('Referred Bet Webhook').first().json;\nconst boostPeriod = $('Check Boost Period').first().json[0];\n\nif (!affiliate) return [];\n\n// Tier commission rates\nconst tierRates = {\n  'bronze': 0.20,\n  'silver': 0.25,\n  'gold': 0.30\n};\n\nlet commissionRate = tierRates[affiliate.tier] || 0.20;\n\n// Apply boost multiplier if active\nif (boostPeriod) {\n  commissionRate *= boostPeriod.commission_multiplier;\n}\n\nconst commission = bet.stake * commissionRate;\n\nreturn [{\n  json: {\n    affiliate_id: affiliate.user_id,\n    bet_slip_id: bet.bet_slip_id,\n    commission_amount: commission,\n    tier: affiliate.tier,\n    boost_applied: !!boostPeriod,\n    boost_multiplier: boostPeriod?.commission_multiplier || 1\n  }\n}];"
      },
      "name": "Calculate Commission",
      "type": "n8n-nodes-base.code",
      "position": [900, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/rpc/credit_user_balance",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "p_user_id", "value": "={{ $json.affiliate_id }}" },
            { "name": "p_amount", "value": "={{ $json.commission_amount }}" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          }
        }
      },
      "name": "Credit Commission",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1120, 300]
    },
    {
      "parameters": {
        "method": "PATCH",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/affiliate_links",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "commission", "value": "={{ $('Get Affiliate').first().json[0].commission + $json.commission_amount }}" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          },
          "queryParameters": {
            "parameters": [
              { "name": "user_id", "value": "eq.{{ $json.affiliate_id }}" }
            ]
          }
        }
      },
      "name": "Update Total Commission",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1340, 300]
    }
  ],
  "connections": {
    "Referred Bet Webhook": { "main": [[{ "node": "Get Affiliate", "type": "main", "index": 0 }]] },
    "Get Affiliate": { "main": [[{ "node": "Check Boost Period", "type": "main", "index": 0 }]] },
    "Check Boost Period": { "main": [[{ "node": "Calculate Commission", "type": "main", "index": 0 }]] },
    "Calculate Commission": { "main": [[{ "node": "Credit Commission", "type": "main", "index": 0 }]] },
    "Credit Commission": { "main": [[{ "node": "Update Total Commission", "type": "main", "index": 0 }]] }
  }
}
```

---

## WORKFLOW 7: AML Risk Scoring (On Large Deposit)

**Trigger:** Webhook (deposit > ₦500,000)
**Purpose:** Calculate AML risk score and flag suspicious activity

```json
{
  "name": "Betfuz - AML Risk Scoring",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "large-deposit",
        "options": {}
      },
      "name": "Large Deposit Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/ledger_entries",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          },
          "queryParameters": {
            "parameters": [
              { "name": "user_id", "value": "eq.{{ $json.user_id }}" },
              { "name": "transaction_type", "value": "eq.deposit" },
              { "name": "created_at", "value": "gte.{{ new Date(Date.now() - 24*60*60*1000).toISOString() }}" },
              { "name": "order", "value": "created_at.desc" }
            ]
          }
        }
      },
      "name": "Get 24h Deposits",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 300]
    },
    {
      "parameters": {
        "jsCode": "const deposits = $json;\nconst currentDeposit = $('Large Deposit Webhook').first().json;\n\nlet riskScore = 0;\nlet riskFactors = [];\n\n// Calculate total 24h deposits\nconst total24h = deposits.reduce((sum, d) => sum + d.amount, 0) + currentDeposit.amount;\n\n// Risk factors\nif (total24h > 15000000) { // ₦15M threshold\n  riskScore += 50;\n  riskFactors.push('SAR_THRESHOLD_EXCEEDED');\n}\n\n// Structuring detection (multiple deposits just under reporting threshold)\nconst structuringCount = deposits.filter(d => d.amount >= 9000000 && d.amount <= 10000000).length;\nif (structuringCount >= 3) {\n  riskScore += 40;\n  riskFactors.push('POSSIBLE_STRUCTURING');\n}\n\n// Rapid deposits (more than 5 in 1 hour)\nconst oneHourAgo = Date.now() - 60*60*1000;\nconst rapidDeposits = deposits.filter(d => new Date(d.created_at).getTime() > oneHourAgo).length;\nif (rapidDeposits >= 5) {\n  riskScore += 30;\n  riskFactors.push('RAPID_DEPOSITS');\n}\n\n// Round amounts (potential money laundering indicator)\nconst roundAmounts = deposits.filter(d => d.amount % 1000000 === 0).length;\nif (roundAmounts >= 3) {\n  riskScore += 20;\n  riskFactors.push('ROUND_AMOUNTS');\n}\n\nconst severity = riskScore >= 70 ? 'critical' : riskScore >= 40 ? 'high' : riskScore >= 20 ? 'medium' : 'low';\n\nreturn [{\n  json: {\n    user_id: currentDeposit.user_id,\n    risk_score: riskScore,\n    risk_factors: riskFactors,\n    severity: severity,\n    total_24h: total24h,\n    requires_sar: total24h > 15000000,\n    alert_type: 'aml_risk'\n  }\n}];"
      },
      "name": "Calculate Risk Score",
      "type": "n8n-nodes-base.code",
      "position": [680, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [{ "value1": "={{ $json.risk_score }}", "operation": "largerEqual", "value2": 40 }]
        }
      },
      "name": "High Risk?",
      "type": "n8n-nodes-base.if",
      "position": [900, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/aml_alerts",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify($json) }}",
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          }
        }
      },
      "name": "Create AML Alert",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1120, 200]
    },
    {
      "parameters": {
        "chatId": "={{$credentials.telegramComplianceChannel}}",
        "text": "🚨 AML ALERT\n\nUser: {{ $json.user_id }}\nRisk Score: {{ $json.risk_score }}/100\nSeverity: {{ $json.severity.toUpperCase() }}\nFactors: {{ $json.risk_factors.join(', ') }}\n24h Total: ₦{{ $json.total_24h.toLocaleString() }}\n\n{{ $json.requires_sar ? '⚠️ SAR FILING REQUIRED' : '' }}",
        "additionalFields": {}
      },
      "name": "Telegram Alert",
      "type": "n8n-nodes-base.telegram",
      "position": [1340, 200]
    }
  ],
  "connections": {
    "Large Deposit Webhook": { "main": [[{ "node": "Get 24h Deposits", "type": "main", "index": 0 }]] },
    "Get 24h Deposits": { "main": [[{ "node": "Calculate Risk Score", "type": "main", "index": 0 }]] },
    "Calculate Risk Score": { "main": [[{ "node": "High Risk?", "type": "main", "index": 0 }]] },
    "High Risk?": { "main": [[{ "node": "Create AML Alert", "type": "main", "index": 0 }], []] },
    "Create AML Alert": { "main": [[{ "node": "Telegram Alert", "type": "main", "index": 0 }]] }
  }
}
```

---

## WORKFLOW 8: Daily Affiliate Salary (Gold Tier)

**Trigger:** Schedule (08:00 WAT daily)
**Purpose:** Pay ₦5,000 salary to Gold tier affiliates with 200+ referrals

```json
{
  "name": "Betfuz - Daily Affiliate Salary",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "expression": "0 7 * * *" }]
        }
      },
      "name": "Daily 08:00 WAT",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [240, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/affiliate_links",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          },
          "queryParameters": {
            "parameters": [
              { "name": "tier", "value": "eq.gold" },
              { "name": "active_referrals", "value": "gte.200" },
              { "name": "is_active", "value": "eq.true" }
            ]
          }
        }
      },
      "name": "Get Eligible Affiliates",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 300]
    },
    {
      "parameters": {
        "batchSize": 10,
        "options": {}
      },
      "name": "Split Into Batches",
      "type": "n8n-nodes-base.splitInBatches",
      "position": [680, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/rpc/credit_user_balance",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "p_user_id", "value": "={{ $json.user_id }}" },
            { "name": "p_amount", "value": "5000" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          }
        }
      },
      "name": "Credit ₦5000",
      "type": "n8n-nodes-base.httpRequest",
      "position": [900, 300]
    },
    {
      "parameters": {
        "method": "PATCH",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/rest/v1/affiliate_links",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "last_salary_paid_at", "value": "={{ new Date().toISOString() }}" },
            { "name": "daily_salary", "value": "={{ $json.daily_salary + 5000 }}" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "apikey", "value": "{{$credentials.supabaseAnonKey}}" },
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          },
          "queryParameters": {
            "parameters": [
              { "name": "user_id", "value": "eq.{{ $json.user_id }}" }
            ]
          }
        }
      },
      "name": "Update Salary Record",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1120, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://aacjfdrctnmnenebzdxg.supabase.co/functions/v1/n8n-webhook-receiver",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "event_type", "value": "user_notification" },
            { "name": "data", "value": "={{ { title: '💰 Daily Salary Credited!', message: 'Your Gold tier daily salary of ₦5,000 has been credited.', type: 'affiliate' } }}" },
            { "name": "target_user_id", "value": "={{ $json.user_id }}" }
          ]
        },
        "options": {
          "headers": {
            "parameters": [
              { "name": "Authorization", "value": "Bearer {{$credentials.supabaseServiceKey}}" }
            ]
          }
        }
      },
      "name": "Notify Affiliate",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1340, 300]
    }
  ],
  "connections": {
    "Daily 08:00 WAT": { "main": [[{ "node": "Get Eligible Affiliates", "type": "main", "index": 0 }]] },
    "Get Eligible Affiliates": { "main": [[{ "node": "Split Into Batches", "type": "main", "index": 0 }]] },
    "Split Into Batches": { "main": [[{ "node": "Credit ₦5000", "type": "main", "index": 0 }]] },
    "Credit ₦5000": { "main": [[{ "node": "Update Salary Record", "type": "main", "index": 0 }]] },
    "Update Salary Record": { "main": [[{ "node": "Notify Affiliate", "type": "main", "index": 0 }], [{ "node": "Split Into Batches", "type": "main", "index": 0 }]] }
  }
}
```

---

## Lovable → n8n Outbound Webhooks

These webhooks are called FROM Betfuz Edge Functions TO n8n:

### Edge Function: Trigger n8n Workflow

```typescript
// In any Edge Function, trigger an n8n workflow:
const triggerN8nWorkflow = async (webhookPath: string, data: any) => {
  const n8nBaseUrl = Deno.env.get('N8N_WEBHOOK_URL') || 'https://pannaafric.app.n8n.cloud/webhook';
  
  await fetch(`${n8nBaseUrl}/${webhookPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

// Examples:
await triggerN8nWorkflow('kyc-submit', { user_id, nin, selfie_url });
await triggerN8nWorkflow('withdrawal-request', { user_id, amount, bank_code, account_number });
await triggerN8nWorkflow('referred-bet', { bet_slip_id, affiliate_code, stake });
await triggerN8nWorkflow('large-deposit', { user_id, amount, transaction_ref });
await triggerN8nWorkflow('match-ended', { match_id, home_score, away_score });
```

---

## Required n8n Credentials

| Credential Name | Type | Used In |
|-----------------|------|---------|
| `supabaseServiceKey` | HTTP Header Auth | All workflows |
| `supabaseAnonKey` | HTTP Header Auth | All workflows |
| `n8nBearerToken` | HTTP Header Auth | Inbound to Edge Functions |
| `oddsApiKey` | HTTP Query Auth | Odds Sync |
| `youVerifyApiKey` | HTTP Header Auth | KYC Verification |
| `flutterwaveSecretKey` | HTTP Header Auth | Payments |
| `nlrcApiKey` | HTTP Header Auth | License Check |
| `telegramBotToken` | Telegram | Alerts |
| `slackWebhook` | Slack | Alerts |

---

## n8n MCP Integration (Optional)

If using n8n MCP connector in Lovable, these workflows become available as tools:

1. Go to **Project Settings → Connectors → n8n**
2. Enter your n8n MCP URL
3. Enable "Available in MCP" for each workflow
4. Lovable agent can then execute workflows directly

