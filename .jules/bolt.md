## 2024-05-18 - Replacing Object.keys/includes with hasOwnProperty for fast carrier lookups
**Learning:** Using `!mapping[key]` for O(1) existence checks can unintentionally match inherited prototype properties (like "toString"), which bypassing validation.
**Action:** Use `mapping.hasOwnProperty(key)` instead for safe, robust, and fast O(1) checks.
