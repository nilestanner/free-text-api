## 2024-05-24 - Unhandled Exceptions in Promise Callbacks cause DoS
**Vulnerability:** External HTTP request callbacks (`request.get`) were using `throw` to handle errors.
**Learning:** Throwing inside an asynchronous callback (like `request.get`) does not reject the surrounding Promise. Instead, it creates an uncaught exception which crashes the entire Node.js process, leading to a Denial of Service (DoS) vulnerability.
**Prevention:** Always use `reject()` inside Promise-wrapped asynchronous callbacks (e.g. `request.get` callbacks), and wrap `JSON.parse` or other synchronous operations inside the callback in a `try/catch` block that calls `reject(err)` on failure.
