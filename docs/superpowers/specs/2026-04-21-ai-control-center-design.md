# AI Control Center — Design Spec
**Date:** 2026-04-21  
**Status:** Approved for implementation

---

## Overview

A single admin page (`/admin/ai-control`) that lets the operator configure how much autonomy the AI has per platform module — from full human control to full AI autopilot — with a complete audit trail and one-click human override on every AI decision.

---

## Architecture

### Three layers

**1. Frontend — `AIControl.tsx`**  
One card per module. Each card: autonomy dial (0–100), today's action stats, confidence average, recent AI decisions feed, override buttons.

**2. Config persistence — `system_config` table**  
Autonomy levels stored as `ai.autonomy.<module>` keys (e.g. `ai.autonomy.withdrawals = 40`). Uses existing `PATCH /admin/system-config` endpoint. Cached in Redis.

**3. AI Autopilot service — `aiAutopilot.ts` cron (every 2 min)**  
Reads autonomy levels → fetches pending items per module → scores via Claude → auto-acts on items above confidence threshold → writes every action to `audit_logs` with `adminId = 'AI_AUTOPILOT'`.

### Override flow
Frontend calls existing approve/reject endpoints with `{ overrideAI: true }` flag. A second audit log entry is written marking the reversal as human-initiated.

### Hard invariants (non-configurable)
- Permanent account closures always require human approval
- Withdrawals above ₦1,000,000 always require human approval

---

## Modules

| Module | Config key | What AI does at 100% |
|--------|-----------|----------------------|
| Withdrawals | `ai.autonomy.withdrawals` | Auto-approve <₦500k, auto-reject fraud score >85 |
| KYC | `ai.autonomy.kyc` | Auto-approve Tier 1 docs, flag Tier 2+ |
| Fraud | `ai.autonomy.fraud` | Auto-block score >60, auto-notify user |
| Odds | `ai.autonomy.odds` | Full auto-sync + suspend outliers + resume |
| Bonuses | `ai.autonomy.bonuses` | Grant based on VIP tier + activity rules |
| Responsible Gaming | `ai.autonomy.rg` | Auto-apply cooling-off, escalate permanent exclusions |
| Bet Settlement | `ai.autonomy.settlement` | Auto-settle wins/losses, flag cashout edge cases |

### Dial threshold logic
- **0–30%** → AI analysis + recommendation only, no autonomous action
- **31–70%** → AI acts on confidence > 80%, flags the rest
- **71–100%** → AI acts on confidence > 60%, logs everything

---

## UI Layout

**Page header:** Operating mode badge (Full AI / Hybrid / Human-led) derived from average dial position. Sync button. Last-run timestamp.

**Module cards grid (2 cols on desktop):**  
Each card: module name + icon, autonomy slider, today's stats row (acted / flagged / overridden), AI confidence average, scrollable recent-decisions list (last 5), override button per decision.

**AI Action Log panel (bottom):**  
Full paginated feed of all AI actions across all modules. Filterable by module, action type, date. Each row: timestamp, module, action taken, confidence score, status (executed / overridden).

---

## Backend additions

- `POST /admin/ai-control/config` — save autonomy settings (wraps system-config)
- `GET /admin/ai-control/decisions` — paginated AI action log from audit_logs where adminId = 'AI_AUTOPILOT'
- `POST /admin/ai-control/run` — manually trigger autopilot cycle
- `POST /admin/ai-control/override/:auditLogId` — reverse an AI decision

**New service:** `backend/src/services/aiAutopilot.ts`  
**New cron:** `backend/src/cron/autopilotJob.ts` (every 2 min)

---

## What is NOT in scope
- Fantasy pages (separate feature)
- Jackpot / Status stub pages (minor, separate)
- NBA basketball page
- Rule-based policy engine (future evolution of dials)
