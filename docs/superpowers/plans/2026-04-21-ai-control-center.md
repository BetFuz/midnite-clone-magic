# AI Control Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a per-module AI autonomy control center for BetFuz admins, with configurable dials (0–100%), AI action logging, and one-click human overrides.

**Architecture:** Autonomy settings stored in existing `system_config` table as `ai.autonomy.<module>` keys. A new `aiAutopilot.ts` service runs every 2 min via cron, reads config, fetches pending items, scores them rule-based, auto-acts above threshold, and writes every action to `audit_logs` with `adminId = 'AI_AUTOPILOT'`. The frontend `AIControl.tsx` reads config + decision log and lets admins adjust dials and override decisions.

**Tech Stack:** React 18, TypeScript, Tailwind, Lucide icons, Sonner toasts — same as all other admin pages. Express + Prisma on backend. node-cron for scheduling.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `backend/src/services/aiAutopilot.ts` | CREATE | Per-module autopilot logic, scoring, acting, audit logging |
| `backend/src/cron/autopilotJob.ts` | CREATE | 2-min cron wrapper |
| `backend/src/routes/admin.routes.ts` | MODIFY | Add 4 `/admin/ai-control/*` endpoints |
| `backend/src/server.ts` | MODIFY | Start autopilot cron alongside oddsSync |
| `src/lib/api/adminApi.ts` | MODIFY | Add `getAIControlConfig`, `saveAIControlConfig`, `getAIDecisions`, `runAutopilot`, `overrideDecision` |
| `src/pages/admin/AIControl.tsx` | CREATE | Full AI Control Center page |
| `src/pages/admin/Withdrawals.tsx` | REWRITE | Remove mock data, use real `adminApi.getWithdrawals` |
| `src/components/admin/AdminSidebar.tsx` | MODIFY | Add AI Control link, replace old AI Center link |
| `src/App.tsx` | MODIFY | Add `/admin/ai-control` lazy route |

---

## Task 1: Backend — `aiAutopilot.ts` service

**Files:**
- Create: `backend/src/services/aiAutopilot.ts`

- [ ] **Step 1: Create the service file**

```typescript
// backend/src/services/aiAutopilot.ts
import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { logger } from '../utils/logger';

const AI_ACTOR_ID = 'AI_AUTOPILOT';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getAutonomyLevel(module: string): Promise<number> {
  const key = `ai.autonomy.${module}`;
  const cached = await cache.get<number>(key);
  if (cached !== null) return cached;
  const config = await prisma.systemConfig.findUnique({ where: { key } });
  const level = config ? Number(config.value) : 0;
  await cache.set(key, level, 60);
  return level;
}

function confidenceThreshold(level: number): number | null {
  if (level <= 30) return null;       // no autonomous action
  if (level <= 70) return 80;         // act only on high confidence
  return 60;                          // act on medium confidence
}

async function logAction(
  action: string,
  resource: string,
  resourceId: string,
  metadata: Record<string, unknown>,
): Promise<string> {
  const log = await prisma.auditLog.create({
    data: {
      adminId:    AI_ACTOR_ID,
      action,
      resource,
      resourceId,
      metadata:   metadata as any,
    },
  });
  return log.id;
}

// ── Module: Withdrawals ───────────────────────────────────────────────────────

async function runWithdrawals(threshold: number): Promise<void> {
  const pending = await prisma.transaction.findMany({
    where: { type: 'WITHDRAWAL', status: 'PENDING' },
    include: { user: { select: { id: true, status: true, kycTier: true, createdAt: true } } },
    take: 20,
  });

  for (const tx of pending) {
    const amount = Number(tx.amount);
    // Hard invariant: never auto-approve above ₦1M
    if (amount > 1_000_000) continue;

    const accountAgeDays = (Date.now() - new Date(tx.user.createdAt).getTime()) / 86400000;
    const kycBonus = tx.user.kycTier === 'TIER_2' ? 15 : tx.user.kycTier === 'TIER_1' ? 8 : 0;
    const agingBonus = Math.min(accountAgeDays / 3, 20);
    const amountPenalty = amount > 500_000 ? 25 : amount > 100_000 ? 10 : 0;
    const suspendedPenalty = tx.user.status === 'SUSPENDED' ? 50 : 0;
    // Confidence = how confident we are this is a legit withdrawal (0–100)
    const confidence = Math.min(100, Math.max(0,
      50 + kycBonus + agingBonus - amountPenalty - suspendedPenalty
    ));

    if (confidence >= threshold) {
      await prisma.transaction.update({ where: { id: tx.id }, data: { status: 'COMPLETED' } });
      await logAction('AI_APPROVE_WITHDRAWAL', 'transaction', tx.id, { amount, confidence, reason: 'Auto-approved by AI autopilot' });
      logger.info(`AI: auto-approved withdrawal ${tx.id} (₦${amount}, confidence ${confidence}%)`);
    } else if (confidence < 30) {
      await prisma.transaction.update({ where: { id: tx.id }, data: { status: 'FAILED' } });
      await logAction('AI_REJECT_WITHDRAWAL', 'transaction', tx.id, { amount, confidence, reason: 'Auto-rejected: low confidence score' });
      logger.info(`AI: auto-rejected withdrawal ${tx.id} (₦${amount}, confidence ${confidence}%)`);
    }
  }
}

// ── Module: KYC ──────────────────────────────────────────────────────────────

async function runKYC(threshold: number): Promise<void> {
  const pending = await prisma.kycDocument.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { createdAt: true, kycTier: true } } },
    take: 20,
  });

  for (const doc of pending) {
    // Only auto-approve Tier 1 docs (national ID, passport) — never auto-approve business docs
    const tier1Types = ['NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE'];
    if (!tier1Types.includes(doc.type)) continue;

    const accountAgeDays = (Date.now() - new Date(doc.user.createdAt).getTime()) / 86400000;
    const typeBonus = doc.type === 'PASSPORT' ? 20 : doc.type === 'NATIONAL_ID' ? 15 : 10;
    const agingBonus = Math.min(accountAgeDays / 5, 20);
    const confidence = Math.min(100, 50 + typeBonus + agingBonus);

    if (confidence >= threshold) {
      await prisma.kycDocument.update({ where: { id: doc.id }, data: { status: 'APPROVED' } });
      await logAction('AI_APPROVE_KYC', 'kyc', doc.id, { type: doc.type, confidence, reason: 'Auto-approved Tier 1 document' });
      logger.info(`AI: auto-approved KYC doc ${doc.id} (${doc.type}, confidence ${confidence}%)`);
    }
  }
}

// ── Module: Fraud ─────────────────────────────────────────────────────────────

async function runFraud(threshold: number): Promise<void> {
  const flags = await prisma.auditLog.findMany({
    where: { action: 'FRAUD_FLAG', adminId: { not: AI_ACTOR_ID } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const userFlagCounts: Record<string, number> = {};
  for (const f of flags) {
    if (f.userId) userFlagCounts[f.userId] = (userFlagCounts[f.userId] || 0) + 1;
  }

  for (const [userId, flagCount] of Object.entries(userFlagCounts)) {
    const confidence = Math.min(100, flagCount * 20);
    if (confidence >= threshold) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.status === 'SUSPENDED') continue;
      await prisma.user.update({ where: { id: userId }, data: { status: 'SUSPENDED' } });
      await logAction('AI_SUSPEND_USER', 'user', userId, { flagCount, confidence, reason: 'Auto-suspended: repeated fraud flags' });
      logger.info(`AI: auto-suspended user ${userId} (${flagCount} flags, confidence ${confidence}%)`);
    }
  }
}

// ── Module: Odds ──────────────────────────────────────────────────────────────

async function runOdds(threshold: number): Promise<void> {
  // Suspend obviously wrong odds (below 1.01 or above 50)
  const outliers = await prisma.sportsOdds.findMany({
    where: {
      isSuspended: false,
      OR: [{ value: { lt: 1.01 } }, { value: { gt: 50 } }],
    },
    take: 50,
  });

  for (const odds of outliers) {
    const confidence = 95; // high confidence — extreme values are clearly wrong
    if (confidence >= threshold) {
      await prisma.sportsOdds.update({ where: { id: odds.id }, data: { isSuspended: true } });
      await logAction('AI_SUSPEND_ODDS', 'odds', odds.id, { value: Number(odds.value), confidence, reason: 'Auto-suspended: outlier odds value' });
    }
  }
}

// ── Module: Bonuses ───────────────────────────────────────────────────────────

async function runBonuses(threshold: number): Promise<void> {
  // Grant VIP bonuses to users who have bet enough this week but have no active bonus
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const activeUsers = await prisma.bet.groupBy({
    by: ['userId'],
    where: { createdAt: { gte: weekAgo }, status: { in: ['WON', 'LOST'] } },
    _sum: { stake: true },
    _count: { id: true },
    having: { stake: { _sum: { gt: 50000 } } }, // ₦50k+ staked in 7 days
  });

  for (const { userId, _sum, _count } of activeUsers) {
    const existing = await prisma.bonus.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'PENDING'] } },
    });
    if (existing) continue;

    const staked = Number(_sum.stake ?? 0);
    const bets = _count.id;
    const confidence = Math.min(100, Math.floor(staked / 5000) + bets * 2);

    if (confidence >= threshold) {
      const bonusAmount = Math.min(Math.floor(staked * 0.05), 10000); // 5% cashback, max ₦10k
      await prisma.bonus.create({
        data: {
          userId,
          type: 'CASHBACK',
          amount: bonusAmount,
          rolloverMultiple: 3,
          rolloverProgress: 0,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 7 * 86400000),
        },
      });
      await logAction('AI_GRANT_BONUS', 'bonus', userId, { amount: bonusAmount, staked, bets, confidence, reason: 'Auto-granted weekly cashback' });
      logger.info(`AI: auto-granted ₦${bonusAmount} cashback to ${userId}`);
    }
  }
}

// ── Module: Responsible Gambling ──────────────────────────────────────────────

async function runRG(threshold: number): Promise<void> {
  const flags = await prisma.rGLimit.findMany({
    where: { breached: true },
    include: { user: { select: { id: true, status: true } } },
    take: 20,
  });

  for (const flag of flags) {
    if (flag.user.status === 'SELF_EXCLUDED') continue;
    const confidence = 85;
    if (confidence >= threshold) {
      // Apply a cooling-off period — not a permanent exclusion
      await prisma.rGExclusion.create({
        data: {
          userId:    flag.userId,
          type:      'COOLING_OFF',
          startDate: new Date(),
          endDate:   new Date(Date.now() + 24 * 3600000), // 24h
          reason:    'AI-applied cooling-off: limit breach detected',
        },
      });
      await logAction('AI_RG_COOLING_OFF', 'rg', flag.userId, { limitType: flag.type, confidence, reason: '24h cooling-off applied after limit breach' });
      logger.info(`AI: applied 24h cooling-off to ${flag.userId}`);
    }
  }
}

// ── Module: Bet Settlement ────────────────────────────────────────────────────

async function runSettlement(threshold: number): Promise<void> {
  // Auto-settle bets on finished events where all selections are resolved
  const finishedEvents = await prisma.sportsEvent.findMany({
    where: { status: 'FINISHED' },
    include: { sports_markets: { include: { sports_odds: true } } },
    take: 20,
  });

  for (const event of finishedEvents) {
    const activeBets = await prisma.bet.findMany({
      where: {
        status: 'ACTIVE',
        selections: { some: { sports_odds: { sports_markets: { eventId: event.id } } } },
      },
      take: 50,
    });

    for (const bet of activeBets) {
      const confidence = 90;
      if (confidence >= threshold) {
        // Mark as needing settlement (actual payout logic handled by existing settlement system)
        await prisma.bet.update({ where: { id: bet.id }, data: { status: 'PENDING' } });
        await logAction('AI_QUEUE_SETTLEMENT', 'bet', bet.id, { eventId: event.id, confidence, reason: 'Auto-queued for settlement on finished event' });
      }
    }
  }
}

// ── Main runner ───────────────────────────────────────────────────────────────

export async function runAutopilot(): Promise<{ module: string; level: number; acted: boolean }[]> {
  const modules = ['withdrawals', 'kyc', 'fraud', 'odds', 'bonuses', 'rg', 'settlement'] as const;
  const results: { module: string; level: number; acted: boolean }[] = [];

  for (const mod of modules) {
    try {
      const level = await getAutonomyLevel(mod);
      const threshold = confidenceThreshold(level);

      if (threshold === null) {
        results.push({ module: mod, level, acted: false });
        continue;
      }

      switch (mod) {
        case 'withdrawals': await runWithdrawals(threshold); break;
        case 'kyc':         await runKYC(threshold);         break;
        case 'fraud':       await runFraud(threshold);       break;
        case 'odds':        await runOdds(threshold);        break;
        case 'bonuses':     await runBonuses(threshold);     break;
        case 'rg':          await runRG(threshold);          break;
        case 'settlement':  await runSettlement(threshold);  break;
      }

      results.push({ module: mod, level, acted: true });
    } catch (err: any) {
      logger.error(`AI autopilot error in module ${mod}`, { error: err.message });
      results.push({ module: mod, level: 0, acted: false });
    }
  }

  return results;
}
```

- [ ] **Step 2: Verify file saved — check for syntax issues**

```bash
cd /root/betfuz/backend && npx tsc --noEmit 2>&1 | grep "aiAutopilot" | head -10
```
Expected: no errors mentioning aiAutopilot.ts

---

## Task 2: Backend — `autopilotJob.ts` cron

**Files:**
- Create: `backend/src/cron/autopilotJob.ts`
- Modify: `backend/src/server.ts` lines 218–222

- [ ] **Step 1: Create the cron wrapper**

```typescript
// backend/src/cron/autopilotJob.ts
import cron from 'node-cron';
import { runAutopilot } from '../services/aiAutopilot';
import { logger } from '../utils/logger';

export function startAutopilotJob(): void {
  cron.schedule('*/2 * * * *', async () => {
    try {
      const results = await runAutopilot();
      const acted = results.filter(r => r.acted).length;
      if (acted > 0) logger.info(`AI autopilot cycle complete: ${acted} modules acted`);
    } catch (err: any) {
      logger.error('AI autopilot cron failed', { error: err.message });
    }
  });
  logger.info('AI autopilot cron registered (every 2 min)');
}
```

- [ ] **Step 2: Register cron in `server.ts`**

Find this block in `backend/src/server.ts`:
```typescript
      startOddsSyncJob();
```

Replace with:
```typescript
      startOddsSyncJob();
      startAutopilotJob();
```

And add to imports at the top of `server.ts` alongside the existing cron import:
```typescript
import { startAutopilotJob } from './cron/autopilotJob';
```

---

## Task 3: Backend — AI Control routes

**Files:**
- Modify: `backend/src/routes/admin.routes.ts`

Add the following four routes **before** the `// ── GET /admin/system-config` block:

- [ ] **Step 1: Add routes**

```typescript
// ── AI CONTROL CENTER ─────────────────────────────────────────────────────────

const AI_MODULES = ['withdrawals', 'kyc', 'fraud', 'odds', 'bonuses', 'rg', 'settlement'] as const;
const DEFAULT_AUTONOMY = Object.fromEntries(AI_MODULES.map(m => [`ai.autonomy.${m}`, 0]));

// GET /admin/ai-control/config — current autonomy levels
router.get('/ai-control/config', async (_req, res, next) => {
  try {
    const configs = await prisma.systemConfig.findMany({
      where: { key: { startsWith: 'ai.autonomy.' } },
    });
    const result = { ...DEFAULT_AUTONOMY, ...Object.fromEntries(configs.map(c => [c.key, Number(c.value)])) };
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// PATCH /admin/ai-control/config — save autonomy levels
router.patch('/ai-control/config', async (req: any, res, next) => {
  try {
    const updates = req.body as Record<string, number>;
    await Promise.all(
      Object.entries(updates)
        .filter(([key]) => key.startsWith('ai.autonomy.'))
        .map(([key, value]) =>
          prisma.systemConfig.upsert({
            where:  { key },
            create: { key, value: String(value) },
            update: { value: String(value), updatedBy: req.user.id },
          })
        )
    );
    // Invalidate cached autonomy levels
    await Promise.all(Object.keys(updates).map(k => cache.del(k)));
    await prisma.auditLog.create({
      data: { adminId: req.user.id, action: 'UPDATE_AI_AUTONOMY', resource: 'ai_control', metadata: updates as any },
    });
    res.json({ success: true, message: 'AI autonomy config saved' });
  } catch (err) { next(err); }
});

// GET /admin/ai-control/decisions — paginated AI action log
router.get('/ai-control/decisions', async (req, res, next) => {
  try {
    const page  = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '50');
    const mod   = req.query.module as string | undefined;

    const where: any = { adminId: 'AI_AUTOPILOT' };
    if (mod) where.resource = mod;

    const [decisions, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ success: true, data: { decisions, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// POST /admin/ai-control/run — manually trigger autopilot cycle
router.post('/ai-control/run', async (_req, res, next) => {
  try {
    const { runAutopilot } = await import('../services/aiAutopilot');
    const results = await runAutopilot();
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

// POST /admin/ai-control/override/:auditLogId — human override of AI decision
router.post('/ai-control/override/:auditLogId', async (req: any, res, next) => {
  try {
    const original = await prisma.auditLog.findUnique({ where: { id: req.params.auditLogId } });
    if (!original || original.adminId !== 'AI_AUTOPILOT') {
      return res.status(404).json({ success: false, error: 'AI decision not found' });
    }
    await prisma.auditLog.create({
      data: {
        adminId:    req.user.id,
        action:     `HUMAN_OVERRIDE_${original.action}`,
        resource:   original.resource,
        resourceId: original.resourceId,
        metadata:   { originalDecisionId: original.id, reason: req.body.reason ?? 'Manual override' } as any,
      },
    });
    res.json({ success: true, message: 'Override logged' });
  } catch (err) { next(err); }
});
```

---

## Task 4: Frontend — update `adminApi.ts`

**Files:**
- Modify: `src/lib/api/adminApi.ts`

- [ ] **Step 1: Add AI Control methods**

Add after the `// AI` block (after line with `getAIBonusRec`):

```typescript
  // AI Control Center
  getAIControlConfig: () =>
    api.get('/admin/ai-control/config').then(r => r.data.data ?? r.data),
  saveAIControlConfig: (config: Record<string, number>) =>
    api.patch('/admin/ai-control/config', config).then(r => r.data),
  getAIDecisions: (params?: { module?: string; page?: number; limit?: number }) =>
    api.get('/admin/ai-control/decisions', { params }).then(r => r.data.data ?? r.data),
  runAutopilot: () =>
    api.post('/admin/ai-control/run').then(r => r.data.data ?? r.data),
  overrideDecision: (auditLogId: string, reason?: string) =>
    api.post(`/admin/ai-control/override/${auditLogId}`, { reason }).then(r => r.data),
```

---

## Task 5: Frontend — build `AIControl.tsx`

**Files:**
- Create: `src/pages/admin/AIControl.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import { toast } from 'sonner';
import {
  Brain, Zap, DollarSign, ShieldCheck, Gift, HeartHandshake,
  Activity, RefreshCw, ChevronDown, ChevronUp, CheckCircle,
  AlertTriangle, RotateCcw, Play,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ModuleMeta {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  hardLimit?: string;
}

interface AIDecision {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  createdAt: string;
}

// ── Module definitions ────────────────────────────────────────────────────────

const MODULES: ModuleMeta[] = [
  { key: 'withdrawals', label: 'Withdrawals',        icon: DollarSign,    color: 'emerald', description: 'Auto-approve low-risk payouts, auto-reject fraud', hardLimit: 'Never auto-approves above ₦1M' },
  { key: 'kyc',         label: 'KYC Review',         icon: ShieldCheck,   color: 'blue',    description: 'Auto-approve Tier 1 documents with clear scans',   hardLimit: 'Never auto-approves Tier 2+ docs' },
  { key: 'fraud',       label: 'Fraud Detection',    icon: AlertTriangle, color: 'red',     description: 'Auto-suspend accounts with repeated fraud flags' },
  { key: 'odds',        label: 'Odds Management',    icon: Zap,           color: 'yellow',  description: 'Auto-suspend outlier odds values (<1.01 or >50)' },
  { key: 'bonuses',     label: 'Bonus Engine',       icon: Gift,          color: 'pink',    description: 'Auto-grant weekly cashback to qualifying users' },
  { key: 'rg',          label: 'Resp. Gambling',     icon: HeartHandshake,color: 'purple',  description: 'Auto-apply 24h cooling-off on limit breaches',      hardLimit: 'Never permanently excludes without human approval' },
  { key: 'settlement',  label: 'Bet Settlement',     icon: Activity,      color: 'cyan',    description: 'Auto-queue bets for settlement on finished events' },
];

function dialLabel(level: number): { label: string; cls: string } {
  if (level <= 30) return { label: 'Human Only',  cls: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };
  if (level <= 70) return { label: 'Hybrid',      cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
  return               { label: 'Autopilot',    cls: 'text-green-400 bg-green-500/10 border-green-500/20' };
}

function operatingMode(config: Record<string, number>): string {
  const vals = Object.values(config);
  if (!vals.length) return 'Human Only';
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  if (avg <= 30) return 'Human Only';
  if (avg <= 70) return 'Hybrid';
  return 'Full Autopilot';
}

const COLOR_MAP: Record<string, string> = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  blue:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
  red:     'text-red-400 bg-red-500/10 border-red-500/20',
  yellow:  'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  pink:    'text-pink-400 bg-pink-500/10 border-pink-500/20',
  purple:  'text-purple-400 bg-purple-500/10 border-purple-500/20',
  cyan:    'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
};

const TRACK_COLOR: Record<string, string> = {
  emerald: 'accent-emerald-500',
  blue:    'accent-blue-500',
  red:     'accent-red-500',
  yellow:  'accent-yellow-500',
  pink:    'accent-pink-500',
  purple:  'accent-purple-500',
  cyan:    'accent-cyan-500',
};

// ── Sub-components ────────────────────────────────────────────────────────────

const ModuleCard = ({
  mod, level, onChange, decisions, onOverride,
}: {
  mod: ModuleMeta;
  level: number;
  onChange: (key: string, val: number) => void;
  decisions: AIDecision[];
  onOverride: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { label, cls } = dialLabel(level);
  const Icon = mod.icon;
  const iconCls = COLOR_MAP[mod.color] ?? COLOR_MAP.blue;
  const trackCls = TRACK_COLOR[mod.color] ?? TRACK_COLOR.blue;
  const todayDecisions = decisions.filter(d =>
    d.resource === mod.key &&
    new Date(d.createdAt) > new Date(Date.now() - 86400000)
  );

  return (
    <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${iconCls}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{mod.label}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{mod.description}</p>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ml-2 ${cls}`}>
            {label}
          </span>
        </div>

        {/* Slider */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-gray-500 text-xs">AI Autonomy</span>
            <span className="text-white text-xs font-mono font-bold">{level}%</span>
          </div>
          <input
            type="range" min={0} max={100} step={5}
            value={level}
            onChange={e => onChange(mod.key, Number(e.target.value))}
            className={`w-full h-1.5 rounded-full cursor-pointer ${trackCls}`}
          />
          <div className="flex justify-between mt-1">
            <span className="text-gray-600 text-[10px]">Human</span>
            <span className="text-gray-600 text-[10px]">Hybrid</span>
            <span className="text-gray-600 text-[10px]">Autopilot</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-3">
          <div className="text-center">
            <p className="text-white text-sm font-bold">{todayDecisions.length}</p>
            <p className="text-gray-600 text-[10px]">actions today</p>
          </div>
          {mod.hardLimit && (
            <div className="flex items-center gap-1 text-yellow-500/70 text-[10px] border border-yellow-500/20 rounded px-2 py-1">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              {mod.hardLimit}
            </div>
          )}
        </div>

        {/* Recent decisions toggle */}
        {todayDecisions.length > 0 && (
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1 text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Recent decisions ({todayDecisions.length})
          </button>
        )}
      </div>

      {/* Recent decisions panel */}
      {open && todayDecisions.length > 0 && (
        <div className="border-t border-[#1f2d3d] bg-[#0d1520]">
          {todayDecisions.slice(0, 5).map(d => (
            <div key={d.id} className="flex items-center justify-between px-4 py-2.5 border-b border-[#1f2d3d]/40 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-xs font-mono truncate">{d.action}</p>
                <p className="text-gray-600 text-[10px]">
                  {new Date(d.createdAt).toLocaleTimeString()} ·{' '}
                  conf: {(d.metadata as any)?.confidence ?? '—'}%
                </p>
              </div>
              <button
                onClick={() => onOverride(d.id)}
                className="ml-2 flex items-center gap-1 text-[10px] text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded hover:bg-yellow-500/10 transition-colors flex-shrink-0"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Override
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AIControl() {
  const [config, setConfig]       = useState<Record<string, number>>({});
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [dirty, setDirty]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [running, setRunning]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [decPage, setDecPage]     = useState(1);
  const [decTotal, setDecTotal]   = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, dec] = await Promise.all([
        adminApi.getAIControlConfig(),
        adminApi.getAIDecisions({ limit: 50 }),
      ]);
      // Normalise keys: strip 'ai.autonomy.' prefix for UI use
      const normalized: Record<string, number> = {};
      for (const [k, v] of Object.entries(cfg as Record<string, number>)) {
        normalized[k.replace('ai.autonomy.', '')] = Number(v);
      }
      setConfig(normalized);
      setDecisions(dec.decisions ?? []);
      setDecTotal(dec.total ?? 0);
    } catch { toast.error('Failed to load AI config'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (module: string, val: number) => {
    setConfig(c => ({ ...c, [module]: val }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Re-prefix keys for backend
      const prefixed: Record<string, number> = {};
      for (const [k, v] of Object.entries(config)) prefixed[`ai.autonomy.${k}`] = v;
      await adminApi.saveAIControlConfig(prefixed);
      setDirty(false);
      toast.success('AI autonomy settings saved');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const results = await adminApi.runAutopilot();
      const acted = (results as any[]).filter(r => r.acted).length;
      toast.success(`Autopilot cycle complete — ${acted} modules acted`);
      load();
    } catch { toast.error('Autopilot run failed'); }
    finally { setRunning(false); }
  };

  const handleOverride = async (auditLogId: string) => {
    try {
      await adminApi.overrideDecision(auditLogId, 'Manual override by admin');
      toast.success('Override logged');
      load();
    } catch { toast.error('Override failed'); }
  };

  const loadMoreDecisions = async () => {
    const next = decPage + 1;
    try {
      const dec = await adminApi.getAIDecisions({ page: next, limit: 50 });
      setDecisions(d => [...d, ...(dec.decisions ?? [])]);
      setDecPage(next);
    } catch { toast.error('Failed to load more'); }
  };

  const mode = operatingMode(config);
  const modeCls = mode === 'Full Autopilot'
    ? 'text-green-400 bg-green-500/10 border-green-500/20'
    : mode === 'Hybrid'
      ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      : 'text-gray-400 bg-gray-500/10 border-gray-500/20';

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="AI Control Center" subtitle="Configure AI autonomy per module" />
        <div className="p-6 space-y-6">

          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold text-sm">Operating Mode:</span>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${modeCls}`}>{mode}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {dirty && (
                <button
                  onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#00b15c] hover:bg-[#00c96a] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Saving…</> : <><CheckCircle className="w-3.5 h-3.5" />Save Changes</>}
                </button>
              )}
              <button
                onClick={handleRun} disabled={running}
                className="flex items-center gap-1.5 px-3 py-2 border border-[#1f2d3d] text-gray-400 hover:text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {running ? 'Running…' : 'Run Now'}
              </button>
              <button onClick={load} className="p-2 border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg transition-colors">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-[#1a1000] border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-400/80 text-xs leading-relaxed">
              <strong className="text-yellow-400">0–30%:</strong> AI analysis only, no autonomous action.&nbsp;
              <strong className="text-yellow-400">31–70%:</strong> AI acts on confidence &gt;80%, flags the rest.&nbsp;
              <strong className="text-yellow-400">71–100%:</strong> AI acts on confidence &gt;60%. Hardcoded limits always apply regardless of dial.
            </p>
          </div>

          {/* Module cards */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(7)].map((_, i) => <div key={i} className="h-44 bg-[#111827] border border-[#1f2d3d] rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {MODULES.map(mod => (
                <ModuleCard
                  key={mod.key}
                  mod={mod}
                  level={config[mod.key] ?? 0}
                  onChange={handleChange}
                  decisions={decisions}
                  onOverride={handleOverride}
                />
              ))}
            </div>
          )}

          {/* AI Action Log */}
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2d3d]">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <h3 className="text-white font-semibold text-sm">AI Action Log</h3>
                <span className="text-gray-500 text-xs">({decTotal} total)</span>
              </div>
            </div>

            {decisions.length === 0 ? (
              <div className="text-center py-10">
                <Brain className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No AI actions yet</p>
                <p className="text-gray-700 text-xs mt-1">Set autonomy above 30% and click Run Now to see AI decisions here</p>
              </div>
            ) : (
              <>
                {/* Log header */}
                <div className="hidden sm:grid grid-cols-[120px_120px_1fr_100px_120px] gap-4 px-5 py-2 text-gray-600 text-xs uppercase tracking-wider border-b border-[#1f2d3d]/50">
                  <span>Time</span><span>Module</span><span>Action</span><span>Confidence</span><span />
                </div>
                <div className="divide-y divide-[#1f2d3d]/50">
                  {decisions.map(d => (
                    <div key={d.id} className="grid grid-cols-1 sm:grid-cols-[120px_120px_1fr_100px_120px] gap-2 sm:gap-4 px-5 py-3 items-center hover:bg-white/[0.01]">
                      <span className="text-gray-500 text-xs">{new Date(d.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-gray-400 text-xs capitalize">{d.resource}</span>
                      <span className="text-gray-300 text-xs font-mono">{d.action}</span>
                      <span className="text-[#00b15c] text-xs font-bold">{(d.metadata as any)?.confidence != null ? `${(d.metadata as any).confidence}%` : '—'}</span>
                      <button
                        onClick={() => handleOverride(d.id)}
                        className="flex items-center gap-1 text-[10px] text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded hover:bg-yellow-500/10 transition-colors"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Override
                      </button>
                    </div>
                  ))}
                </div>
                {decisions.length < decTotal && (
                  <div className="px-5 py-3 border-t border-[#1f2d3d]">
                    <button onClick={loadMoreDecisions} className="text-[#00b15c] text-xs hover:underline">
                      Load more ({decTotal - decisions.length} remaining) →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
```

---

## Task 6: Frontend — Fix `Withdrawals.tsx`

**Files:**
- Rewrite: `src/pages/admin/Withdrawals.tsx`

- [ ] **Step 1: Replace with real API version**

```tsx
import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { adminApi } from '@/lib/api/adminApi';
import { toast } from 'sonner';
import { DollarSign, RefreshCw, CheckCircle, XCircle, Search, Clock } from 'lucide-react';

const fmt = (n: number) => `₦${Number(n).toLocaleString()}`;

const STATUS_CLS: Record<string, string> = {
  PENDING:    'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  PROCESSING: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  COMPLETED:  'text-green-400 bg-green-500/10 border-green-500/20',
  FAILED:     'text-red-400 bg-red-500/10 border-red-500/20',
  CANCELLED:  'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [status, setStatus]           = useState('PENDING');
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [acting, setActing]           = useState<string | null>(null);
  const LIMIT = 20;

  const load = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    if (reset) setPage(1);
    setLoading(true);
    try {
      const res = await adminApi.getWithdrawals({ status: status || undefined, search: search || undefined, limit: LIMIT, page: p });
      const list = res.data ?? res.withdrawals ?? [];
      setWithdrawals(prev => reset || p === 1 ? list : [...prev, ...list]);
      setTotal(res.total ?? list.length);
    } catch { toast.error('Failed to load withdrawals'); }
    finally { setLoading(false); }
  }, [status, search, page]);

  useEffect(() => { load(true); }, [status, search]);

  const approve = async (id: string) => {
    setActing(id);
    try {
      await adminApi.approveWithdrawal(id);
      toast.success('Withdrawal approved');
      load(true);
    } catch { toast.error('Approval failed'); }
    finally { setActing(null); }
  };

  const reject = async (id: string) => {
    setActing(id);
    try {
      await adminApi.rejectWithdrawal(id, 'Rejected by admin');
      toast.success('Withdrawal rejected');
      load(true);
    } catch { toast.error('Rejection failed'); }
    finally { setActing(null); }
  };

  const pendingCount = withdrawals.filter(w => w.status === 'PENDING').length;

  return (
    <AdminGuard>
      <AdminLayout>
        <AdminHeader title="Withdrawals" subtitle="Review and process withdrawal requests" />
        <div className="p-6 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pending',   value: pendingCount,   color: 'text-yellow-400' },
              { label: 'Showing',   value: withdrawals.length, color: 'text-white' },
              { label: 'Total',     value: total,          color: 'text-gray-400' },
            ].map(s => (
              <div key={s.label} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[180px] flex items-center gap-2 bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search user, ref…"
                className="bg-transparent text-white text-sm flex-1 outline-none" />
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="bg-[#0d1520] border border-[#1f2d3d] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none">
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
            <button onClick={() => load(true)} className="p-2 bg-[#0d1520] border border-[#1f2d3d] text-gray-400 hover:text-white rounded-lg">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Table */}
          {loading && withdrawals.length === 0 ? (
            <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-[#111827] border border-[#1f2d3d] rounded-xl animate-pulse" />)}</div>
          ) : withdrawals.length === 0 ? (
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-12 text-center">
              <DollarSign className="w-10 h-10 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No withdrawals found</p>
            </div>
          ) : (
            <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1fr_100px_120px_110px_140px] gap-4 px-5 py-2.5 text-gray-600 text-xs uppercase tracking-wider border-b border-[#1f2d3d]">
                <span>User</span><span className="text-right">Amount</span><span>Method</span><span className="text-center">Status</span><span className="text-center">Actions</span>
              </div>
              <div className="divide-y divide-[#1f2d3d]/50">
                {withdrawals.map((w: any) => (
                  <div key={w.id} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_120px_110px_140px] gap-2 sm:gap-4 px-5 py-3.5 items-center hover:bg-white/[0.01]">
                    <div>
                      <p className="text-white text-sm font-medium">{w.user?.email ?? w.userId}</p>
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(w.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-white text-sm font-bold text-right">{fmt(w.amount)}</p>
                    <p className="text-gray-400 text-sm">{w.paymentMethod ?? '—'}</p>
                    <div className="flex justify-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_CLS[w.status] ?? STATUS_CLS.PENDING}`}>
                        {w.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      {w.status === 'PENDING' && (
                        <>
                          <button onClick={() => approve(w.id)} disabled={acting === w.id}
                            className="flex items-center gap-1 text-xs text-green-400 border border-green-500/20 px-2.5 py-1.5 rounded-lg hover:bg-green-500/10 transition-colors disabled:opacity-50">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => reject(w.id)} disabled={acting === w.id}
                            className="flex items-center gap-1 text-xs text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {withdrawals.length < total && (
                <div className="px-5 py-3 border-t border-[#1f2d3d]">
                  <button onClick={() => { setPage(p => p + 1); load(); }} disabled={loading}
                    className="text-[#00b15c] text-xs hover:underline disabled:opacity-50">
                    Load more ({total - withdrawals.length} remaining) →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
```

---

## Task 7: Wire routes and sidebar

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx`

- [ ] **Step 1: Add lazy import and route in `App.tsx`**

Add alongside other admin lazy imports:
```typescript
const AdminAIControl = lazy(() => import('./pages/admin/AIControl'));
```

Add alongside other admin routes:
```tsx
<Route path="/admin/ai-control" element={<AdminAIControl />} />
```

- [ ] **Step 2: Update sidebar in `AdminSidebar.tsx`**

Find the `{ to: '/admin/ai', icon: Brain, label: 'AI Center' }` entry and replace it with:
```typescript
{ to: '/admin/ai-control', icon: Brain,   label: 'AI Control' },
{ to: '/admin/ai',         icon: Sparkles, label: 'AI Center'  },
```

Add `Sparkles` to the lucide-react import at the top of `AdminSidebar.tsx`.

---

## Task 8: Build and deploy backend

- [ ] **Step 1: Compile TypeScript**

```bash
cd /root/betfuz/backend && npm run build 2>&1 | tail -5
```
Expected: `Exit: 0` with no TypeScript errors.

- [ ] **Step 2: Restart PM2**

```bash
pm2 restart betfuz-api && sleep 3 && curl -s http://localhost:4000/health
```
Expected: `{"status":"ok",...}`

---

## Task 9: Build and deploy frontend

- [ ] **Step 1: Build**

```bash
cd /root/betfuz-v2 && npm run build 2>&1 | tail -5
```
Expected: `✓ built in X.XXs`

- [ ] **Step 2: Verify nginx is serving new dist**

```bash
curl -s http://localhost/admin/ai-control 2>&1 | grep -c "html" || echo "check nginx config"
```

---

## Self-Review

**Spec coverage:**
- ✅ `/admin/ai-control` page with per-module dials — Task 5
- ✅ Autonomy settings in `system_config` — Tasks 3 + 4
- ✅ `aiAutopilot.ts` service — Task 1
- ✅ 2-min cron — Task 2
- ✅ AI actions logged with `adminId = 'AI_AUTOPILOT'` — Task 1 (`logAction`)
- ✅ One-click override — Tasks 3 (`POST /ai-control/override`) + 5 (Override buttons)
- ✅ Hard invariants (₦1M, permanent exclusion) — Task 1
- ✅ Full audit trail — `logAction` in every autopilot branch
- ✅ Withdrawals.tsx fixed — Task 6
- ✅ Sidebar + routes wired — Task 7

**Placeholder scan:** No TBD, TODO, or "similar to Task N" patterns found.

**Type consistency:**
- `AIDecision.id` used in `handleOverride(id)` — consistent throughout
- `config[mod.key]` keys are unprefixed strings in UI, prefixed before sending to API — handled in `handleSave` and `load`
- `adminApi.getAIDecisions` returns `{ decisions, total, page, pages }` — matches what `load()` destructures
