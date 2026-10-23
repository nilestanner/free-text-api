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

## 2024-10-18 - Prevent DoS from Floating Promise in Synchronous Factory
**Vulnerability:** In `index.js`, the application triggered an asynchronous validation using `verify(config, 'configFormat')` without awaiting or handling its rejection, leading to an unhandled promise rejection that crashed the entire Node.js process if invalid configuration was provided.
**Learning:** Calling an asynchronous function that rejects from within a synchronous context leaves a floating promise. If that promise rejects, the Node process will crash (DoS). Simply throwing an error synchronously within a `.catch()` block attached to the floating promise does not solve the issue.
**Prevention:** When using asynchronous validation (like `node-input-validator`) within synchronous factory functions, capture the promise and suppress immediate unhandled rejections using `.catch(() => {})`. Then, explicitly `await` the captured promise inside downstream asynchronous methods to securely enforce validation without breaking the synchronous API.
## 2024-10-23 - Prevent DoS from unhandled undefined input to `node-input-validator`
**Vulnerability:** The application crashed with a `TypeError` when `undefined` or `null` was passed to the `Verifier` (and consequently `Validator` class from `node-input-validator`), leading to a potential Denial of Service (DoS) attack if a user provided no configuration or options.
**Learning:** `node-input-validator` does not gracefully handle null/undefined data objects when instantiated; it expects an object to read properties from during evaluation.
**Prevention:** Defensively validate data objects with a fallback empty object (e.g. `const validator = new Validator(obj || {}, formats)`) so that it can safely evaluate fields and return expected validation errors rather than crashing the application synchronously.
## 2024-10-23 - Prevent DoS from unhandled TypeError on toLowerCase()
**Vulnerability:** The application crashed with a `TypeError` when properties like `config.transport.service`, `config.carrierLookup.method`, or validated fields like `carrier` and `carrierLookup` were provided as non-string objects.
**Learning:** Calling `.toLowerCase()` on untyped configuration inputs or validation rules without checking if they are strings leads to unhandled exceptions. In the case of `transport.service`, passing a non-string object caused `nodemailer.createTransport()` to crash internally during well-known service resolution (`key.split is not a function`).
**Prevention:** Strictly enforce `typeof value === 'string'` checks before invoking string methods on configuration inputs or validation rules. Sanitize inputs before passing them to external libraries that expect strings.
