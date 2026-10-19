## 2024-05-24 - Unhandled Exceptions in Promise Callbacks cause DoS
**Vulnerability:** External HTTP request callbacks (`request.get`) were using `throw` to handle errors.
**Learning:** Throwing inside an asynchronous callback (like `request.get`) does not reject the surrounding Promise. Instead, it creates an uncaught exception which crashes the entire Node.js process, leading to a Denial of Service (DoS) vulnerability.
**Prevention:** Always use `reject()` inside Promise-wrapped asynchronous callbacks (e.g. `request.get` callbacks), and wrap `JSON.parse` or other synchronous operations inside the callback in a `try/catch` block that calls `reject(err)` on failure.

## 2024-10-16 - Prevent DoS from Unhandled Promise Rejections
**Vulnerability:** Application crashed due to `throw` inside an asynchronous `request.get` callback in `lib/carrier-lookup/numverify.js` and `lib/carrier-lookup/whitepages.js`.
**Learning:** `throw` inside an async callback does not reject the surrounding Promise; it causes an unhandled exception that crashes the entire Node.js process (DoS vulnerability).
**Prevention:** Always use `return reject(...)` instead of `throw` inside Promise-wrapped asynchronous callbacks (e.g. request.get) to safely handle network errors.

## 2026-10-18 - Prevent DoS from Unhandled Promise Rejections (JSON parsing)
**Vulnerability:** Application could crash due to `JSON.parse` failing on invalid response data inside an asynchronous `request.get` callback in `lib/carrier-lookup/numverify.js` and `lib/carrier-lookup/whitepages.js`.
**Learning:** `JSON.parse` is synchronous and can throw on invalid data. If it throws inside an async callback not wrapped in try/catch, it results in an unhandled exception, causing the Node process to crash (DoS vulnerability).
**Prevention:** Wrap synchronous operations like `JSON.parse` inside async callbacks in a `try/catch` block that calls `reject(err)` on failure, effectively handling the error without crashing the process.
