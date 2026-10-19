## 2024-05-18 - `sendText` bug uncovered
**Learning:** `repairTextOptions` relies on a variable `number` that is undefined in its scope. It expects to pull from `options.number` but does not. Also the node native test framework lacks mock/stub functionality, meaning we need to use core node `module:mock` or basic stubbing if we need it.
**Action:** Found a real bug that makes `sendText` fail if `options.carrier` is missing. Will write a failing test with a `todo` annotation as per my instructions.
## 2024-05-18 - Tested index.js coverage improvements
**Learning:** `index.js` coverage went from 0% to 82.76%. Found a ReferenceError bug in `repairTextOptions` since `number` is used instead of `options.number`. Captured via a node test `{ todo: ... }`. Used built-in streamTransport of nodemailer to effectively mock tests locally.
**Action:** Always check internal option object modification logic for scope leaks.
## 2024-10-18 - Avoid DoS and unhandled exceptions in asynchronous `request` callbacks
**Learning:** Functions wrapping `request.get` inside a `Promise` (like in `lib/carrier-lookup/numverify.js` and `whitepages.js`) will cause unhandled exceptions that crash the entire Node process if synchronous operations like `JSON.parse` fail.
**Action:** Always wrap synchronous operations inside a `try/catch` block that calls `reject(err)` inside an asynchronous callback in a Promise, to prevent process crashes. Furthermore, when testing for this, mark it as `todo` so it doesn't crash the test runner.
## 2024-11-20 - Custom `node-input-validator` extension missing test coverage
**Learning:** The custom rule `carrierLookup` registered in `lib/verifier/verifier.js` using `Validator.extend` lacks direct testing in `test/verifier.test.js`.
**Action:** Add tests specifically checking `carrierLookup` rule directly using `node-input-validator` instantiation in `test/verifier.test.js`.
