---
title: "MECG Recruitment Platform"
tagline: "Rush platform for the Michigan Engineering Consulting Group with locked, two-approval decisions"
description: "A cycle-based rush platform for the Michigan Engineering Consulting Group: applications, QR event check-in, structured member evaluations, deliberation, and locked board decisions, built on Next.js and Supabase."
problem: "MECG ran recruitment on forms, spreadsheets, and group chats. Evaluations were inconsistent, attendance was tracked by hand, applicants had no reliable status view, and nothing stopped a score from being edited after the fact or a decision from being released before it was final."
solution: "Built the recruitment workflow as a Next.js app on Supabase: applicants apply while a cycle is open and get a private status link, members submit immutable anchored-score evaluations for their assigned rounds, board roles manage assignments and see attendance, and final decisions need two conflict-free approvals before locking. Shipped the Fall 2026 rush release as the main contributor on a three-person repo."
demoUrl: "https://mecg-website-three.vercel.app"
githubUrl: "https://github.com/amanigupta27/mecg-website"
kind: "web app"
featured: false
completedDate: 2026-09-01
---
## Overview

**What it is:** A cycle-based rush system for the Michigan Engineering Consulting Group (MECG). It covers the whole recruitment loop: applications, event attendance with QR check-in, structured member evaluations for Speed Dating and Group Case rounds, Hash deliberation, and locked board decisions that are released to applicants only when the board chooses.

**Why it matters:** Recruitment decisions are only as fair as the process that produces them. The platform enforces the rules the club agreed on: anchored scoring, minimum observed rubric weight, at least two independent evaluations per round, structured review when scores disagree, and two distinct approvals before a decision locks.

**Who it's for:** MECG applicants, members who evaluate them, board operations roles, and the Hash panel that makes final decisions.

**Impact:** Opened the Fall 2026 application portal on September 1, 2026. I was one of three contributors on the repository, with 5 merged pull requests and 66 commits; the Fall 2026 rush release added about 9,700 lines across 199 files. A public example is [PR #5](https://github.com/amanigupta27/mecg-website/pull/5).

## The Problem

### The Challenge

Running rush by hand meant every step depended on someone remembering to do it: mark attendance, collect scores, average them, decide, and tell the applicant.

**Specific issues:**
- No single source of truth for who applied, who attended, and who was evaluated
- Scores could be seen by peers and changed after submission
- Applicants could not check their own status
- Nothing enforced that a decision was final before it went out

**Who was affected:**
- Applicants waiting on outcomes
- Members asked to evaluate consistently across rounds
- The board, responsible for defensible decisions

### Constraints & Requirements

**Technical constraints:**
- Every privileged action needs a named session and a server-side cycle permission check
- Row-level security in the database, not just checks in the app
- Deterministic gates before release: tests, type check, lint, build, plus database and live verification scripts

**Process constraints:**
- The first cycle can only be created by the existing MECG Recruitment board account
- Users cannot grant roles to themselves
- Attendance is operational only and never feeds rankings

## The Solution

### Approach & Methodology

Model recruitment as a cycle with rounds, roles, and a state machine, then put the rules in the database and the server rather than the UI.

**Roles:**
- **Applicants** submit through `/apply` while a cycle is open and receive a private status link
- **Members** open Speed Dating, Group Case, and Hash workspaces and submit only assigned evaluations; they cannot see peer scores or aggregate rankings
- **Board operations** manage assignments and round status
- **Hash panel** sees locked aggregates and decides after every evaluated round is frozen
- **Owners** create the other internal roles

### Technology Stack

**Frontend and server:**
- Next.js 16 with React 19, Tailwind CSS 4
- `qrcode` for check-in codes, `pdfjs-dist` for resume handling, `@hello-pangea/dnd` for drag and drop

**Backend:**
- Supabase: Postgres, Auth, and row-level security; migrations in `supabase/migrations`
- Server-only service role key for account administration and project verification

**Verification:**
- `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build` as deterministic gates
- `npm run test:supabase` for the database gate; `verify:backend`, `verify:auth`, `verify:workflow` for live gates
- Playwright for end-to-end tests

**Deployment:**
- Vercel

**Why this stack:**
- Supabase gives auth, Postgres, and RLS in one place, so authorization rules live next to the data
- Next.js route handlers keep privileged actions server-side with a named session

### Architecture & Design Decisions

**Immutable evaluations.** Submitted evaluations cannot be edited. A valid form needs at least 75 percent observed rubric weight and its required criterion; `N/O` stays missing and never becomes zero.

**Two-person lock on decisions.** Final decisions need two distinct, conflict-free Board or Owner approvals before locking, and outcomes appear to applicants only after a locked decision is explicitly released.

**Session versioning.** Changing a password increments the account's session version, invalidating every older session.

**Attendance is not a score.** QR check-in is a convenience for the door, not proof of identity, and it never contributes to rankings.

**Trade-offs:**
- Rules enforced in SQL and RPCs are harder to iterate on than UI checks, but they hold when the UI is bypassed
- The application and rubric editors let the board change questions and criteria without a migration, at the cost of more schema flexibility to test

### Key Features

1. **Applicant portal** with private status links, draft recovery, withdrawal, and reapplication in later cycles
2. **QR check-in** shortcut and attendance visibility on the scoring page
3. **Structured evaluations** with anchored 1 to 5 scores plus `N/O`, per-round weights (Speed Dating 40 percent, Group Case 60 percent in the dry run), and structured review when a spread reaches 25 points
4. **Deliberation and locked decisions** with batch release and a message log
5. **Cycle operations**: clone a cycle, edit questions and rubric criteria without a migration, cycle-wide audit log, bulk messaging to a pipeline segment
6. **Member directory, profiles, task inbox, and projects/staffing admin**

## Technical Highlights

### QR check-in route

The check-in endpoint is a thin route over a database RPC. Authorization and the actual state change live in Postgres; the route only maps the result to an HTTP status.

```ts
import { NextResponse } from "next/server";
import { mapRpcError } from "@/lib/api-route";
import { currentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!(await currentUser())) return NextResponse.json({ error: "Sign in before checking in" }, { status: 401 });
  const { token } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_in", { raw_token: token });
  if (error) {
    console.error("check_in failed", error);
    const { body, status } = mapRpcError(error);
    return NextResponse.json(body, { status });
  }
  return NextResponse.json({ alreadyCheckedIn: data }, { status: data ? 200 : 201 });
}
```

**Key Technical Decisions:**

1. **RPCs for privileged writes.** Check-in, evaluation submission, and decision locking go through database functions that check the caller's cycle permission.
2. **Pure scoring functions.** The scoring logic is tested independently from Supabase.
3. **A SQL contract check in CI.** The SQL and TypeScript contract is checked without a database, and a separate gate runs the migrations against a real one.

## Process & Timeline

### Phase 1: Foundation (June to July 2026)

- Repository setup and v1.0 PRD
- Supabase schema, apply flow, and UI overhaul
- Portals converged onto Supabase auth (login, verify, reset, OAuth, route protection)
- Public site redesign and SEO pass

### Phase 2: Recruitment migration and check-in (August 2026)

- QR check-in shortcut and scoring-page attendance visibility
- Supabase recruitment migration completed

### Phase 3: Fall 2026 rush release (September 1, 2026)

- Unified admin, member, and recruitment workspace with one shell and one nav
- Question and rubric editors without migrations, cycle clone, applicant withdrawal and reapplication
- Message log, batch decision release, comms centre, member task inbox, projects and staffing
- Four policy decisions decided and enforced; four defects found by running migrations and tests against a real database
- Application portal opened

### Phase 4: Rush operations (September 2026)

- Submission, receipts, and attendance hardened to survive partial failures
- Blind resume reading, screening ranking, and event attendance shown in the ranking
- Off-site applicant backup

## Challenges & Solutions

### Challenge 1: Rules that survive the UI

**The Problem:** A check in a React component is a suggestion. Members must not see peer scores, and a decision must not release before it locks.

**The Solution:** Row-level security policies and RPCs in `supabase/migrations`, with a live verifier that checks privacy and authorization failures as well as the successful path.

**What I learned:** Put the invariant where every code path has to pass through it.

### Challenge 2: Shipping a release against a real database

**The Problem:** Migrations and tests that pass in isolation can still disagree with production state.

**The Solution:** Ran the migrations and tests against the real project before opening the portal, fixed the four defects that surfaced, and reconciled the migration ledger with production.

**What I learned:** The last gate before a launch has to be the real database.

### Challenge 3: Partial failures on submit

**The Problem:** An application submission touches the application, a receipt, and attendance. If one step fails after another has succeeded, the applicant is stranded.

**The Solution:** Made submission, receipts, and attendance survive partial failures, and added a sweep for stranded receipts on the next submit.

**What I learned:** Design for the second attempt, not just the first.

## Results & Metrics

- Fall 2026 application portal opened September 1, 2026
- Three-contributor repository; my share: 5 merged pull requests, 66 commits
- Fall 2026 rush release: about 9,700 lines added across 199 files
- Evaluation rules enforced: 75 percent observed weight minimum, two independent evaluations per round, structured review at a 25-point spread, two approvals to lock a decision

## Learnings

### What Worked Well

- Supabase RLS plus server RPCs as the single authorization layer
- Editors for questions and rubrics, which removed migrations from the board's critical path
- Deterministic gates first, live gates second, in a fixed order

### What Didn't Work

- Reapplication was initially blocked by routing rather than schema, which took a while to diagnose
- Applicant submission needed a reliability pass after the portal opened, not before

### What I'd Do Differently

- Run the real-database gate earlier and more often
- Add the stranded-receipt sweep before launch rather than after

## Links & Resources

- **Live site**: [mecg-website-three.vercel.app](https://mecg-website-three.vercel.app)
- **Repository**: [github.com/amanigupta27/mecg-website](https://github.com/amanigupta27/mecg-website)
- **Public PR**: [PR #5](https://github.com/amanigupta27/mecg-website/pull/5)

---

**Completed:** September 1, 2026
