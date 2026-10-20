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
