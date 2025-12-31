## Security policy

### Reporting a vulnerability

Please report security issues privately.

- **Preferred**: open a GitHub Security Advisory (if enabled for the repo)
- **Alternative**: email the operator contact listed in `operator/README.md` (FractiAI reference instance)

Include:

- A clear description of the issue and impact
- Reproduction steps or a proof of concept (if available)
- Affected paths (files/endpoints) and any mitigations you know

### Scope notes

- This repo contains an operator reference client (web app + API routes). Treat auth/session, Stripe webhooks, and database access paths as in-scope.
- Do **not** include secrets (API keys, `.env` contents) in reports.


