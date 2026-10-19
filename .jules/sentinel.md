## 2024-10-16 - Prevent DoS from Unhandled Promise Rejections
**Vulnerability:** Application crashed due to `throw` inside an asynchronous `request.get` callback in `lib/carrier-lookup/numverify.js` and `lib/carrier-lookup/whitepages.js`.
**Learning:** `throw` inside an async callback does not reject the surrounding Promise; it causes an unhandled exception that crashes the entire Node.js process (DoS vulnerability).
**Prevention:** Always use `return reject(...)` instead of `throw` inside Promise-wrapped asynchronous callbacks (e.g. request.get) to safely handle network errors.

## 2026-10-18 - Prevent DoS from Unhandled Promise Rejections (JSON parsing)
**Vulnerability:** Application could crash due to `JSON.parse` failing on invalid response data inside an asynchronous `request.get` callback in `lib/carrier-lookup/numverify.js` and `lib/carrier-lookup/whitepages.js`.
**Learning:** `JSON.parse` is synchronous and can throw on invalid data. If it throws inside an async callback not wrapped in try/catch, it results in an unhandled exception, causing the Node process to crash (DoS vulnerability).
**Prevention:** Wrap synchronous operations like `JSON.parse` inside async callbacks in a `try/catch` block that calls `reject(err)` on failure, effectively handling the error without crashing the process.

## 2024-10-18 - Parameter Injection/SSRF Vulnerability in API Request Construction
**Vulnerability:** The application was vulnerable to HTTP Parameter Pollution and Server-Side Request Forgery (SSRF) when making requests to the NumVerify and Whitepages APIs because user inputs (`number` and `country`) were concatenated directly into the request URLs.
**Learning:** String interpolation without proper URL encoding allows users to inject arbitrary query parameters (e.g. `&access_key=hacked`) by adding special characters to their input, overriding legitimate API parameters.
**Prevention:** Always use `encodeURIComponent()` to safely wrap any user-supplied or externally-sourced variables before inserting them into a URL query string.
