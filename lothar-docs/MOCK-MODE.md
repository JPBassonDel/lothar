# Mock mode implementation guide

Reference for Lothar bootstrap when `useMockMode` is true. The bootstrap rule links here instead of inlining Next.js pitfalls.

See also [bootstrap-assets/README.md](./bootstrap-assets/README.md) for copy-paste golden files.

## Files to create or patch

| Path | Action |
|------|--------|
| `lib/sfcc/mock-mode.ts` | Create — `isSfccMockMode()` |
| `lib/sfcc/mock-data.ts` | Create — static catalog |
| `lib/sfcc/mock.ts` | Create — cookie-backed cart |
| `lib/sfcc/index.ts` | Patch — mock branches + `*Cached()` helpers |
| `.env.example` | Add `SFCC_USE_MOCK="false"` |
| `next.config.ts` | Add remote image hostnames if using external URLs |
| `tsconfig.json` | Add `"lothar-docs"` to `exclude` |
| `package.json` | Add `"verify:bootstrap": "tsc --noEmit && next build"` |

Copy golden implementations from `lothar-docs/bootstrap-assets/lib/sfcc/` when present, then apply the `index.ts` checklist below.

## `"use cache"` wrapper pattern (required)

Next.js requires `"use cache"` to be the **first** statement in a function body. **Never** place `if (isSfccMockMode())` before `"use cache"` in the same function.

Use a **wrapper** on exported functions:

```typescript
export async function getProduct(id: string) {
  if (isSfccMockMode()) return mock.mockGetProduct(id);
  return getProductCached(id);
}

async function getProductCached(id: string) {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");
  return getSFCCProduct(id);
}
```

Apply this pattern for: `getCollections`, `getProduct`, `getCollectionProducts`, `getProducts`, `getProductRecommendations`.

Cart functions (`createCart`, `getCart`, `addToCart`, `removeFromCart`, `updateCart`) only need a mock branch at the top — they do not use `"use cache"`.

## `lib/sfcc/index.ts` patch checklist

1. Add imports:

   ```typescript
   import { isSfccMockMode } from "./mock-mode";
   import * as mock from "./mock";
   ```

2. At the start of each export below, `if (isSfccMockMode()) return mock.<fn>(...)`:

   - `getCollections` → `mock.mockGetCollections()`
   - `getProduct` → `mock.mockGetProduct(id)`
   - `getCollectionProducts` → `mock.mockSearchProducts({ categoryId: collection, limit, sortKey })`
   - `getProducts` → `mock.mockSearchProducts({ query, sortKey })`
   - `createCart`, `getCart`, `addToCart`, `removeFromCart`, `updateCart` → matching `mock.*`
   - `getProductRecommendations` → `mock.mockGetProductRecommendations(productId)`

3. Do **not** stub checkout/order functions in v1 (`updateCustomerInfo`, shipping, payment, `placeOrder`, etc.).

4. Split SFCC paths that use `"use cache"` into `*Cached()` helpers (see wrapper pattern above). `getProductRecommendationsCached` should call `getProductCached` and `getCollectionProductsCached`, not the public exports, to avoid cache nesting issues.

## Remote images (`next/image`)

Mock product images use `next/image` via `GridTileImage`. External URLs must be listed in `next.config.ts` under `images.remotePatterns`.

If using Picsum (default golden bundle):

```typescript
{
  protocol: "https",
  hostname: "picsum.photos",
},
{
  protocol: "https",
  hostname: "fastly.picsum.photos",
},
```

Merge from [bootstrap-assets/next.config.remotePatterns.json](./bootstrap-assets/next.config.remotePatterns.json).

**Build-time failure:** `Invalid src prop ... hostname "picsum.photos" is not configured` — add the hostnames above.

## Cookies

- Mock cart state uses the `mock_cart_lines` cookie (see `mock.ts`).
- The template sets `cartId` via `createCartAndSetCookie` in a **server action** — keep cookie writes in `createCart` / cart server actions only.
- Do **not** set cookies from RSC layout code (`app/layout.tsx` only reads cart via `getCart()`).

## Image strategy

| Approach | Pros | Cons |
|----------|------|------|
| Picsum URLs + `remotePatterns` | No binary assets in repo | Must update `next.config.ts` |
| Files under `public/images/mock/` | No `remotePatterns`; safest for verify | Larger repo; update golden bundle |

Golden bundle defaults to Picsum. For maximum reliability, switch `mock-data.ts` to `/images/mock/{id}.jpg` and add static assets under `public/images/mock/`.

## Catalog requirements

- ~6 products with stable IDs (e.g. `mock-tee-black`)
- Collections aligned with `storeCatalog.ids` in `lib/sfcc/constants.ts`: `mens`, `womens`, `newarrivals`, `top-seller`
- Homepage mappings: `hidden-homepage-carousel`, `hidden-homepage-featured-items` (at least 3 products for featured grid)

## `isSfccMockMode()` behavior

- `SFCC_USE_MOCK === "true"` → mock
- `SFCC_USE_MOCK === "false"` → live SFCC
- Otherwise auto-detect placeholder env: `your-client-id`, `your-secret`, `your-short-code`, `f_ecom_xxxx_xxx`, or empty values

## Troubleshooting (bootstrap verify step)

| Error | Fix |
|-------|-----|
| `"use cache" directive must be at the top of the function body` | Move mock branch to export; put `"use cache"` only in `*Cached()` helpers |
| `hostname "picsum.photos" is not configured` | Add `remotePatterns` in `next.config.ts` |
| `Cookies can only be modified in a Server Action` | Move cookie writes out of layout/RSC; use server actions only |

`GET /worker.js` 404 in the terminal is usually a browser extension — not a storefront bug.

## Verification

Bootstrap runs `pnpm verify:bootstrap` (or `tsc --noEmit` + `next build`) after `.env.local` exists. Do not tell the user bootstrap succeeded until verify passes.

Optional smoke (mock mode): after build, `pnpm start` and curl `/`, `/search/mens`, `/product/mock-tee-black` — expect HTTP 200.
