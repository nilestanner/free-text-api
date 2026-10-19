## 2024-10-18 - Avoid DoS and unhandled exceptions in asynchronous `request` callbacks
**Learning:** Functions wrapping `request.get` inside a `Promise` (like in `lib/carrier-lookup/numverify.js` and `whitepages.js`) will cause unhandled exceptions that crash the entire Node process if synchronous operations like `JSON.parse` fail.
**Action:** Always wrap synchronous operations inside a `try/catch` block that calls `reject(err)` inside an asynchronous callback in a Promise, to prevent process crashes. Furthermore, when testing for this, mark it as `todo` so it doesn't crash the test runner.
