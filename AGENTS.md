# Project Guidance

## User Preferences

- User-friendly and easy to use
- Everything in one place
- Clear navigation hierarchy and readable information density for a content hub

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- AccessControl.isAdmin (caffeineai-authorization) traps for unregistered principals; guard admin mutations by reading accessControlState.userRoles directly and treating null as non-admin.
- Candid record fields that callers may omit must be optional (?T) or the call traps with 'Record is missing key'.
- With Enhanced Migration check-limit=1, a fresh project must have exactly one pending migration; fold baseline state init into the latest pending file.
- Frontend shared types live in src/frontend/src/types.ts (single module); backend enums are re-exported as runtime values for label maps and switches.
- TanStack Router search-param updaters must only assign keys present in the patch, or unrelated filters get cleared.
- When a backend filter defaults to a non-'all' value, the UI's active-option computation must mirror that default.
- Tailwind color tokens referenced as bg-cat-*/border-cat-* must be declared in tailwind.config.js colors with <alpha-value> for opacity modifiers.
- Object URLs created from attachment blobs must be memoized and revoked in an effect cleanup.
- Motoko preview truncation must use Text.fromArray on the sliced [Char] array; Array.toText renders comma-separated characters.
