# Bootstrap reference

Lothar scaffolds a **Next.js + Salesforce B2C** storefront **into the current workspace root** via Cursor rules. The agent collects inputs in chat and runs bootstrap steps from [lothar-bootstrap.mdc](../.cursor/rules/lothar-bootstrap.mdc).

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/)
- [git](https://git-scm.com/)

## What gets created

The agent clones [nextjs-salesforce-commerce-cloud](https://github.com/vercel-partner-solutions/nextjs-salesforce-commerce-cloud) into a temp folder, merges it into the repo root (preserving `.cursor/` and `lothar-docs/`), runs `pnpm install`, then writes at the workspace root:

- `.env.local` — SFCC and site configuration (secrets stay here only)
- `accelerator.manifest.json` — stack metadata and agent progress for future accelerator agents
- Store **README.md** at repo root (from the template)

Lothar meta documentation stays in [lothar-docs/README.md](./README.md).

## Environment variables

| Variable | Description |
|----------|-------------|
| `SFCC_USE_MOCK` | Set to `"true"` for local mock catalog/cart (no SFCC sandbox). Default `"false"` in `.env.example`. |
| `SITE_NAME` | Store display name |
| `SFCC_ORGANIZATIONID` | Org ID, e.g. `f_ecom_xxxx_xxx` |
| `SFCC_SHORTCODE` | Instance short code |
| `SFCC_SITEID` | Site ID (default `RefArch`) |
| `SFCC_CLIENT_ID` | SLAS API client ID |
| `SFCC_SECRET` | SLAS client secret |
| `SFCC_REVALIDATION_SECRET` | On-demand revalidation secret (auto-generated with `openssl rand -hex 24` if omitted) |
| `COMPANY_NAME` | Branding label |
| `NEXT_PUBLIC_VERCEL_URL` | Public URL (default `http://localhost:3000`) |

**Secrets live only in `.env.local`.** Do not commit that file.

## Mock mode

When you defer SFCC sandbox credentials during bootstrap, Lothar enables **local mock mode**:

- Sets `SFCC_USE_MOCK="true"` in `.env.local` and adds `commerce.mockMode: true` in `accelerator.manifest.json`
- Patches `lib/sfcc/` with a lightweight mock layer (static catalog, cookie-backed cart)

**Works without SFCC:** homepage collections, product listing/search, product detail pages, add to cart, cart updates.

**Still requires a real sandbox:** checkout (shipping, payment, place order). When you have credentials, set `SFCC_USE_MOCK="false"`, replace placeholder SFCC values with real ones, and configure SLAS in Business Manager.

`SFCC_USE_MOCK="true"` forces mock even if other env vars look real. Placeholder values alone also auto-enable mock when `SFCC_USE_MOCK` is unset.

## Manifest file

`accelerator.manifest.json` is written at the workspace root. It records:

- Commerce platform and site ID (and `mockMode: true` when bootstrap used local mock)
- Frontend template used
- Sandbox org/short code (non-secret identifiers)
- Agent progress (`bootstrap: complete`, others `pending`)

It does **not** store API secrets.

## After bootstrap

```bash
pnpm dev
```

Run from the workspace root — no need to `cd` elsewhere or open a new Cursor window.

Configure SLAS in Business Manager if you have not already. See [SFCC Shopper API authorization](https://developer.salesforce.com/docs/commerce/commerce-api/guide/authorization-for-shopper-apis.html).

For homepage content, create categories `hidden-homepage-carousel` and `hidden-homepage-featured-items` in Business Manager (see the store README at repo root).

## What's next

Future agents (catalog, design, style, features) will read `accelerator.manifest.json` and update agent status. See [PLAN.md](./PLAN.md) for the full roadmap.
