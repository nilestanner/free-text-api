## 2024-10-17 - [Optimized array iteration]
**Learning:** Validation logic often reiterates arrays and recomputes `Object.keys()` on every request/loop.
**Action:** Precompute these arrays and map arrays into `O(1)` objects when we check for property inclusion.
