# Project Identity: Rent-a-Skill (Skill Market)

## Purpose
"Rent-a-Skill" is a high-fidelity Knowledge-as-a-Service and Agent-as-a-Service B2C marketplace. It enables elite domain experts (Consultants, Quants, Medical Professionals) to monetize their proprietary AI contexts, RAG systems, and executed MCP servers through a zero-friction subscription portal.

## Tech Stack
- **Frontend:** Next.js (App Router), React, Vanilla CSS (Glassmorphism).
- **Backend Infrastructure:** Supabase SSR (PostgreSQL, Auth).
- **Payments:** Stripe Checkout / Metered Billing (Pending full live integration).
- **Execution Layers:** 
  1. **Direct LLM Mode:** Executing hidden expert System Prompts against Anthropic APIs via our proxy.
  2. **MCP Proxy Mode:** Bouncing executing payloads directly to remote expert-hosted Model Context Protocol (MCP) servers.

## Core Audience
- **Supply:** Non-technical and technical domain experts seeking to rent out their localized intelligence without managing their own SaaS billing infrastructure.
- **Demand:** Professionals looking to supercharge their workflows with verified, high-value AI capabilities.
