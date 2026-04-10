---
name: backend-hardening
description: "Use when designing, building, or reviewing backend APIs, auth flows, data handling, integrations, or server-side security. Keywords: backend, API, auth, authorization, validation, rate limiting, database, security hardening, threat model, secrets, SSRF, CSRF, injection."
metadata:
  version: 1.0.0
---

# Backend Hardening Skill

Use this skill for backend work that needs secure defaults, resilient data handling, and clear service boundaries.

## When to Use

- Design or review APIs, auth flows, and data contracts.
- Harden server-side code against injection, broken access control, SSRF, CSRF, and secret leakage.
- Improve validation, error handling, retries, rate limiting, or observability.
- Audit integrations with databases, queues, third-party services, or file systems.

## Workflow

1. Map the trust boundaries, data flow, and privileged actions.
2. Identify likely abuse cases and failure modes before changing code.
3. Define validation, authorization, and rate-limiting rules explicitly.
4. Implement safe defaults, narrow interfaces, and defensive error handling.
5. Validate with tests and a quick security review of the changed path.

## Security Rules

- Treat all external input as untrusted.
- Enforce authorization at the boundary where data is accessed or mutated.
- Prefer allowlists over blocklists.
- Never expose secrets, tokens, internal IDs, or sensitive stack traces.
- Keep outbound requests constrained and explicit to reduce SSRF and dependency risk.

## Backend Standards

- Validate request shape, types, ranges, and required fields early.
- Normalize and sanitize only when needed; do not rely on sanitization alone for safety.
- Use idempotent patterns where retries are plausible.
- Return stable, non-leaky error responses.
- Add rate limits, pagination, timeouts, and bounded resource usage where relevant.
- Prefer clear domain-specific names and small service boundaries.

## Review Checklist

- Can an unauthorized caller reach or infer protected data?
- Are all inputs validated before use?
- Are secrets and internal details kept out of logs and responses?
- Are outbound calls, file access, and database queries constrained?
- Do tests cover the expected failure and abuse cases?

## Output Expectations

- Deliver concrete code changes or actionable hardening findings.
- Call out the threat model and the main risk reduction in brief terms.
- Recommend safer defaults when a design is ambiguous or risky.
- Keep the solution practical and maintainable, not just theoretically secure.