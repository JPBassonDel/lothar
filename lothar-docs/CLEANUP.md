# Cleanup / reset workspace

Use this when you want to **remove the bootstrapped storefront** and return the repo to the accelerator-only layout so you can bootstrap again in the same Cursor window.

## In Agent chat

Say something like:

- “clean up”
- “reset workspace”
- “remove the storefront”
- “start over” / “re-bootstrap”

Lothar loads [lothar-cleanup.mdc](../.cursor/rules/lothar-cleanup.mdc) automatically, explains cleanup in **one sentence**, and asks you to confirm **before** deleting anything. After you agree, it removes everything at the repo root **except**:

- `.cursor/` (rules)
- `lothar-docs/` (this documentation)
- `.git/` (history is not removed)

It also restores the root [`.gitignore`](../.gitignore) to the accelerator default.

## After cleanup

The workspace looks like a fresh clone of cursor-accelerator. Run bootstrap again (e.g. “bootstrap B2C + Next”).

If port 3000 is still in use, stop any previous `pnpm dev` terminal session first.

## What cleanup does not do

- Does not revert git commits (ask explicitly if you need `git reset` or similar)
- Does not delete selective files — v0 is a full storefront reset only

Execution details: [lothar-cleanup.mdc](../.cursor/rules/lothar-cleanup.mdc).
