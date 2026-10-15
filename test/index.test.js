const test = require('node:test');
const assert = require('node:assert');
const nodemailer = require('nodemailer');
const request = require('request');
const freeText = require('../index.js');

const baseConfig = () => ({
    mailOptions: { from: 'noreply@example.com' },
    transport: { service: 'test', jsonTransport: true }
});

// Replaces nodemailer.createTransport with a fake that records sent mail.
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

test('constructor validates config', () => {
    // verify() is async, so the rejection is not surfaced synchronously; construction must not throw.
    assert.doesNotThrow(() => freeText(baseConfig()));
});

test('getCarrierList returns supported carriers', (t) => {
    fakeTransport(t);
    const svc = freeText(baseConfig());
    const list = svc.getCarrierList();
    assert.ok(list.includes('verizon'));
    assert.ok(list.includes('att'));
});

test('sendText sends an sms-gateway email when carrier is given', async (t) => {
    const sent = fakeTransport(t);
    const svc = freeText(baseConfig());
    const result = await svc.sendText({
        number: 5551234567,
        message: 'Hello there',
        carrier: 'verizon'
    });
    assert.strictEqual(result, 'Email sent: 250 OK');
    assert.strictEqual(sent.length, 1);
    assert.strictEqual(sent[0].to, '5551234567@vtext.com');
    assert.strictEqual(sent[0].from, 'noreply@example.com');
    assert.strictEqual(sent[0].text, 'Hello there');
    assert.strictEqual(sent[0].subject, 'Message from free-text-api');
});

test('sendText uses the per-message from and subject when provided', async (t) => {
    const sent = fakeTransport(t);
    const svc = freeText(baseConfig());
    await svc.sendText({
        number: '5551234567',
        message: 'hi',
        carrier: 'att',
        from: 'me@example.com',
        subject: 'Custom'
    });
    assert.strictEqual(sent[0].to, '5551234567@txt.att.net');
    assert.strictEqual(sent[0].from, 'me@example.com');
    assert.strictEqual(sent[0].subject, 'Custom');
});

test('sendText returns the validation error string for an invalid carrier', async (t) => {
    const sent = fakeTransport(t);
    const svc = freeText(baseConfig());
    const result = await svc.sendText({ number: '5551234567', message: 'hi', carrier: 'bogus' });
    assert.match(result, /Invalid carrier used/);
    assert.strictEqual(sent.length, 0);
});

test('sendText returns the validation error string for an over-long message', async (t) => {
    const sent = fakeTransport(t);
    const svc = freeText(baseConfig());
    const result = await svc.sendText({ number: '5551234567', message: 'x'.repeat(141), carrier: 'verizon' });
    assert.match(result, /Errors found in textOptionsFormat/);
    assert.strictEqual(sent.length, 0);
});

test('sendText resolves with the error string when the transport fails', async (t) => {
    fakeTransport(t, { fail: true });
    const svc = freeText(baseConfig());
    const result = await svc.sendText({ number: '5551234567', message: 'hi', carrier: 'verizon' });
    assert.match(result, /smtp down/);
});

test('sendGrid service uses the sendgrid transport wrapper', (t) => {
    const spy = t.mock.method(nodemailer, 'createTransport', () => ({ sendMail() {} }));
    freeText({ mailOptions: { from: 'a@b.com' }, transport: { service: 'SendGrid', auth: { api_key: 'k' } } });
    assert.strictEqual(spy.mock.calls.length, 1);
    // sendgrid-transport returns a transport object (with name/send), not the raw config
    assert.notStrictEqual(spy.mock.calls[0].arguments[0].service, 'SendGrid');
});

// Regression: repairTextOptions used to call getCarrier(number) with `number` undefined (ReferenceError).
test('sendText performs carrier lookup when carrier is omitted',
    async (t) => {
        const sent = fakeTransport(t);
        t.mock.method(request, 'get', (url, cb) => cb(null, {}, JSON.stringify({ valid: true, carrier: 'AT&T Mobility LLC' })));
        const cfg = baseConfig();
        cfg.carrierLookup = { method: 'numverify', apiKey: 'k', defaultCountry: 'US' };
        const svc = freeText(cfg);
        const result = await svc.sendText({ number: '5551234567', message: 'hi' });
        assert.strictEqual(result, 'Email sent: 250 OK');
        assert.strictEqual(sent[0].to, '5551234567@txt.att.net');
    });
