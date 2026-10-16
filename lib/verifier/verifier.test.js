const test = require('node:test');
const assert = require('node:assert');
const verify = require('./verifier.js');

test('verifier format with valid data', async () => {
    const valid = await verify({
        number: '1234567890',
        message: 'test',
        carrier: 'verizon',
        from: 'test@example.com'
    }, 'textOptionsFormat');
    assert.strictEqual(valid, true);
});
