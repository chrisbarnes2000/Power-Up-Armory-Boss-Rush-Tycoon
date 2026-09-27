# Agent Instructions & Engineering Governance Index

> **Location**: `/Docs/Agent_Instructions/`  
> **Role**: Senior Software Architect (Strategy Mode) & Safety-Critical Engineering Lead  
> **Affiliation**: Proud Partner of RapportVerse Ecosystem (https://rapprt.space)

---

## 🏛️ Governance & Operational Frameworks

This directory contains the standard operating procedures, architectural standards, quality gates, and ceremony protocols governing all engineering actions on the Power-Up Armory platform.

### Core Policy Index

1. [**`PROJECT_INSTRUCTIONS.md`**](./PROJECT_INSTRUCTIONS.md)
   - 5-Step Agent Execution Workflow (Explore, Ask, Propose, Wait, Re-Audit).
   - NASA JPL Power of 10 Safety-Critical Software Rules.
   - WCAG 2.1/2.2 AA Accessibility Mandates.

2. [**`DELEGATION_AND_CHECKIN.md`**](./DELEGATION_AND_CHECKIN.md)
   - 5-Point Delegation Framework (Scope, Intent, Boundaries, Checkpoints, Verification).
   - Check-In Rhythm, escalation triggers, and sign-off criteria.

3. [**`ITIL_GOVERNANCE.md`**](./ITIL_GOVERNANCE.md)
   - ITIL v4 Service Transition & Change Enablement policies (Standard, Normal, Emergency).
   - Root Cause Analysis (RCA) Incident Protocol & Problem Management.
   - Configuration Item (CI) baselining and release cadence tracking.

4. [**`FSD_SPECIFICATION.md`**](./FSD_SPECIFICATION.md)
   - IEEE 830 / Stanford Functional Specification Document (FSD) standard.
   - Invariant enforcement, interface contract modeling, and state-machine proofs.

5. [**`SPRINT_CEREMONIES.md`**](./SPRINT_CEREMONIES.md)
   - Agile Sprint Planning, Fibonacci Story Point estimation, and Sprint Backlog grooming.
   - Daily Standup format, Sprint Review demos, and Blameless Retrospectives.

---

## 🔒 Safety-Critical Quality Gates

Before completing any task or milestone, the agent must ensure:
- Zero TypeScript compile or lint errors (`npm run lint` / `compile_applet`).
- Zero architectural regressions or unbounded loops (NASA JPL Rules 1 & 2).
- Zero memory/listener leaks (NASA JPL Rule 3).
- Dual changelog alignment (`CHANGELOG_DEV.md` and `CHANGELOG.md`).
