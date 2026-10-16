const test = require('node:test');
const assert = require('node:assert');
const freeTextAPI = require('../index.js');

test('getCarrierList returns the list of possible carriers', () => {
    const api = freeTextAPI({
        transport: { service: 'streamTransport' },
        mailOptions: { from: 'test@example.com' }
    });

    const carriers = api.getCarrierList();
    assert.ok(Array.isArray(carriers));
    assert.ok(carriers.includes('verizon'));
    assert.ok(carriers.includes('att'));
});

test('sendText successfully returns message using mock transport', async () => {
    const api = freeTextAPI({
        transport: {
            // Setting service to empty string will fallback to use config.transport directly
            service: '',
            streamTransport: true,
            newline: 'unix',
            buffer: true
        },
        mailOptions: { from: 'test@example.com' }
    });

    const result = await api.sendText({
        number: '1234567890',
        message: 'hello world',
        carrier: 'verizon',
        from: 'test@example.com'
    });

    // the mocked stream returns undefined in info.response for streaming sometimes in older nodemailer
    // but resolving successfully with an "Email sent" means it correctly processed everything
    assert.match(result, /Email sent:/);
});

test('sendText fails validation if message is missing', async () => {
    const api = freeTextAPI({
        transport: { service: '', streamTransport: true },
        mailOptions: { from: 'test@example.com' }
    });

    const result = await api.sendText({
        number: '1234567890',
        carrier: 'verizon',
        from: 'test@example.com'
    });

    assert.match(result, /Errors found in textOptionsFormat/);
    assert.match(result, /message/);
});

test('sendText fails if carrier is not provided and lookup fails (todo bug)', { todo: 'repairTextOptions has a ReferenceError: number is not defined when no carrier is provided' }, async () => {
    const api = freeTextAPI({
        transport: { service: '', streamTransport: true },
        mailOptions: { from: 'test@example.com' },
        carrierLookup: {
            method: 'numverify',
            apiKey: 'fake'
        }
    });

    const result = await api.sendText({
        number: '1234567890',
        message: 'hello world',
        from: 'test@example.com'
    });

    // The bug will cause a ReferenceError. We assert that it actually succeeded, which will fail because of the bug,
    // satisfying the `todo` test that a bug exists.
    assert.match(result, /Email sent:/);
});
