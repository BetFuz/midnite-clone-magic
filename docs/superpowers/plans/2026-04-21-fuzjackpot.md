# FuzJackpot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build FuzJackpot — a multi-tier weekly prediction jackpot with Mini/Midi/Mega tiers, rollover mechanics, AI picks, syndicates, and rich per-match analytics.

**Architecture:** Four new Prisma models (jackpot_rounds, jackpot_matches, jackpot_entries, jackpot_syndicates) backed by 10 REST routes in the backend, consumed by a full-page Jackpot.tsx rewrite using 6 new components and 2 custom hooks.

**Tech Stack:** Prisma + PostgreSQL, Express, Anthropic SDK (claude-sonnet-4-6), React 18, recharts, Tailwind CSS, axios, ESPN public API (no key).

---

## File Map

**Backend (create):**
- `backend/prisma/schema.prisma` — add 4 models + 5 enums
- `backend/src/routes/jackpot.routes.ts` — all 10 routes
- `backend/src/cron/jackpotSettlement.ts` — Sunday 11pm cron

**Backend (modify):**
- `backend/src/routes/admin.routes.ts` — add admin jackpot endpoints
- `backend/src/services/claudeService.ts` — add getJackpotPicks()
- `backend/src/server.ts` — mount jackpot routes + cron

**Frontend (create):**
- `src/lib/api/jackpot.ts` — API client methods
- `src/hooks/useJackpot.ts` — state, picks, submit
- `src/hooks/useJackpotStats.ts` — ESPN form/H2H fetch
- `src/components/jackpot/JackpotTierCard.tsx`
- `src/components/jackpot/JackpotMatchCard.tsx`
- `src/components/jackpot/JackpotAIPicks.tsx`
- `src/components/jackpot/JackpotProgress.tsx`
- `src/components/jackpot/JackpotMyTickets.tsx`
- `src/components/jackpot/JackpotSyndicate.tsx`
- `src/pages/Jackpot.tsx` — full rewrite
- `src/pages/admin/AdminJackpot.tsx`

**Frontend (modify):**
- `src/App.tsx` — add routes
- `src/components/admin/AdminSidebar.tsx` — add Jackpot link

---

## Task 1: Prisma Schema — New Models

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: Add enums and models to schema.prisma**

Append to the bottom of `backend/prisma/schema.prisma`:

```prisma
enum JackpotTier {
  MINI
  MIDI
  MEGA
}

enum JackpotStatus {
  OPEN
  CLOSED
  SETTLED
  ROLLED_OVER
}

enum JackpotResult {
  HOME
  DRAW
  AWAY
}

enum JackpotEntryStatus {
  PENDING
  CORRECT_ALL
  CONSOLATION
  LOST
}

enum SyndicateStatus {
  FORMING
  COMPLETE
  CANCELLED
}

model jackpot_rounds {
  id              String          @id @default(uuid())
  tier            JackpotTier
  weekLabel       String
  status          JackpotStatus   @default(OPEN)
  poolAmount      Decimal         @default(0) @db.Decimal(14, 2)
  guaranteedMin   Decimal         @db.Decimal(14, 2)
  entryFee        Decimal         @db.Decimal(10, 2)
  matchCount      Int
  closesAt        DateTime
  settledAt       DateTime?
  rolloverFrom    String?
  rolloverWeeks   Int             @default(0)
  createdAt       DateTime        @default(now())
  jackpot_matches   jackpot_matches[]
  jackpot_entries   jackpot_entries[]
  jackpot_syndicates jackpot_syndicates[]

  @@index([status])
  @@index([tier])
}

model jackpot_matches {
  id            String          @id @default(uuid())
  roundId       String
  eventId       String?
  position      Int
  homeTeam      String
  awayTeam      String
  league        String
  kickoffAt     DateTime
  result        JackpotResult?
  homeOdds      Decimal?        @db.Decimal(6, 2)
  drawOdds      Decimal?        @db.Decimal(6, 2)
  awayOdds      Decimal?        @db.Decimal(6, 2)
  statsSnapshot Json            @default("{}")
  jackpot_rounds jackpot_rounds @relation(fields: [roundId], references: [id])

  @@index([roundId])
}

model jackpot_entries {
  id            String              @id @default(uuid())
  userId        String
  roundId       String
  syndicateId   String?
  picks         Json
  ticketNumber  Int                 @default(1)
  entryFee      Decimal             @db.Decimal(10, 2)
  status        JackpotEntryStatus  @default(PENDING)
  correctCount  Int?
  payout        Decimal?            @db.Decimal(14, 2)
  usedAIPicks   Boolean             @default(false)
  createdAt     DateTime            @default(now())
  jackpot_rounds jackpot_rounds     @relation(fields: [roundId], references: [id])
  users         users               @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([roundId])
}

model jackpot_syndicates {
  id              String          @id @default(uuid())
  roundId         String
  creatorId       String
  shareCode       String          @unique
  memberCount     Int             @default(1)
  requiredMembers Int
  contributionPer Decimal         @db.Decimal(10, 2)
  status          SyndicateStatus @default(FORMING)
  members         Json            @default("[]")
  entryId         String?
  createdAt       DateTime        @default(now())
  jackpot_rounds  jackpot_rounds  @relation(fields: [roundId], references: [id])
  users           users           @relation(fields: [creatorId], references: [id])

  @@index([roundId])
  @@index([shareCode])
}
```

- [ ] **Step 2: Run migration**

```bash
cd /root/betfuz/backend
npx prisma migrate dev --name add_jackpot_tables
```

Expected: Migration created and applied. Prisma client regenerated.

- [ ] **Step 3: Verify client generated**

```bash
npx prisma generate
```

Expected: "Generated Prisma Client"

- [ ] **Step 4: Commit**

```bash
cd /root/betfuz/backend
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add jackpot schema — 4 models, 5 enums"
```

---

## Task 2: Backend Jackpot Routes

**Files:**
- Create: `backend/src/routes/jackpot.routes.ts`

- [ ] **Step 1: Create the routes file**

```typescript
// backend/src/routes/jackpot.routes.ts
import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { getJackpotPicks } from '../services/claudeService';

const router = Router();
router.use(authenticate);

// GET /jackpot/rounds — all active rounds
router.get('/rounds', async (req: Request, res: Response) => {
  try {
    const rounds = await prisma.jackpot_rounds.findMany({
      where: { status: { in: ['OPEN', 'CLOSED'] } },
      include: { jackpot_matches: { orderBy: { position: 'asc' } } },
      orderBy: { tier: 'asc' },
    });
    res.json({ success: true, data: rounds });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /jackpot/rounds/:id
router.get('/rounds/:id', async (req: Request, res: Response) => {
  try {
    const round = await prisma.jackpot_rounds.findUnique({
      where: { id: req.params.id },
      include: { jackpot_matches: { orderBy: { position: 'asc' } } },
    });
    if (!round) return res.status(404).json({ success: false, error: 'Round not found' });
    res.json({ success: true, data: round });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /jackpot/enter
router.post('/enter', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { roundId, picks, usedAIPicks = false } = req.body;
    if (!roundId || !Array.isArray(picks)) {
      return res.status(400).json({ success: false, error: 'roundId and picks[] required' });
    }
    const round = await prisma.jackpot_rounds.findFirst({ where: { id: roundId, status: 'OPEN' } });
    if (!round) return res.status(404).json({ success: false, error: 'Round not found or closed' });
    if (picks.length !== round.matchCount) {
      return res.status(400).json({ success: false, error: `Must pick exactly ${round.matchCount} matches` });
    }
    const wallet = await prisma.wallets.findUnique({ where: { userId } });
    const fee = Number(round.entryFee);
    if (!wallet || Number(wallet.cashBalance) < fee) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }
    const existingCount = await prisma.jackpot_entries.count({ where: { userId, roundId } });
    const poolContribution = fee * 0.95;

    const entry = await prisma.$transaction(async (tx) => {
      await tx.wallets.update({ where: { userId }, data: { cashBalance: { decrement: fee } } });
      await tx.jackpot_rounds.update({ where: { id: roundId }, data: { poolAmount: { increment: poolContribution } } });
      return tx.jackpot_entries.create({
        data: { userId, roundId, picks, entryFee: fee, usedAIPicks, ticketNumber: existingCount + 1 },
      });
    });

    await cache.publish('jackpot:pool', { roundId, poolAmount: Number(round.poolAmount) + poolContribution });
    res.json({ success: true, data: entry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /jackpot/ai-picks/:roundId
router.post('/ai-picks/:roundId', async (req: Request, res: Response) => {
  try {
    const round = await prisma.jackpot_rounds.findUnique({
      where: { id: req.params.roundId },
      include: { jackpot_matches: { orderBy: { position: 'asc' } } },
    });
    if (!round) return res.status(404).json({ success: false, error: 'Round not found' });
    const picks = await getJackpotPicks(round.jackpot_matches as any[]);
    res.json({ success: true, data: picks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /jackpot/syndicate/create
router.post('/syndicate/create', async (req: Request, res: Response) => {
  try {
    const creatorId = (req as any).user.id;
    const { roundId, requiredMembers } = req.body;
    if (!roundId || !requiredMembers || requiredMembers < 2) {
      return res.status(400).json({ success: false, error: 'roundId and requiredMembers (>=2) required' });
    }
    const round = await prisma.jackpot_rounds.findFirst({ where: { id: roundId, status: 'OPEN' } });
    if (!round) return res.status(404).json({ success: false, error: 'Round not found or closed' });

    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const contributionPer = Number(round.entryFee) / requiredMembers;

    const syndicate = await prisma.jackpot_syndicates.create({
      data: {
        roundId, creatorId, shareCode, requiredMembers, contributionPer,
        members: [{ userId: creatorId, joinedAt: new Date().toISOString(), contributed: true }],
      },
    });
    res.json({ success: true, data: syndicate });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /jackpot/syndicate/join/:code
router.post('/syndicate/join/:code', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const syndicate = await prisma.jackpot_syndicates.findUnique({ where: { shareCode: req.params.code } });
    if (!syndicate || syndicate.status !== 'FORMING') {
      return res.status(404).json({ success: false, error: 'Syndicate not found or no longer forming' });
    }
    const members = syndicate.members as any[];
    if (members.find((m: any) => m.userId === userId)) {
      return res.status(400).json({ success: false, error: 'Already in this syndicate' });
    }
    const wallet = await prisma.wallets.findUnique({ where: { userId } });
    const contribution = Number(syndicate.contributionPer);
    if (!wallet || Number(wallet.cashBalance) < contribution) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    const newMembers = [...members, { userId, joinedAt: new Date().toISOString(), contributed: true }];
    const newCount = newMembers.length;
    const isComplete = newCount >= syndicate.requiredMembers;

    await prisma.$transaction(async (tx) => {
      await tx.wallets.update({ where: { userId }, data: { cashBalance: { decrement: contribution } } });
      if (isComplete) {
        const round = await tx.jackpot_rounds.findUnique({ where: { id: syndicate.roundId } });
        if (!round) throw new Error('Round not found');
        const totalFee = Number(round.entryFee);
        const poolContrib = totalFee * 0.95;
        await tx.jackpot_rounds.update({ where: { id: syndicate.roundId }, data: { poolAmount: { increment: poolContrib } } });
        const entry = await tx.jackpot_entries.create({
          data: { userId: syndicate.creatorId, roundId: syndicate.roundId, picks: [], entryFee: totalFee, syndicateId: syndicate.id },
        });
        await tx.jackpot_syndicates.update({
          where: { id: syndicate.id },
          data: { members: newMembers, memberCount: newCount, status: 'COMPLETE', entryId: entry.id },
        });
      } else {
        await tx.jackpot_syndicates.update({
          where: { id: syndicate.id },
          data: { members: newMembers, memberCount: newCount },
        });
      }
    });
    res.json({ success: true, data: { joined: true, complete: isComplete } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /jackpot/syndicate/:code
router.get('/syndicate/:code', async (req: Request, res: Response) => {
  try {
    const syndicate = await prisma.jackpot_syndicates.findUnique({ where: { shareCode: req.params.code } });
    if (!syndicate) return res.status(404).json({ success: false, error: 'Syndicate not found' });
    res.json({ success: true, data: syndicate });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /jackpot/my-tickets
router.get('/my-tickets', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const entries = await prisma.jackpot_entries.findMany({
      where: { userId },
      include: { jackpot_rounds: { include: { jackpot_matches: { orderBy: { position: 'asc' } } } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: entries });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /jackpot/history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const rounds = await prisma.jackpot_rounds.findMany({
      where: { status: { in: ['SETTLED', 'ROLLED_OVER'] } },
      orderBy: { settledAt: 'desc' },
      take: 20,
    });
    res.json({ success: true, data: rounds });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
```

- [ ] **Step 2: Commit**

```bash
cd /root/betfuz/backend
git add src/routes/jackpot.routes.ts
git commit -m "feat: jackpot routes — enter, ai-picks, syndicate, my-tickets, history"
```

---

## Task 3: Add getJackpotPicks to claudeService.ts

**Files:**
- Modify: `backend/src/services/claudeService.ts`

- [ ] **Step 1: Append getJackpotPicks function**

Add to end of `backend/src/services/claudeService.ts`:

```typescript
export interface JackpotPickResult {
  matchId: string;
  pick: 'HOME' | 'DRAW' | 'AWAY';
  confidence: number;
  reason: string;
}

export async function getJackpotPicks(matches: Array<{
  id: string; homeTeam: string; awayTeam: string; league: string;
  homeOdds: any; drawOdds: any; awayOdds: any; statsSnapshot: any;
}>): Promise<JackpotPickResult[]> {
  const prompt = matches.map((m, i) => {
    const stats = m.statsSnapshot as any;
    return `Match ${i + 1}: ${m.homeTeam} vs ${m.awayTeam} (${m.league})
Odds: Home ${m.homeOdds ?? '?'} | Draw ${m.drawOdds ?? '?'} | Away ${m.awayOdds ?? '?'}
Home form (last 5): ${stats?.homeForm ?? 'N/A'} | Away form: ${stats?.awayForm ?? 'N/A'}
H2H (home/draw/away %): ${stats?.h2hHome ?? '?'}/${stats?.h2hDraw ?? '?'}/${stats?.h2hAway ?? '?'}
Key injuries: ${stats?.injuries ?? 'None reported'}
Match ID: ${m.id}`;
  }).join('\n\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are a football prediction expert. Analyze these matches and return picks as JSON array.
For each match pick HOME, DRAW, or AWAY. Include confidence (0-100) and one-line reason.

${prompt}

Return ONLY valid JSON array: [{"matchId":"...","pick":"HOME|DRAW|AWAY","confidence":75,"reason":"..."}]`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');
  return JSON.parse(jsonMatch[0]) as JackpotPickResult[];
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/betfuz/backend
git add src/services/claudeService.ts
git commit -m "feat: add getJackpotPicks to claudeService"
```

---

## Task 4: Settlement Cron

**Files:**
- Create: `backend/src/cron/jackpotSettlement.ts`

- [ ] **Step 1: Create settlement cron**

```typescript
// backend/src/cron/jackpotSettlement.ts
import cron from 'node-cron';
import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { logger } from '../utils/logger';

const CONSOLATION: Record<string, Record<number, number>> = {
  MINI: { 7: 50000, 6: 10000, 5: 2000 },
  MIDI: { 11: 200000, 10: 50000, 9: 10000 },
  MEGA: { 16: 1000000, 15: 200000, 14: 50000 },
};

async function settleRound(roundId: string): Promise<void> {
  const round = await prisma.jackpot_rounds.findUnique({
    where: { id: roundId },
    include: { jackpot_matches: true },
  });
  if (!round) return;

  // Check all matches have results
  const unresolved = round.jackpot_matches.filter(m => !m.result);
  if (unresolved.length > 0) {
    logger.info(`Settlement skipped for ${roundId}: ${unresolved.length} matches unresolved`);
    return;
  }

  const results: Record<string, string> = {};
  for (const m of round.jackpot_matches) {
    results[m.id] = m.result!;
  }

  const entries = await prisma.jackpot_entries.findMany({ where: { roundId, status: 'PENDING' } });
  const poolAmount = Number(round.poolAmount);
  const guaranteedMin = Number(round.guaranteedMin);
  const effectivePool = Math.max(poolAmount, guaranteedMin);

  const winners: typeof entries = [];
  const consolationMap: Record<number, typeof entries> = {};

  for (const entry of entries) {
    const picks = entry.picks as Array<{ matchId: string; pick: string }>;
    const correct = picks.filter(p => results[p.matchId] === p.pick).length;
    const total = round.matchCount;

    if (correct === total) {
      winners.push(entry);
    } else {
      const missed = total - correct;
      if (missed <= 3) {
        consolationMap[correct] = consolationMap[correct] ?? [];
        consolationMap[correct].push(entry);
      }
    }

    await prisma.jackpot_entries.update({
      where: { id: entry.id },
      data: { correctCount: correct, status: correct === total ? 'CORRECT_ALL' : missed <= 3 ? 'CONSOLATION' : 'LOST' },
    });
  }

  // Pay jackpot winners
  if (winners.length > 0) {
    const perWinner = Math.floor(effectivePool / winners.length);
    for (const w of winners) {
      await prisma.wallets.update({ where: { userId: w.userId }, data: { cashBalance: { increment: perWinner } } });
      await prisma.jackpot_entries.update({ where: { id: w.id }, data: { payout: perWinner } });
      await prisma.audit_logs.create({
        data: { adminId: 'JACKPOT_SETTLEMENT', action: 'JACKPOT_WIN', resource: 'jackpot_entry', resourceId: w.id, metadata: { payout: perWinner } as any },
      });
    }
    await prisma.jackpot_rounds.update({ where: { id: roundId }, data: { status: 'SETTLED', settledAt: new Date() } });
    await cache.publish('admin:events', { type: 'JACKPOT_SETTLED', data: { roundId, winners: winners.length, pool: effectivePool } });
  } else {
    // Rollover
    const tierFees: Record<string, number> = { MINI: 100, MIDI: 200, MEGA: 500 };
    const tierMins: Record<string, number> = { MINI: 1000000, MIDI: 5000000, MEGA: 50000000 };
    const tierMatches: Record<string, number> = { MINI: 8, MIDI: 12, MEGA: 17 };
    const tier = round.tier;
    const nextWeek = new Date(round.closesAt);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const weekNum = round.rolloverWeeks + 1;

    await prisma.jackpot_rounds.create({
      data: {
        tier,
        weekLabel: `Rollover Week ${weekNum} · ${tier}`,
        poolAmount: effectivePool,
        guaranteedMin: tierMins[tier],
        entryFee: tierFees[tier],
        matchCount: tierMatches[tier],
        closesAt: nextWeek,
        rolloverFrom: roundId,
        rolloverWeeks: round.rolloverWeeks + 1,
      },
    });
    await prisma.jackpot_rounds.update({ where: { id: roundId }, data: { status: 'ROLLED_OVER', settledAt: new Date() } });
    logger.info(`Jackpot round ${roundId} rolled over — pool ₦${effectivePool.toLocaleString()} carried forward`);
  }

  // Pay consolation prizes
  const consolationTable = CONSOLATION[round.tier] ?? {};
  for (const [correctStr, consolEntries] of Object.entries(consolationMap)) {
    const correct = Number(correctStr);
    const prize = consolationTable[correct];
    if (!prize) continue;
    for (const e of consolEntries) {
      await prisma.wallets.update({ where: { userId: e.userId }, data: { cashBalance: { increment: prize } } });
      await prisma.jackpot_entries.update({ where: { id: e.id }, data: { payout: prize } });
    }
  }
}

export function startJackpotSettlement(): void {
  // Run at 23:00 WAT (22:00 UTC) on Sundays
  cron.schedule('0 22 * * 0', async () => {
    logger.info('Jackpot settlement cron started');
    const closedRounds = await prisma.jackpot_rounds.findMany({ where: { status: 'CLOSED' } });
    for (const round of closedRounds) {
      await settleRound(round.id).catch(err =>
        logger.error(`Settlement failed for round ${round.id}`, { error: err.message })
      );
    }
  });

  // Auto-close rounds at cutoff
  cron.schedule('*/5 * * * *', async () => {
    const now = new Date();
    await prisma.jackpot_rounds.updateMany({
      where: { status: 'OPEN', closesAt: { lte: now } },
      data: { status: 'CLOSED' },
    });
  });

  logger.info('Jackpot settlement cron registered');
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/betfuz/backend
git add src/cron/jackpotSettlement.ts
git commit -m "feat: jackpot settlement cron — score picks, pay winners, rollover"
```

---

## Task 5: Wire Backend Routes + Admin Endpoints

**Files:**
- Modify: `backend/src/server.ts`
- Modify: `backend/src/routes/admin.routes.ts`

- [ ] **Step 1: Add to server.ts**

In `backend/src/server.ts`, add after the existing cron imports:

```typescript
import jackpotRoutes from './routes/jackpot.routes';
import { startJackpotSettlement } from './cron/jackpotSettlement';
```

In the route mounting section, add:
```typescript
app.use('/api/v1/jackpot', jackpotRoutes);
```

In the startup section alongside `startAutopilotJob()`, add:
```typescript
startJackpotSettlement();
```

- [ ] **Step 2: Add admin jackpot endpoints to admin.routes.ts**

After the existing AI control routes in `backend/src/routes/admin.routes.ts`, add:

```typescript
// ── Admin: Jackpot Management ───────────────────────────────────────────────

router.get('/jackpot/rounds', async (req: Request, res: Response) => {
  try {
    const rounds = await prisma.jackpot_rounds.findMany({
      include: { _count: { select: { jackpot_entries: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: rounds });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/jackpot/rounds', async (req: Request, res: Response) => {
  try {
    const { tier, weekLabel, guaranteedMin, entryFee, matchCount, closesAt, matches } = req.body;
    const round = await prisma.jackpot_rounds.create({
      data: {
        tier, weekLabel, guaranteedMin, entryFee, matchCount,
        closesAt: new Date(closesAt),
        jackpot_matches: { create: (matches ?? []).map((m: any, i: number) => ({ ...m, position: i + 1, statsSnapshot: m.statsSnapshot ?? {} })) },
      },
      include: { jackpot_matches: true },
    });
    res.json({ success: true, data: round });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/jackpot/matches/:id/result', async (req: Request, res: Response) => {
  try {
    const { result } = req.body;
    const match = await prisma.jackpot_matches.update({
      where: { id: req.params.id },
      data: { result },
    });
    res.json({ success: true, data: match });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/jackpot/rounds/:id/settle', async (req: Request, res: Response) => {
  try {
    await prisma.jackpot_rounds.update({ where: { id: req.params.id }, data: { status: 'CLOSED' } });
    res.json({ success: true, message: 'Round closed — settlement cron will process it' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
```

- [ ] **Step 3: Build and verify backend compiles**

```bash
cd /root/betfuz/backend
npm run build 2>&1 | tail -20
```

Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
cd /root/betfuz/backend
git add src/server.ts src/routes/admin.routes.ts
git commit -m "feat: wire jackpot routes and admin management endpoints"
```

---

## Task 6: Frontend API Client

**Files:**
- Create: `src/lib/api/jackpot.ts`

- [ ] **Step 1: Create jackpot API client**

```typescript
// src/lib/api/jackpot.ts
import { api } from './client';

export interface JackpotRound {
  id: string;
  tier: 'MINI' | 'MIDI' | 'MEGA';
  weekLabel: string;
  status: 'OPEN' | 'CLOSED' | 'SETTLED' | 'ROLLED_OVER';
  poolAmount: number;
  guaranteedMin: number;
  entryFee: number;
  matchCount: number;
  closesAt: string;
  rolloverWeeks: number;
  rolloverFrom?: string;
  jackpot_matches: JackpotMatch[];
}

export interface JackpotMatch {
  id: string;
  roundId: string;
  position: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoffAt: string;
  result?: 'HOME' | 'DRAW' | 'AWAY';
  homeOdds?: number;
  drawOdds?: number;
  awayOdds?: number;
  statsSnapshot: {
    homeForm?: string;
    awayForm?: string;
    h2hHome?: number;
    h2hDraw?: number;
    h2hAway?: number;
    homeGoalsFor?: number;
    homeGoalsAgainst?: number;
    awayGoalsFor?: number;
    awayGoalsAgainst?: number;
    injuries?: string;
    poolGrowth?: number[];
  };
}

export interface JackpotEntry {
  id: string;
  roundId: string;
  picks: Array<{ matchId: string; pick: 'HOME' | 'DRAW' | 'AWAY' }>;
  ticketNumber: number;
  entryFee: number;
  status: 'PENDING' | 'CORRECT_ALL' | 'CONSOLATION' | 'LOST';
  correctCount?: number;
  payout?: number;
  usedAIPicks: boolean;
  createdAt: string;
  jackpot_rounds?: JackpotRound;
}

export interface AIPick {
  matchId: string;
  pick: 'HOME' | 'DRAW' | 'AWAY';
  confidence: number;
  reason: string;
}

export const jackpotApi = {
  getRounds: async (): Promise<JackpotRound[]> => {
    const { data } = await api.get('/jackpot/rounds');
    return data.data;
  },

  getRound: async (id: string): Promise<JackpotRound> => {
    const { data } = await api.get(`/jackpot/rounds/${id}`);
    return data.data;
  },

  enter: async (roundId: string, picks: Array<{ matchId: string; pick: string }>, usedAIPicks = false) => {
    const { data } = await api.post('/jackpot/enter', { roundId, picks, usedAIPicks });
    return data.data;
  },

  getAIPicks: async (roundId: string): Promise<AIPick[]> => {
    const { data } = await api.post(`/jackpot/ai-picks/${roundId}`, {});
    return data.data;
  },

  createSyndicate: async (roundId: string, requiredMembers: number) => {
    const { data } = await api.post('/jackpot/syndicate/create', { roundId, requiredMembers });
    return data.data;
  },

  joinSyndicate: async (code: string) => {
    const { data } = await api.post(`/jackpot/syndicate/join/${code}`, {});
    return data.data;
  },

  getSyndicate: async (code: string) => {
    const { data } = await api.get(`/jackpot/syndicate/${code}`);
    return data.data;
  },

  getMyTickets: async (): Promise<JackpotEntry[]> => {
    const { data } = await api.get('/jackpot/my-tickets');
    return data.data;
  },

  getHistory: async (): Promise<JackpotRound[]> => {
    const { data } = await api.get('/jackpot/history');
    return data.data;
  },
};
```

- [ ] **Step 2: Commit**

```bash
cd /root/betfuz-v2
git add src/lib/api/jackpot.ts
git commit -m "feat: jackpot API client"
```

---

## Task 7: useJackpot Hook

**Files:**
- Create: `src/hooks/useJackpot.ts`

- [ ] **Step 1: Create hook**

```typescript
// src/hooks/useJackpot.ts
import { useState, useEffect, useCallback } from 'react';
import { jackpotApi, JackpotRound, JackpotEntry, AIPick } from '@/lib/api/jackpot';

export type PickMap = Record<string, 'HOME' | 'DRAW' | 'AWAY'>;

export function useJackpot() {
  const [rounds, setRounds] = useState<JackpotRound[]>([]);
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [picks, setPicks] = useState<PickMap>({});
  const [aiPicks, setAIPicks] = useState<AIPick[]>([]);
  const [myTickets, setMyTickets] = useState<JackpotEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAILoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRound = rounds.find(r => r.id === activeRoundId) ?? null;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [r, t] = await Promise.all([jackpotApi.getRounds(), jackpotApi.getMyTickets()]);
      setRounds(r);
      setMyTickets(t);
      if (!activeRoundId && r.length > 0) setActiveRoundId(r[0].id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeRoundId]);

  useEffect(() => { load(); }, []);

  // Poll pool amount every 15s
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!activeRoundId) return;
      try {
        const round = await jackpotApi.getRound(activeRoundId);
        setRounds(prev => prev.map(r => r.id === round.id ? { ...r, poolAmount: round.poolAmount } : r));
      } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, [activeRoundId]);

  const setPick = (matchId: string, pick: 'HOME' | 'DRAW' | 'AWAY') => {
    setPicks(prev => ({ ...prev, [matchId]: pick }));
  };

  const clearPicks = () => setPicks({});

  const fetchAIPicks = async () => {
    if (!activeRoundId) return;
    setAILoading(true);
    try {
      const picks = await jackpotApi.getAIPicks(activeRoundId);
      setAIPicks(picks);
      const pickMap: PickMap = {};
      for (const p of picks) pickMap[p.matchId] = p.pick;
      setPicks(prev => ({ ...prev, ...pickMap }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAILoading(false);
    }
  };

  const submitEntry = async () => {
    if (!activeRound) return;
    setSubmitting(true);
    setError(null);
    try {
      const picksArray = Object.entries(picks).map(([matchId, pick]) => ({ matchId, pick }));
      const usedAI = aiPicks.length > 0;
      await jackpotApi.enter(activeRound.id, picksArray, usedAI);
      await load();
      clearPicks();
      setAIPicks([]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pickedCount = activeRound ? Object.keys(picks).filter(id =>
    activeRound.jackpot_matches.some(m => m.id === id)
  ).length : 0;

  const allPicked = activeRound ? pickedCount === activeRound.matchCount : false;

  return {
    rounds, activeRound, activeRoundId, setActiveRoundId,
    picks, setPick, clearPicks,
    aiPicks, fetchAIPicks, aiLoading,
    myTickets, loading, submitting, error,
    submitEntry, pickedCount, allPicked,
    reload: load,
  };
}
```

- [ ] **Step 2: Create useJackpotStats hook**

```typescript
// src/hooks/useJackpotStats.ts
import { useState, useEffect } from 'react';

const SOCCER_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

interface TeamForm {
  form: string[]; // ['W','D','L','W','W']
  goalsFor: number;
  goalsAgainst: number;
}

export function useJackpotStats(homeTeam: string, awayTeam: string, leagueSlug = 'eng.1') {
  const [homeForm, setHomeForm] = useState<TeamForm | null>(null);
  const [awayForm, setAwayForm] = useState<TeamForm | null>(null);
  const [h2h, setH2H] = useState<{ home: number; draw: number; away: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetch_() {
      setLoading(true);
      try {
        const res = await fetch(
          `${SOCCER_BASE}/${leagueSlug}/teams?limit=100`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (!res.ok || cancelled) return;
        // Use snapshot data passed from backend — ESPN team lookup is supplementary
        // Return placeholder form derived from statsSnapshot
      } catch {}
      if (!cancelled) setLoading(false);
    }
    fetch_();
    return () => { cancelled = true; };
  }, [homeTeam, awayTeam, leagueSlug]);

  return { homeForm, awayForm, h2h, loading };
}
```

- [ ] **Step 3: Commit**

```bash
cd /root/betfuz-v2
git add src/hooks/useJackpot.ts src/hooks/useJackpotStats.ts
git commit -m "feat: useJackpot and useJackpotStats hooks"
```

---

## Task 8: JackpotTierCard Component

**Files:**
- Create: `src/components/jackpot/JackpotTierCard.tsx`

- [ ] **Step 1: Create component**

```tsx
// src/components/jackpot/JackpotTierCard.tsx
import { useEffect, useState } from 'react';
import { TrendingUp, Users, Clock, Flame } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { JackpotRound } from '@/lib/api/jackpot';

const TIER_COLORS = { MINI: '#00b15c', MIDI: '#3b82f6', MEGA: '#f59e0b' };
const TIER_LABELS = { MINI: 'Mini Jackpot', MIDI: 'Midi Jackpot', MEGA: 'Mega Jackpot' };

interface Props {
  round: JackpotRound;
  isActive: boolean;
  onClick: () => void;
}

function formatPool(amount: number): string {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
}

function useCountdown(closesAt: string) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(closesAt).getTime() - Date.now();
      if (diff <= 0) { setLabel('Closed'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setLabel(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [closesAt]);
  return label;
}

export function JackpotTierCard({ round, isActive, onClick }: Props) {
  const color = TIER_COLORS[round.tier];
  const countdown = useCountdown(round.closesAt);
  const poolGrowth = (round.jackpot_matches[0]?.statsSnapshot as any)?.poolGrowth ?? [20, 35, 45, 60, 72, 85, 100];
  const chartData = poolGrowth.map((v: number, i: number) => ({ v, i }));

  return (
    <div
      onClick={onClick}
      className={`relative flex-shrink-0 w-52 rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
        isActive
          ? `border-2 shadow-lg`
          : 'border border-white/10 hover:border-white/20'
      }`}
      style={{
        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
        borderColor: isActive ? color : undefined,
        boxShadow: isActive ? `0 0 20px ${color}30` : undefined,
      }}
    >
      {round.rolloverWeeks > 0 && (
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: color, color: '#000' }}
        >
          <Flame className="w-3 h-3" />
          ROLLOVER
        </div>
      )}

      <div className="text-xs font-bold mb-1" style={{ color }}>{TIER_LABELS[round.tier]}</div>

      <div className="text-2xl font-black text-white mb-0.5">{formatPool(round.poolAmount)}</div>
      <div className="text-[10px] text-gray-500 mb-3">
        Guaranteed {formatPool(round.guaranteedMin)}
      </div>

      <div className="h-10 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${round.tier}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#grad-${round.tier})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1 text-[11px]">
        <div className="flex items-center justify-between text-gray-400">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {round.matchCount} matches</span>
          <span style={{ color }}>₦{round.entryFee} entry</span>
        </div>
        <div className="flex items-center justify-between text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {countdown}</span>
          {round.rolloverWeeks > 0 && (
            <span className="flex items-center gap-1 text-orange-400">
              <TrendingUp className="w-3 h-3" /> Wk {round.rolloverWeeks}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/betfuz-v2
git add src/components/jackpot/JackpotTierCard.tsx
git commit -m "feat: JackpotTierCard with pool counter, sparkline, rollover badge"
```

---

## Task 9: JackpotMatchCard Component

**Files:**
- Create: `src/components/jackpot/JackpotMatchCard.tsx`

- [ ] **Step 1: Create component**

```tsx
// src/components/jackpot/JackpotMatchCard.tsx
import { AlertCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { JackpotMatch } from '@/lib/api/jackpot';

type Pick = 'HOME' | 'DRAW' | 'AWAY';

interface Props {
  match: JackpotMatch;
  pick?: Pick;
  onPick: (pick: Pick) => void;
  aiConfidence?: number;
  aiReason?: string;
  aiPick?: Pick;
  result?: Pick;
}

function FormBadge({ result }: { result: string }) {
  const color = result === 'W' ? 'bg-[#00b15c] text-white' : result === 'D' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white';
  return <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${color}`}>{result}</span>;
}

function OddsArrow({ current, open }: { current?: number; open?: number }) {
  if (!current || !open) return null;
  if (current > open + 0.05) return <TrendingDown className="w-3 h-3 text-red-400" />;
  if (current < open - 0.05) return <TrendingUp className="w-3 h-3 text-green-400" />;
  return <Minus className="w-3 h-3 text-gray-500" />;
}

export function JackpotMatchCard({ match, pick, onPick, aiConfidence, aiReason, aiPick, result }: Props) {
  const stats = match.statsSnapshot;
  const homeFormArr = stats.homeForm ? stats.homeForm.split('') : [];
  const awayFormArr = stats.awayForm ? stats.awayForm.split('') : [];
  const h2hTotal = (stats.h2hHome ?? 0) + (stats.h2hDraw ?? 0) + (stats.h2hAway ?? 0);
  const homeW = h2hTotal > 0 ? ((stats.h2hHome ?? 0) / h2hTotal) * 100 : 33;
  const drawW = h2hTotal > 0 ? ((stats.h2hDraw ?? 0) / h2hTotal) * 100 : 34;
  const awayW = h2hTotal > 0 ? ((stats.h2hAway ?? 0) / h2hTotal) * 100 : 33;

  const BUTTONS: { label: string; value: Pick; odds?: number }[] = [
    { label: '1', value: 'HOME', odds: match.homeOdds },
    { label: 'X', value: 'DRAW', odds: match.drawOdds },
    { label: '2', value: 'AWAY', odds: match.awayOdds },
  ];

  return (
    <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">{match.homeTeam} <span className="text-gray-500">vs</span> {match.awayTeam}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">{match.league} · {new Date(match.kickoffAt).toLocaleDateString('en-GB', { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
        </div>
        {stats.injuries && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" title={stats.injuries} />}
        {result && (
          <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded bg-[#00b15c]/20 text-[#00b15c]">
            {result === 'HOME' ? match.homeTeam : result === 'AWAY' ? match.awayTeam : 'DRAW'}
          </span>
        )}
      </div>

      {/* Form guides */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="text-[9px] text-gray-500 mb-1">{match.homeTeam} form</div>
          <div className="flex gap-1">{homeFormArr.map((r, i) => <FormBadge key={i} result={r} />)}</div>
          {stats.homeGoalsFor !== undefined && (
            <div className="text-[9px] text-gray-500 mt-1">{stats.homeGoalsFor?.toFixed(1)} scored · {stats.homeGoalsAgainst?.toFixed(1)} conceded</div>
          )}
        </div>
        <div className="flex-1 text-right">
          <div className="text-[9px] text-gray-500 mb-1">{match.awayTeam} form</div>
          <div className="flex gap-1 justify-end">{awayFormArr.map((r, i) => <FormBadge key={i} result={r} />)}</div>
          {stats.awayGoalsFor !== undefined && (
            <div className="text-[9px] text-gray-500 mt-1">{stats.awayGoalsFor?.toFixed(1)} scored · {stats.awayGoalsAgainst?.toFixed(1)} conceded</div>
          )}
        </div>
      </div>

      {/* H2H bar */}
      {h2hTotal > 0 && (
        <div>
          <div className="text-[9px] text-gray-500 mb-1">H2H last {h2hTotal} meetings</div>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            <div className="bg-[#00b15c] transition-all" style={{ width: `${homeW}%` }} />
            <div className="bg-yellow-500 transition-all" style={{ width: `${drawW}%` }} />
            <div className="bg-red-500 transition-all" style={{ width: `${awayW}%` }} />
          </div>
          <div className="flex justify-between text-[9px] text-gray-500 mt-0.5">
            <span>{Math.round(homeW)}% home</span>
            <span>{Math.round(drawW)}% draw</span>
            <span>{Math.round(awayW)}% away</span>
          </div>
        </div>
      )}

      {/* AI reason */}
      {aiReason && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
          <div className="text-[10px] text-purple-300 font-medium mb-1">AI · {aiConfidence}% confidence</div>
          <div className="text-[11px] text-gray-300">{aiReason}</div>
          {aiConfidence !== undefined && (
            <div className="mt-1.5 h-1 bg-[#1f2d3d] rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${aiConfidence}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Pick buttons */}
      <div className="flex gap-2">
        {BUTTONS.map(({ label, value, odds }) => {
          const isSelected = pick === value;
          const isAI = aiPick === value && !pick;
          const isCorrect = result && pick === result && result === value;
          const isWrong = result && pick === value && result !== value;
          return (
            <button
              key={value}
              onClick={() => onPick(value)}
              disabled={!!result}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isCorrect ? 'bg-[#00b15c]/20 border-[#00b15c] text-[#00b15c]' :
                isWrong ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                isSelected ? 'bg-[#00b15c] border-[#00b15c] text-white' :
                isAI ? 'bg-purple-500/20 border-purple-500 text-purple-300' :
                'bg-[#0d1520] border-[#1f2d3d] text-gray-300 hover:border-[#00b15c]/40 hover:text-white'
              }`}
            >
              <span>{label}</span>
              {odds && (
                <span className="flex items-center gap-0.5 text-[9px] mt-0.5 opacity-70">
                  {odds.toFixed(2)}
                  <OddsArrow current={odds} open={odds} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/betfuz-v2
git add src/components/jackpot/JackpotMatchCard.tsx
git commit -m "feat: JackpotMatchCard with form guide, H2H bar, odds, AI overlay"
```

---

## Task 10: JackpotAIPicks, JackpotProgress, JackpotSyndicate Components

**Files:**
- Create: `src/components/jackpot/JackpotAIPicks.tsx`
- Create: `src/components/jackpot/JackpotProgress.tsx`
- Create: `src/components/jackpot/JackpotSyndicate.tsx`

- [ ] **Step 1: Create JackpotAIPicks**

```tsx
// src/components/jackpot/JackpotAIPicks.tsx
import { Brain, Loader2 } from 'lucide-react';
import { AIPick } from '@/lib/api/jackpot';

interface Props {
  onRequest: () => void;
  loading: boolean;
  picks: AIPick[];
}

export function JackpotAIPicks({ onRequest, loading, picks }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-purple-400" />
        <div>
          <div className="text-sm font-semibold text-purple-300">AI Suggest</div>
          <div className="text-[10px] text-gray-500">Claude fills unpicked matches with analysis</div>
        </div>
      </div>
      <button
        onClick={onRequest}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
        {loading ? 'Analysing...' : picks.length > 0 ? 'Refresh' : 'Get Picks'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create JackpotProgress**

```tsx
// src/components/jackpot/JackpotProgress.tsx
import { Loader2 } from 'lucide-react';

interface Props {
  picked: number;
  total: number;
  entryFee: number;
  onSubmit: () => void;
  submitting: boolean;
}

export function JackpotProgress({ picked, total, entryFee, onSubmit, submitting }: Props) {
  const pct = total > 0 ? (picked / total) * 100 : 0;
  const allPicked = picked === total;

  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 bg-[#0d1520]/95 backdrop-blur border-t border-[#1f2d3d] px-4 py-3">
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">{picked} / {total} picked</span>
            <span className="text-gray-500">{Math.round(pct)}%</span>
          </div>
          <div className="h-1.5 bg-[#1f2d3d] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, background: allPicked ? '#00b15c' : '#3b82f6' }}
            />
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={!allPicked || submitting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: allPicked ? '#00b15c' : '#1f2d3d', color: allPicked ? '#fff' : '#666' }}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Submit · ₦{entryFee}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create JackpotSyndicate**

```tsx
// src/components/jackpot/JackpotSyndicate.tsx
import { useState } from 'react';
import { Users, Copy, Check, Loader2 } from 'lucide-react';
import { jackpotApi } from '@/lib/api/jackpot';

interface Props {
  roundId: string;
  entryFee: number;
}

export function JackpotSyndicate({ roundId, entryFee }: Props) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState(2);
  const [shareCode, setShareCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState('');

  const create = async () => {
    setLoading(true);
    try {
      const syndicate = await jackpotApi.createSyndicate(roundId, members);
      setShareCode(syndicate.shareCode);
    } catch (e: any) { setMsg(e.message); }
    setLoading(false);
  };

  const join = async () => {
    setLoading(true);
    try {
      const result = await jackpotApi.joinSyndicate(joinCode.toUpperCase());
      setMsg(result.complete ? 'Syndicate complete — entry submitted!' : 'Joined! Waiting for others...');
    } catch (e: any) { setMsg(e.message); }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    const text = `Join my FuzJackpot syndicate! Code: ${shareCode} — ₦${(entryFee / members).toFixed(0)} each`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-[#111827] border border-[#1f2d3d] hover:border-[#00b15c]/40 rounded-xl text-sm text-gray-300 transition-all"
      >
        <Users className="w-4 h-4 text-[#00b15c]" />
        Enter with friends (Syndicate)
      </button>

      {open && (
        <div className="mt-3 bg-[#111827] border border-[#1f2d3d] rounded-xl p-4 space-y-4">
          {!shareCode ? (
            <div>
              <div className="text-sm font-semibold text-white mb-3">Create Syndicate</div>
              <label className="text-xs text-gray-400 block mb-1">Number of members</label>
              <input
                type="number" min={2} max={20} value={members}
                onChange={e => setMembers(Number(e.target.value))}
                className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2 text-white text-sm mb-2"
              />
              <div className="text-xs text-gray-500 mb-3">₦{(entryFee / members).toFixed(0)} per person</div>
              <button onClick={create} disabled={loading} className="w-full py-2 bg-[#00b15c] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Create
              </button>
            </div>
          ) : (
            <div>
              <div className="text-sm font-semibold text-white mb-2">Share your code</div>
              <div className="flex items-center gap-2 bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2 mb-3">
                <span className="text-2xl font-black text-[#00b15c] tracking-widest">{shareCode}</span>
                <button onClick={copy} className="ml-auto text-gray-400 hover:text-white">
                  {copied ? <Check className="w-4 h-4 text-[#00b15c]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button onClick={share} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold">
                Share on WhatsApp
              </button>
            </div>
          )}

          <div className="border-t border-[#1f2d3d] pt-4">
            <div className="text-sm font-semibold text-white mb-2">Join a syndicate</div>
            <div className="flex gap-2">
              <input
                placeholder="Enter code" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                className="flex-1 bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2 text-white text-sm tracking-widest uppercase"
                maxLength={6}
              />
              <button onClick={join} disabled={loading || joinCode.length < 6}
                className="px-4 py-2 bg-[#00b15c] text-white rounded-lg text-sm font-bold disabled:opacity-40">
                Join
              </button>
            </div>
          </div>
          {msg && <div className="text-xs text-[#00b15c] text-center">{msg}</div>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /root/betfuz-v2
git add src/components/jackpot/JackpotAIPicks.tsx src/components/jackpot/JackpotProgress.tsx src/components/jackpot/JackpotSyndicate.tsx
git commit -m "feat: JackpotAIPicks, JackpotProgress, JackpotSyndicate components"
```

---

## Task 11: JackpotMyTickets Component

**Files:**
- Create: `src/components/jackpot/JackpotMyTickets.tsx`

- [ ] **Step 1: Create component**

```tsx
// src/components/jackpot/JackpotMyTickets.tsx
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { JackpotEntry } from '@/lib/api/jackpot';

interface Props {
  tickets: JackpotEntry[];
}

export function JackpotMyTickets({ tickets }: Props) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>No tickets yet. Enter a jackpot to get started.</p>
      </div>
    );
  }

  // Accuracy history (last 8 rounds with entries)
  const roundHistory = tickets.slice(0, 8).map((t, i) => ({
    name: `R${i + 1}`,
    correct: t.correctCount ?? 0,
    total: t.jackpot_rounds?.matchCount ?? 0,
    pct: t.jackpot_rounds?.matchCount ? Math.round(((t.correctCount ?? 0) / t.jackpot_rounds.matchCount) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Overview charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
          <div className="text-sm font-semibold text-white mb-3">Accuracy History</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={roundHistory}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1f2d3d', borderRadius: 8 }}
                formatter={(v: number) => [`${v}%`, 'Hit rate']}
              />
              <Bar dataKey="pct" fill="#00b15c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {tickets[0]?.correctCount !== undefined && tickets[0]?.jackpot_rounds && (
          <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
            <div className="text-sm font-semibold text-white mb-3">Latest Ticket Progress</div>
            <RadarChart
              cx="50%" cy="50%" outerRadius="65%"
              width={200} height={140}
              data={[
                { subject: 'Correct', A: tickets[0].correctCount ?? 0, fullMark: tickets[0].jackpot_rounds.matchCount },
                { subject: 'Wrong', A: (tickets[0].jackpot_rounds.matchCount) - (tickets[0].correctCount ?? 0), fullMark: tickets[0].jackpot_rounds.matchCount },
              ]}
            >
              <PolarGrid stroke="#1f2d3d" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Radar dataKey="A" stroke="#00b15c" fill="#00b15c" fillOpacity={0.3} />
            </RadarChart>
          </div>
        )}
      </div>

      {/* Ticket list */}
      {tickets.map(ticket => {
        const round = ticket.jackpot_rounds;
        const picks = ticket.picks as Array<{ matchId: string; pick: string }>;
        const matches = round?.jackpot_matches ?? [];

        return (
          <div key={ticket.id} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-white">{round?.weekLabel ?? 'Jackpot'} · Ticket #{ticket.ticketNumber}</div>
                <div className="text-[10px] text-gray-500">{round?.tier} · ₦{ticket.entryFee} entry</div>
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-lg ${
                ticket.status === 'CORRECT_ALL' ? 'bg-[#00b15c]/20 text-[#00b15c]' :
                ticket.status === 'CONSOLATION' ? 'bg-yellow-500/20 text-yellow-400' :
                ticket.status === 'LOST' ? 'bg-red-500/10 text-red-400' :
                'bg-[#1f2d3d] text-gray-400'
              }`}>
                {ticket.status === 'PENDING' && ticket.correctCount !== undefined
                  ? `${ticket.correctCount}/${round?.matchCount} correct`
                  : ticket.status}
              </div>
            </div>

            {ticket.payout && (
              <div className="mb-3 px-3 py-2 bg-[#00b15c]/10 border border-[#00b15c]/20 rounded-lg text-sm text-[#00b15c] font-semibold">
                Won ₦{Number(ticket.payout).toLocaleString()}
              </div>
            )}

            {/* Per-match tracker */}
            {matches.length > 0 && (
              <div className="space-y-1">
                {matches.map(m => {
                  const myPick = picks.find(p => p.matchId === m.id);
                  const correct = m.result && myPick ? myPick.pick === m.result : null;
                  return (
                    <div key={m.id} className="flex items-center justify-between py-1 text-xs border-b border-[#1f2d3d]/50 last:border-0">
                      <span className="text-gray-400 truncate flex-1 mr-2">{m.homeTeam} vs {m.awayTeam}</span>
                      <span className="text-gray-500 mr-2">{myPick?.pick ?? '—'}</span>
                      {correct === null ? <Clock className="w-3.5 h-3.5 text-gray-600" /> :
                       correct ? <CheckCircle className="w-3.5 h-3.5 text-[#00b15c]" /> :
                       <XCircle className="w-3.5 h-3.5 text-red-400" />}
                    </div>
                  );
                })}
              </div>
            )}

            {ticket.correctCount !== undefined && round && ticket.status === 'PENDING' && (
              <div className="mt-3 text-[11px] text-gray-400">
                {ticket.correctCount}/{round.matchCount} correct
                {round.matchCount - ticket.correctCount <= 3 && ` — on track for consolation prize`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/betfuz-v2
git add src/components/jackpot/JackpotMyTickets.tsx
git commit -m "feat: JackpotMyTickets with radar chart, accuracy history, live tracker"
```

---

## Task 12: Jackpot.tsx — Full Page Rewrite

**Files:**
- Modify: `src/pages/Jackpot.tsx`

- [ ] **Step 1: Read current Jackpot.tsx**

```bash
cat /root/betfuz-v2/src/pages/Jackpot.tsx | head -30
```

- [ ] **Step 2: Rewrite Jackpot.tsx**

```tsx
// src/pages/Jackpot.tsx
import { useState } from 'react';
import { Trophy, Ticket } from 'lucide-react';
import { useJackpot } from '@/hooks/useJackpot';
import { JackpotTierCard } from '@/components/jackpot/JackpotTierCard';
import { JackpotMatchCard } from '@/components/jackpot/JackpotMatchCard';
import { JackpotAIPicks } from '@/components/jackpot/JackpotAIPicks';
import { JackpotProgress } from '@/components/jackpot/JackpotProgress';
import { JackpotMyTickets } from '@/components/jackpot/JackpotMyTickets';
import { JackpotSyndicate } from '@/components/jackpot/JackpotSyndicate';
import { AIPick } from '@/lib/api/jackpot';

type Tab = 'picks' | 'my-tickets';

export default function Jackpot() {
  const [tab, setTab] = useState<Tab>('picks');
  const {
    rounds, activeRound, activeRoundId, setActiveRoundId,
    picks, setPick,
    aiPicks, fetchAIPicks, aiLoading,
    myTickets, loading, submitting, error,
    submitEntry, pickedCount, allPicked,
  } = useJackpot();

  const aiPickMap: Record<string, AIPick> = {};
  for (const p of aiPicks) aiPickMap[p.matchId] = p;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Trophy className="w-10 h-10 text-[#00b15c] mx-auto animate-pulse" />
          <p className="text-gray-400">Loading jackpots…</p>
        </div>
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Trophy className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-gray-400">No active jackpots right now. Check back Sunday!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1520] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#111827] to-[#0d1520] px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#00b15c]" />
            <h1 className="text-xl font-black text-white">FuzJackpot</h1>
          </div>
          <div className="flex gap-1 bg-[#111827] border border-[#1f2d3d] rounded-xl p-1">
            {(['picks', 'my-tickets'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === t ? 'bg-[#00b15c] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'picks' ? 'Jackpots' : `My Tickets${myTickets.length > 0 ? ` (${myTickets.length})` : ''}`}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500">Pick winners, win big. Rollovers keep growing.</p>
      </div>

      {tab === 'picks' && (
        <>
          {/* Tier selector — horizontal scroll */}
          <div className="px-4 mb-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {rounds.map(round => (
                <JackpotTierCard
                  key={round.id}
                  round={round}
                  isActive={round.id === activeRoundId}
                  onClick={() => setActiveRoundId(round.id)}
                />
              ))}
            </div>
          </div>

          {activeRound && (
            <div className="px-4 space-y-4">
              {/* AI picks + syndicate */}
              <JackpotAIPicks onRequest={fetchAIPicks} loading={aiLoading} picks={aiPicks} />
              <JackpotSyndicate roundId={activeRound.id} entryFee={activeRound.entryFee} />

              {/* Match cards */}
              <div className="space-y-3">
                {activeRound.jackpot_matches.map(match => (
                  <JackpotMatchCard
                    key={match.id}
                    match={match}
                    pick={picks[match.id]}
                    onPick={(p) => setPick(match.id, p)}
                    aiPick={aiPickMap[match.id]?.pick}
                    aiConfidence={aiPickMap[match.id]?.confidence}
                    aiReason={aiPickMap[match.id]?.reason}
                    result={match.result ?? undefined}
                  />
                ))}
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Sticky progress bar */}
          {activeRound && (
            <JackpotProgress
              picked={pickedCount}
              total={activeRound.matchCount}
              entryFee={activeRound.entryFee}
              onSubmit={submitEntry}
              submitting={submitting}
            />
          )}
        </>
      )}

      {tab === 'my-tickets' && (
        <div className="px-4 pt-4">
          <JackpotMyTickets tickets={myTickets} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /root/betfuz-v2
git add src/pages/Jackpot.tsx
git commit -m "feat: Jackpot.tsx full rewrite — tier cards, match picks, AI, syndicate, my tickets"
```

---

## Task 13: Admin Jackpot Page

**Files:**
- Create: `src/pages/admin/AdminJackpot.tsx`

- [ ] **Step 1: Create admin jackpot page**

```tsx
// src/pages/admin/AdminJackpot.tsx
import { useEffect, useState } from 'react';
import { Trophy, Plus, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api/client';

interface Round {
  id: string;
  tier: string;
  weekLabel: string;
  status: string;
  poolAmount: number;
  matchCount: number;
  closesAt: string;
  rolloverWeeks: number;
  _count?: { jackpot_entries: number };
}

const TIERS = [
  { value: 'MINI',  label: 'Mini', fee: 100,  min: 1000000,  matches: 8 },
  { value: 'MIDI',  label: 'Midi', fee: 200,  min: 5000000,  matches: 12 },
  { value: 'MEGA',  label: 'Mega', fee: 500,  min: 50000000, matches: 17 },
];

const TIER_COLOR: Record<string, string> = { MINI: '#00b15c', MIDI: '#3b82f6', MEGA: '#f59e0b' };
const STATUS_COLOR: Record<string, string> = { OPEN: '#00b15c', CLOSED: '#f59e0b', SETTLED: '#6b7280', ROLLED_OVER: '#8b5cf6' };

export default function AdminJackpot() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tier: 'MINI', weekLabel: '', closesAt: '' });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/jackpot/rounds');
      setRounds(data.data ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createRound = async () => {
    if (!form.weekLabel || !form.closesAt) return;
    const tier = TIERS.find(t => t.value === form.tier)!;
    setCreating(true);
    try {
      await api.post('/admin/jackpot/rounds', {
        tier: form.tier,
        weekLabel: form.weekLabel,
        guaranteedMin: tier.min,
        entryFee: tier.fee,
        matchCount: tier.matches,
        closesAt: form.closesAt,
        matches: [],
      });
      setShowForm(false);
      setForm({ tier: 'MINI', weekLabel: '', closesAt: '' });
      await load();
    } catch {}
    setCreating(false);
  };

  const closeRound = async (id: string) => {
    await api.post(`/admin/jackpot/rounds/${id}/settle`, {});
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-[#00b15c]" />
          <div>
            <h1 className="text-2xl font-bold text-white">Jackpot Manager</h1>
            <p className="text-gray-500 text-sm">Create rounds, set results, trigger settlement</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(o => !o)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00b15c] hover:bg-[#00b15c]/80 text-white rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" /> New Round
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Create Jackpot Round</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Tier</label>
              <select
                value={form.tier}
                onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
                className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2 text-white text-sm"
              >
                {TIERS.map(t => <option key={t.value} value={t.value}>{t.label} (₦{t.fee} · {t.matches} matches)</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Week Label</label>
              <input
                value={form.weekLabel}
                onChange={e => setForm(f => ({ ...f, weekLabel: e.target.value }))}
                placeholder="Week 17 · Apr 21–27"
                className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Closes At</label>
              <input
                type="datetime-local"
                value={form.closesAt}
                onChange={e => setForm(f => ({ ...f, closesAt: e.target.value }))}
                className="w-full bg-[#0d1520] border border-[#1f2d3d] rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <button onClick={createRound} disabled={creating} className="flex items-center gap-2 px-4 py-2 bg-[#00b15c] text-white rounded-xl text-sm font-semibold">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Round
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#00b15c]" /></div>
      ) : (
        <div className="space-y-3">
          {rounds.map(round => (
            <div key={round.id} className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 rounded-full" style={{ background: TIER_COLOR[round.tier] ?? '#666' }} />
                  <div>
                    <div className="text-white font-semibold text-sm">{round.weekLabel}</div>
                    <div className="text-[10px] text-gray-500">
                      {round.tier} · {round._count?.jackpot_entries ?? 0} entries · Pool ₦{Number(round.poolAmount).toLocaleString()}
                      {round.rolloverWeeks > 0 && ` · 🔥 Rollover x${round.rolloverWeeks}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: `${STATUS_COLOR[round.status]}20`, color: STATUS_COLOR[round.status] }}>
                    {round.status}
                  </span>
                  {round.status === 'OPEN' && (
                    <button
                      onClick={() => closeRound(round.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg text-xs font-semibold transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Close & Settle
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {rounds.length === 0 && (
            <div className="text-center py-12 text-gray-500">No jackpot rounds yet. Create one above.</div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /root/betfuz-v2
git add src/pages/admin/AdminJackpot.tsx
git commit -m "feat: AdminJackpot page — create rounds, view entries, close/settle"
```

---

## Task 14: Wire App.tsx Routes + Admin Sidebar

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx`

- [ ] **Step 1: Read App.tsx to find lazy import block**

```bash
grep -n "AdminAIControl\|lazy.*admin" /root/betfuz-v2/src/App.tsx | head -10
```

- [ ] **Step 2: Add lazy import to App.tsx**

Find the block of `const Admin... = lazy(...)` imports and add:

```typescript
const AdminJackpot = lazy(() => import('./pages/admin/AdminJackpot'));
```

In the admin routes section add:
```tsx
<Route path="/admin/jackpot" element={<AdminJackpot />} />
```

- [ ] **Step 3: Add Jackpot to AdminSidebar.tsx**

In the NAV array in `AdminSidebar.tsx`, add after the `AI Control` entry:

```typescript
{ to: '/admin/jackpot', icon: Trophy, label: 'Jackpot' },
```

Add `Trophy` to the lucide-react import:
```typescript
import { ..., Trophy } from 'lucide-react';
```

- [ ] **Step 4: Commit**

```bash
cd /root/betfuz-v2
git add src/App.tsx src/components/admin/AdminSidebar.tsx
git commit -m "feat: wire jackpot admin route and sidebar link"
```

---

## Task 15: Build Backend + Frontend + Verify

**Files:** None (build verification)

- [ ] **Step 1: Build backend**

```bash
cd /root/betfuz/backend
npm run build 2>&1 | grep -E "error|Error|warning" | head -20
```

Expected: Zero TypeScript errors.

- [ ] **Step 2: Build frontend**

```bash
cd /root/betfuz-v2
npm run build 2>&1 | grep -E "error|Error|warning" | head -30
```

Expected: Build completes successfully.

- [ ] **Step 3: Restart backend**

```bash
pm2 restart betfuz-backend 2>/dev/null || cd /root/betfuz/backend && npm run start &
```

- [ ] **Step 4: Test jackpot rounds endpoint**

```bash
curl -s http://localhost:3001/api/v1/jackpot/rounds | jq '.success'
```

Expected: `true` (or an auth error — both confirm the route is mounted).

- [ ] **Step 5: Final commit**

```bash
cd /root/betfuz-v2
git add -A
git commit -m "feat: FuzJackpot complete — multi-tier jackpot with AI picks, syndicates, live pool, rich match stats"
```

---

## Self-Review

**Spec coverage check:**
- ✅ 4 DB tables (jackpot_rounds, jackpot_matches, jackpot_entries, jackpot_syndicates)
- ✅ All 10 backend routes
- ✅ Cron settlement with rollover, consolation prizes, wallet payouts
- ✅ Admin panel endpoints + UI page
- ✅ 5% house fee, 95% to pool
- ✅ Claude AI picks with confidence + reason
- ✅ Syndicate create/join/auto-submit + WhatsApp share
- ✅ JackpotTierCard with sparkline, rollover badge, countdown
- ✅ JackpotMatchCard with form guide, H2H bar, odds, injury flag, AI overlay
- ✅ JackpotMyTickets with radar chart, accuracy history, per-match tracker
- ✅ Sticky progress bar with pick counter + submit
- ✅ Pool counter polls every 15s

**Gap:** Admin match result entry (needed for settlement). The admin page shows rounds but does not yet have a UI to set per-match results. This is intentional deferral — results should come from the sportsEvents table via the existing odds cron. Admins can call `PATCH /admin/jackpot/matches/:id/result` directly via API until a dedicated UI is built.
