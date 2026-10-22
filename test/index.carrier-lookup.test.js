const test = require('node:test');
const assert = require('node:assert');
const request = require('request');
const nodemailer = require('nodemailer');
const freeTextAPI = require('../index.js');

const fakeTransport = (t, { fail } = {}) => {
    const sent = [];
    t.mock.method(nodemailer, 'createTransport', () => ({
        sendMail: (opts, cb) => {
            sent.push(opts);
            if (fail) return cb(new Error('smtp down'));
            cb(null, { response: '250 OK' });
        }
    }));
    return sent;
};

test('getCarrier throws when carrierLookup config is missing (caught internally)', async () => {
    const api = freeTextAPI({
        transport: { service: '', streamTransport: true },
        mailOptions: { from: 'test@example.com' }
    });

    // repairTextOptions has a bug that uses global number instead of options.number
    // but exceptions in repairTextOptions are NOT caught by sendText try-catch
    global.number = '1234567890';
    try {
        await assert.rejects(
            api.sendText({ number: '1234567890', message: 'hi' }),
            /No Carrier method was provided in the config/
        );
    } finally {
        delete global.number;
    }
});

test('getCarrier throws when lookup returns invalid number (caught internally)', async (t) => {
    t.mock.method(request, 'get', (url, cb) => cb(null, {}, JSON.stringify({ valid: false })));

    const api = freeTextAPI({
        transport: { service: '', streamTransport: true },
        mailOptions: { from: 'test@example.com' },
        carrierLookup: { method: 'numverify', apiKey: 'fake' }
    });

    global.number = '1234567890';
    try {
        await assert.rejects(
            api.sendText({ number: '1234567890', message: 'hi' }),
            /Number is not valid/
        );
    } finally {
        delete global.number;
    }
});

test('getCarrier succeeds and returns carrier', async (t) => {
    t.mock.method(request, 'get', (url, cb) => cb(null, {}, JSON.stringify({ valid: true, carrier: 'AT&T Mobility LLC' })));
    fakeTransport(t);

    const api = freeTextAPI({
        transport: { service: '', streamTransport: true },
        mailOptions: { from: 'test@example.com' },
        carrierLookup: { method: 'numverify', apiKey: 'fake' }
    });

    global.number = '1234567890';
    try {
        const result = await api.sendText({ number: '1234567890', message: 'hi' });
        assert.match(result, /Email sent:/);
    } finally {
        delete global.number;
    }
});

test('carrierCache returns cached promise for duplicate lookups', async (t) => {
    let requestCount = 0;
    t.mock.method(request, 'get', (url, cb) => {
        requestCount++;
        setTimeout(() => {
            cb(null, {}, JSON.stringify({ valid: true, carrier: 'AT&T Mobility LLC' }));
        }, 10);
    });
    fakeTransport(t);

    const api = freeTextAPI({
        transport: { service: '', streamTransport: true },
        mailOptions: { from: 'test@example.com' },
        carrierLookup: { method: 'numverify', apiKey: 'fake' }
    });

    await Promise.all([
        api.sendText({ number: '1234567890', message: 'hi' }),
        api.sendText({ number: '1234567890', message: 'hi' })
    ]);

    await api.sendText({ number: '1234567890', message: 'hi' });

    assert.strictEqual(requestCount, 1);
});

test('carrierCache removes failed lookups from cache so they can be retried', async (t) => {
    let requestCount = 0;
    let failRequest = true;
    t.mock.method(request, 'get', (url, cb) => {
        requestCount++;
        if (failRequest) {
            cb(null, {}, JSON.stringify({ valid: false }));
        } else {
            cb(null, {}, JSON.stringify({ valid: true, carrier: 'AT&T Mobility LLC' }));
        }
    });
    fakeTransport(t);

    const api = freeTextAPI({
        transport: { service: '', streamTransport: true },
        mailOptions: { from: 'test@example.com' },
        carrierLookup: { method: 'numverify', apiKey: 'fake' }
    });

    await assert.rejects(api.sendText({ number: '0987654321', message: 'hi' }));
    assert.strictEqual(requestCount, 1);

    failRequest = false;
    await api.sendText({ number: '0987654321', message: 'hi' });
    assert.strictEqual(requestCount, 2);
});

test('carrierCache evicts oldest entry when exceeding 1000 items', async (t) => {
    let requestCount = 0;
    t.mock.method(request, 'get', (url, cb) => {
        requestCount++;
        cb(null, {}, JSON.stringify({ valid: true, carrier: 'AT&T Mobility LLC' }));
    });
    fakeTransport(t);

    const api = freeTextAPI({
        transport: { service: '', streamTransport: true },
        mailOptions: { from: 'test@example.com' },
        carrierLookup: { method: 'numverify', apiKey: 'fake' }
    });

    const promises = [];
    for (let i = 0; i < 1000; i++) {
        promises.push(api.sendText({ number: "1000000" + i.toString().padStart(3, '0'), message: 'hi' }));
    }
    await Promise.all(promises);
    assert.strictEqual(requestCount, 1000);

    await api.sendText({ number: '2000000000', message: 'hi' });
    assert.strictEqual(requestCount, 1001);

    await api.sendText({ number: '1000000000', message: 'hi' });
    assert.strictEqual(requestCount, 1002);
});
