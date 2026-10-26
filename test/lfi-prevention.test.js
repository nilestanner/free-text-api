const test = require('node:test');
const assert = require('node:assert');
const verify = require('../lib/verifier/verifier');
const Validator = require('node-input-validator');

// Register custom rules globally for the tests to work standalone
Validator.extend('carrierLookup', async function (field, value) { return true; });
Validator.extend('carrier', async function (field, value) { return true; });
Validator.extend('phoneNumber', async function (field, value) { return true; });

test('verify should block object injection on message field to prevent LFI', async () => {
    const maliciousOptions = {
        number: '1234567890',
        carrier: 'verizon',
        from: 'test@example.com',
        message: { path: 'package.json' }
    };

    await assert.rejects(
        verify(maliciousOptions, 'textOptionsFormat'),
        /The message must be a string/
    );
});

test('verify should allow string message', async () => {
    const validOptions = {
        number: '1234567890',
        carrier: 'verizon',
        from: 'test@example.com',
        message: 'This is a test message'
    };

    // verify throws on failure, returns truthy on success
    const result = await verify(validOptions, 'textOptionsFormat');
    assert.strictEqual(result, true);
});
