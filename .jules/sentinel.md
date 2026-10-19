## 2024-05-15 - Unhandled Exceptions in Async Callbacks Causing DoS
**Vulnerability:** Throwing an error inside the `request.get` callback in both `numverify.js` and `whitepages.js` causes the entire Node.js application to crash, leading to a Denial of Service (DoS). Unencrypted `http` transmission of `access_key` in `numverify.js` also leaked credentials over the wire. Also, unsanitized user inputs were appended to the query parameters causing injection vulnerabilities.
**Learning:** This existed because the codebase was using a `Promise` wrapper but chose to use `throw` instead of `reject()` inside the async callback of `request`. Any error triggered by the `request` function immediately crashes the process because it's not caught by the Promise chain.
**Prevention:** Always use `reject()` inside Promise-wrapped async callbacks instead of `throw`. Ensure that user-provided inputs are properly sanitized using `encodeURIComponent` before being embedded into URL strings. Always use `https` for requests containing API keys or sensitive information.

## 2024-10-16 - Prevent DoS from Unhandled Promise Rejections
**Vulnerability:** Application crashed due to `throw` inside an asynchronous `request.get` callback in `lib/carrier-lookup/numverify.js` and `lib/carrier-lookup/whitepages.js`.
**Learning:** `throw` inside an async callback does not reject the surrounding Promise; it causes an unhandled exception that crashes the entire Node.js process (DoS vulnerability).
**Prevention:** Always use `return reject(...)` instead of `throw` inside Promise-wrapped asynchronous callbacks (e.g. request.get) to safely handle network errors.

## 2026-10-18 - Prevent DoS from Unhandled Promise Rejections (JSON parsing)
**Vulnerability:** Application could crash due to `JSON.parse` failing on invalid response data inside an asynchronous `request.get` callback in `lib/carrier-lookup/numverify.js` and `lib/carrier-lookup/whitepages.js`.
**Learning:** `JSON.parse` is synchronous and can throw on invalid data. If it throws inside an async callback not wrapped in try/catch, it results in an unhandled exception, causing the Node process to crash (DoS vulnerability).
**Prevention:** Wrap synchronous operations like `JSON.parse` inside async callbacks in a `try/catch` block that calls `reject(err)` on failure, effectively handling the error without crashing the process.
