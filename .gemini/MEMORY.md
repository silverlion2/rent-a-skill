# Persistent State & Memory

## Current Project Phase
Phase 2 (V1.6 Expansion) is completely live. The platform supports dual-mode user interfaces (Experts vs Buyers), interactive sandbox execution, live logging, and Postgres-backed ranking mechanisms. Next structural move points toward Vercel deployment and scaling the Edge.

## Milestones Tracker
- [x] Initial Next.js App Router Scaffold
- [x] Glassmorphism Design System Implementation (Vanilla CSS)
- [x] Marketplace Filtering Grid UI
- [x] Expert Supply-Side Dashboard UI
- [x] Execute Proxy Engine Logic (`/api/query`) supporting Dual-Mode (Chat vs MCP)
- [x] Supabase Postgres Setup (Schema + RLS Policies deployed via `schema.sql`)
- [x] Supabase SSR Client Injection with Graceful 'Mock' Fallbacks
- [x] Repository tracking established via GitHub (`silverlion2/rent-a-skill`)
- [x] Stripe Payment Gateway Wiring (Live webhook integration via `/api/webhooks/stripe`)
- [x] Live LLM Anthropics SDK Integration (for the 'Chat' execution branch)
- [x] Buyer Dashboard (`/buyer-dashboard`) for API key management and Sandbox launch
- [x] Execution Telemetry (`execution_logs` inserted directly inside `/api/query/route.ts`)
- [x] Interactive Sandbox UI (`/sandbox`) running zero-code tools securely via Server Actions
- [x] Skill Ranking Ecosystem (RLS-backed `reviews` and dynamically sorting `skill_metrics` Postgres View)

## Outstanding Architecture Decisions
- Need to determine what external deployment target we will use for the Next.js runtime (Vercel is presumed due to Edge execution handling for the API proxy).
