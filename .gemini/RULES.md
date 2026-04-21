# Project Operating Rules

1. **Aesthetic Doctrine:** NO TailwindCSS. The project utilizes a strict, custom Vanilla CSS Glassmorphism logic (`globals.css`). Any new UI components must conform to the frosted `<div className="glass-card">` design system.
2. **Security Doctrine:** Expert `system_prompt` and `mcp_endpoint_url` data must NEVER touch the client-side browser or public APIs. They must be aggressively shielded by Supabase Row Level Security (RLS) policies.
3. **Billing Zero Trust:** All executions flowing through `/api/query` must resolve against the `subscriptions` and `api_keys` tables strictly via internal backend checks before proxying traffic.
