## 2024-05-18 - Replacing Object.keys/includes with hasOwnProperty for fast carrier lookups
**Learning:** Using `!mapping[key]` for O(1) existence checks can unintentionally match inherited prototype properties (like "toString"), which bypassing validation.
**Action:** Use `mapping.hasOwnProperty(key)` instead for safe, robust, and fast O(1) checks.

## 2024-10-17 - [Optimized array iteration]
**Learning:** Validation logic often reiterates arrays and recomputes `Object.keys()` on every request/loop.
**Action:** Precompute these arrays and map arrays into `O(1)` objects when we check for property inclusion.

## 2024-10-24 - [Lazy Module Loading]
**Learning:** Large dependencies like `nodemailer-sendgrid-transport` and `request` (via carrier-lookup) are loaded at the root of `index.js`, even if the user never uses SendGrid or the lookup functions. This adds ~220ms to startup time unconditionally.
**Action:** Move `require` calls for optional dependencies inside the specific functions/conditionals where they are used to only incur the penalty when needed.
