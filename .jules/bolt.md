## 2024-05-18 - Replacing Object.keys/includes with hasOwnProperty for fast carrier lookups
**Learning:** Using `!mapping[key]` for O(1) existence checks can unintentionally match inherited prototype properties (like "toString"), which bypassing validation.
**Action:** Use `mapping.hasOwnProperty(key)` instead for safe, robust, and fast O(1) checks.

## 2024-10-17 - [Optimized array iteration]
**Learning:** Validation logic often reiterates arrays and recomputes `Object.keys()` on every request/loop.
**Action:** Precompute these arrays and map arrays into `O(1)` objects when we check for property inclusion.

## 2024-10-24 - [Lazy Module Loading]
**Learning:** Large dependencies like `nodemailer-sendgrid-transport` and `request` (via carrier-lookup) are loaded at the root of `index.js`, even if the user never uses SendGrid or the lookup functions. This adds ~220ms to startup time unconditionally.
**Action:** Move `require` calls for optional dependencies inside the specific functions/conditionals where they are used to only incur the penalty when needed.

## 2024-10-24 - [Accidental Eager Loading via Barrel Files]
**Learning:** `Object.keys()` on a barrel file can inadvertently eagerly load heavy dependencies (like `request`) that were intended to be lazily loaded elsewhere, completely negating the benefit of the lazy loads.
**Action:** Always be mindful of what gets executed when requiring a file or barrel. Use constants or configurations instead of loading functional logic just to get property keys.

## 2024-05-14 - Promise caching deduplicates I/O
**Learning:** In highly concurrent flows, standard caching isn't enough to prevent duplicate outgoing external API requests for identical concurrent executions, because the cache remains empty until the first response returns.
**Action:** Caching the _promise_ itself prevents the race condition and causes subsequent callers to instantly await the pending request rather than spinning up a new one.
