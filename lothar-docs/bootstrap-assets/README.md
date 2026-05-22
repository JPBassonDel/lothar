# Bootstrap golden assets

Known-good mock layer files copied into the storefront during Lothar bootstrap step **1b** (mock mode).

## Copy into storefront

From repo root after scaffold:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cp "$REPO_ROOT/lothar-docs/bootstrap-assets/lib/sfcc/mock-mode.ts" "$REPO_ROOT/lib/sfcc/"
cp "$REPO_ROOT/lothar-docs/bootstrap-assets/lib/sfcc/mock-data.ts" "$REPO_ROOT/lib/sfcc/"
cp "$REPO_ROOT/lothar-docs/bootstrap-assets/lib/sfcc/mock.ts" "$REPO_ROOT/lib/sfcc/"
```

Then patch `lib/sfcc/index.ts` per [MOCK-MODE.md](../MOCK-MODE.md) (not fully automated — template `index.ts` may drift).

## `next.config.ts`

Merge `images.remotePatterns` entries from [next.config.remotePatterns.json](./next.config.remotePatterns.json) when mock data uses Picsum URLs.

## When upstream template changes

1. Re-bootstrap into a temp workspace or diff against a fresh clone.
2. Update golden files and the `index.ts` checklist in MOCK-MODE.md.
3. Run `pnpm verify:bootstrap` at the storefront root.
