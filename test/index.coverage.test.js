const test = require('node:test');
const assert = require('node:assert');
const request = require('request');
const freeTextAPI = require('../index.js');

test('sendText covers options initialization', async () => {
    const api = freeTextAPI({
        mailOptions: { from: 'hello@example.com' },
        transport: { service: 'streamTransport' }
    });

    await assert.rejects(api.sendText(null), /No Carrier method was provided/);
});

test('repairTextOptions undefined config handles options.from', async (t) => {
    const config = {
        mailOptions: { from: 'hello@example.com' },
        transport: { service: 'streamTransport', jsonTransport: true },
        carrierLookup: { method: 'numverify', apiKey: 'fake' }
    };
    const api = freeTextAPI(config);

    // Bypassing async initialization without timers: wait for setImmediate to ensure
    // internal configValidation promise chain has started/resolved.
    await new Promise(setImmediate);
    delete config.mailOptions;

    t.mock.method(request, 'get', (url, cb) => cb(null, {}, JSON.stringify({ valid: true, carrier: 'AT&T Mobility LLC' })));

    // sendText catches verify errors and returns the string, rather than rejecting.
    const result = await api.sendText({ number: '1234567890', message: 'test msg' });
    assert.match(result, /Errors found in textOptionsFormat/);
    assert.match(result, /from/);
});

test('sendText formatEmail failure caught', async (t) => {
    const config = {
        mailOptions: { from: 'hello@example.com' },
        transport: { service: 'streamTransport', jsonTransport: true },
        carrierLookup: { method: 'numverify', apiKey: 'fake' }
    };
    const api = freeTextAPI(config);

    t.mock.method(request, 'get', (url, cb) => cb(null, {}, JSON.stringify({ valid: true, carrier: 'not mapped carrier' })));

    const result = await api.sendText({ number: '1234567890', message: 'test msg' });
    assert.match(result, /Errors found in textOptionsFormat/);
});

test('sendText formatEmail throws internally when carrier is passed but formatEmail breaks', async () => {
    const config = {
        mailOptions: { from: 'hello@example.com' },
        transport: { service: 'streamTransport', jsonTransport: true },
    };
    const api = freeTextAPI(config);
    const result = await api.sendText({ number: '1234567890', message: 'test msg', carrier: 'invalid' });
    assert.match(result, /Errors found in textOptionsFormat/);
});
