# Betfuz Project Context for Cursor

You are working on **Betfuz**, a comprehensive Nigerian sports betting and casino platform built with React, TypeScript, Tailwind CSS, and Supabase (via Lovable Cloud).

## Project Overview

Betfuz is a full-stack betting platform featuring:
- **Sports Betting**: Football (EPL, AFCON, World Cup, African leagues), Basketball (NBA, WNBA), Tennis, Racing
- **Casino Games**: 12+ AI-powered games (Slots, Blackjack, Roulette, Poker, Baccarat, Craps, Keno, etc.)
- **Fantasy Sports**: Universal fantasy system across 10+ sports with Nigerian market focus
- **Traditional African Games**: Mancala, Morabaraba, African Draft
- **Virtual Racing**: 10 racing types with AI-generated visuals

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Lovable Cloud) - PostgreSQL, Edge Functions, Auth, Realtime
- **AI Integration**: Lovable AI Gateway (google/gemini-2.5-flash), OpenAI for voice betting
- **State Management**: TanStack Query, React Context
- **Routing**: React Router v6

## Backend Architecture

### Supabase Edge Functions
Located in `supabase/functions/`. All functions use Deno runtime and have access to secrets at runtime.

Key functions:
- `ai-betting-chat` - AI betting assistant
- `ai-predictions` - Match predictions
- `bet-recommendations` - Personalized bet suggestions
- `voice-betting-token` - OpenAI Realtime API for voice betting
- `ai-*` - Casino game AI functions (blackjack, roulette, poker, etc.)
- `f1-racing-ai` - Racing simulation and commentary
- `fantasy-*` - Fantasy sports optimization
- `ai-fraud-detection` - Security monitoring

### Environment Secrets (Pre-configured in Lovable Cloud)
These secrets are already configured and injected at runtime:
- `LOVABLE_API_KEY` - AI Gateway access (auto-provisioned)
- `OPENAI_API_KEY` - Voice betting
- `KIE_AI_API_KEY` - Premium video/image generation
- `SPORTRADAR_API_KEY`, `ODDS_API_KEY`, `API_SPORTS_API_KEY` - Sports data
- `SPORTMONKS_API_KEY`, `FOOTBALL_DATA_ORG_API_KEY` - Football data
- `NEWS_API_KEY`, `GNEWS_API_KEY`, `CURRENTS_API_KEY` - News feeds
- `N8N_BEARER_TOKEN` - Workflow automation
- `BACKUP_ENCRYPTION_KEY` - Security

### Supabase Connection
```
URL: https://aacjfdrctnmnenebzdxg.supabase.co
Project ID: aacjfdrctnmnenebzdxg
```

## Key Directories

```
src/
├── components/     # UI components (shadcn/ui based)
├── hooks/          # Custom React hooks
├── pages/          # Route pages
├── integrations/   # Supabase client (auto-generated, DO NOT EDIT)
├── lib/            # Utilities
└── assets/         # Static assets

supabase/
├── functions/      # Edge Functions (Deno)
├── config.toml     # Function configuration
└── migrations/     # Database migrations (read-only)
```

## Important Patterns

### Edge Function Pattern
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  // ... function logic
});
```

### Lovable AI Gateway Usage
```typescript
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [{ role: "user", content: prompt }],
  }),
});
```

### Calling Edge Functions from Frontend
```typescript
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.functions.invoke('function-name', {
  body: { key: value }
});
```

## Design System

- Use Tailwind semantic tokens from `index.css` and `tailwind.config.ts`
- All colors must be HSL format
- Dark theme primary, light theme available
- Currency: Nigerian Naira (₦)

## Compliance Requirements

- NLRC license verification for Nigerian betting
- KYC/NIN verification for withdrawals > ₦50,000
- Responsible gaming limits enforcement
- AML risk engine for suspicious patterns
- Immutable audit trail for all financial transactions

## Development Notes

1. **DO NOT EDIT** `src/integrations/supabase/types.ts` or `client.ts` - auto-generated
2. Edge functions auto-deploy when pushed via Lovable
3. Database migrations are managed through Lovable Cloud
4. All secrets are pre-configured - use `Deno.env.get()` in edge functions
5. For local development, see `.env.template`

## Current Focus Areas

- Universal simulation engines for all games
- Premium AI-generated racing visuals
- Fantasy sports with complete player data
- n8n workflow automation integration
- Nx monorepo backend (api-gateway, ussd-microservice, affiliate-engine)
