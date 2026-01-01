## Contributing

Thanks for helping build a protocol-first Syntheverse ecosystem.

### What belongs where

- **Protocol changes** (spec/invariants/terminology): edit files under `protocol/`
- **Operator changes** (deployment policy, infra choices): edit files under `operator/` and `docs/`
- **Reference client changes** (UI/API/routes): edit the Next.js app in `app/`, `components/`, `utils/`, `supabase/`

### Contribution workflow

- **Fork + PR**: open a pull request with a clear summary and screenshots where relevant.
- **Small PRs win**: prefer focused PRs that do one thing.
- **Docs count**: protocol and operator docs are first-class contributions.

### Local development (reference client)

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Security

Please do not open public issues for sensitive reports. See `SECURITY.md`.



