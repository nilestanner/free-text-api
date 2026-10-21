const test = require('node:test');
const assert = require('node:assert');
const freeText = require('../index.js');

test('sendText handles missing mailOptions gracefully without throwing synchronously (bug present)', { todo: 'repairTextOptions crashes if config.mailOptions is undefined' }, async () => {
    const api = freeText({ transport: { service: 'test' } });
    const result = await api.sendText({ number: '1234567890', message: 'test', carrier: 'verizon' });
    assert.match(result, /Errors found in configFormat/);
});

test('constructor handles missing transport gracefully without throwing synchronously (bug present)', { todo: 'index crashes if config.transport is undefined' }, () => {
    assert.doesNotThrow(() => {
        freeText({ mailOptions: { from: 'a@b.com' } });
    });
});

test('constructor swallows config validation unhandled rejection if sendText is never called', async () => {
    // Missing mailOptions but we don't call sendText, the promise should reject internally but not crash the process.
    freeText({ transport: { service: 'test' } });
    // Let event loop drain to process any unhandled rejections
    await new Promise(r => setTimeout(r, 10));
});

test('constructor accepts valid configs with minimal required fields', () => {
    assert.doesNotThrow(() => {
        freeText({
            mailOptions: { from: 'valid@example.com' },
            transport: { service: 'test' }
        });
    });
});
