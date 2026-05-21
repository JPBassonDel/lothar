# cursor-accelerator (Lothar)

Commerce accelerator for Cursor — bootstrap a Next.js + Salesforce B2C storefront with **Lothar** in Agent chat. The storefront is scaffolded **into this workspace** (repo root), so you stay in the same Cursor window and chat.

## Bootstrap with Lothar (Cursor)

Lothar is **opt-in** (`alwaysApply: false`) so normal work in this repo is not forced into bootstrap mode.

1. Open this repo in **Cursor**.
2. Open **Agent** chat.
3. **Enable both rules** for this chat: **@** → **Rules** → **Lothar** ([lothar.mdc](../.cursor/rules/lothar.mdc)) and **Lothar Bootstrap** ([lothar-bootstrap.mdc](../.cursor/rules/lothar-bootstrap.mdc)).
4. Say you want to bootstrap (e.g. “bootstrap my store” or “hi lothar”).
5. For **B2C + Next.js**, Lothar asks for project name and SFCC env in **chat**, then **runs** `git clone`, merges the template into the workspace root, `pnpm install`, and writes `.env.local` and `accelerator.manifest.json`.

After bootstrap, the **store README** lives at the repo root; this file stays here as Lothar meta documentation.

See [AGENTPLAN.md](./AGENTPLAN.md) for architecture; [BOOTSTRAP.md](./BOOTSTRAP.md) for env vars and post-setup.

## Lothar docs

- [BOOTSTRAP.md](./BOOTSTRAP.md) — env vars, manifest, post-setup
- [PLAN.md](./PLAN.md) — architecture and roadmap (historical)
- [AGENTPLAN.md](./AGENTPLAN.md) — Lothar persona, rules, and bootstrap flow

## Structure (before / alongside bootstrap)

```
cursor-accelerator/
├── .cursor/rules/
│   ├── lothar.mdc           # Persona and capabilities
│   └── lothar-bootstrap.mdc # In-place scaffold (enable with Lothar)
├── lothar-docs/             # This folder — Lothar meta docs
├── app/                     # (after bootstrap) Next.js storefront
├── package.json             # (after bootstrap)
└── README.md                # (after bootstrap) store README from template
```
