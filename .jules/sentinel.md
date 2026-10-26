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

## 2024-10-23 - Prevent DoS from TypeErrors when Expecting Strings
**Vulnerability:** Application crashed synchronously due to `TypeError: value.toLowerCase is not a function` and `TypeError: key.split is not a function` when non-string values (like objects or numbers) were passed to validation extensions or transport configurations.
**Learning:** String methods (like `.toLowerCase()`) and internal library functions (like `nodemailer`'s well-known resolver which splits strings) expect string primitives. If external input is not strictly validated as a string before invoking these methods, it throws an unhandled synchronous `TypeError`, leading to a complete Node.js process crash (Denial of Service).
**Prevention:** Strictly enforce `typeof value === 'string'` checks before invoking string methods on configuration inputs or validation rules, and defensively throw structured errors if invalid types are encountered.

## 2024-10-26 - Local File Inclusion (LFI) via Object Injection in node-input-validator
**Vulnerability:** The `message` field was validated only for maximum length (`maxLength:140`), but not explicitly restricted to strings. Passing a malicious object like `{ path: 'package.json' }` bypassed the length check and was passed verbatim to `nodemailer`. Nodemailer interprets the `path` property as a local file, causing it to read the file and send its contents in the email (Local File Inclusion / path traversal).
**Learning:** `node-input-validator` does not inherently enforce string types on fields unless the `string` rule is explicitly provided. Bypassing type expectations by passing objects can exploit downstream consumers (like `nodemailer`) that have special behavior for object structures.
**Prevention:** Always explicitly include the `string` validation rule (e.g., `required|string|maxLength:140`) for text fields to prevent object injection bypasses, especially when the data is subsequently processed by libraries with rich APIs.
