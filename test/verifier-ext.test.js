const test = require('node:test');
const assert = require('node:assert');
const Validator = require('node-input-validator');
const verify = require('../lib/verifier/verifier');

test('carrier validation rule rejects unknown carrier', async () => {
    const v = new Validator({ carrier: 'unknown' }, { carrier: 'carrier' });
    assert.strictEqual(await v.check(), false);
    assert.match(v.errors.carrier.message, /Invalid carrier used/);
});

test('carrierLookup validation rule rejects unknown lookup', async () => {
    const v = new Validator({ method: 'unknown' }, { method: 'carrierLookup' });
    assert.strictEqual(await v.check(), false);
    assert.match(v.errors.method.message, /Invalid carrier lookup method/);
});
