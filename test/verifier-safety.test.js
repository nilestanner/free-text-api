const test = require('node:test');
const assert = require('node:assert');
const verify = require('../lib/verifier/verifier');
const freeText = require('../index.js');

test('verify handles undefined and null objects safely', async () => {
    await assert.rejects(verify(undefined, 'configFormat'), /Errors found in configFormat/);
    await assert.rejects(verify(null, 'configFormat'), /Errors found in configFormat/);
});

test('freeText instantiation handles undefined config gracefully without crashing synchronously', async () => {
    assert.doesNotThrow(() => {
        freeText(undefined);
    });

    // Allow the promise rejection in background to finish safely
    await new Promise(resolve => setTimeout(resolve, 10));
});

test('freeText.sendText handles undefined config gracefully', async () => {
    const api = freeText(undefined);
    const result = await api.sendText({ number: '5551234567', message: 'test', carrier: 'verizon' });
    assert.match(result, /Errors found in configFormat/);
});
