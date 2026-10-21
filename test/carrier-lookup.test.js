const test = require('node:test');
const assert = require('node:assert');
const request = require('request');
const lookups = require('../lib/carrier-lookup/barrel.js');
const consts = require('../const/barrel.js');

test('barrel exposes numverify and whitepages lookups', () => {
    assert.deepStrictEqual(Object.keys(lookups).sort(), ['numverify', 'whitepages']);
});

test('numverify builds the validate URL and parses the JSON body', async (t) => {
    const get = t.mock.method(request, 'get', (url, cb) => cb(null, {}, JSON.stringify({ valid: true, carrier: 'AT&T Mobility LLC' })));
    const res = await lookups.numverify({ apiKey: 'KEY', defaultCountry: 'US' }, '5551234567');
    assert.deepStrictEqual(res, { valid: true, carrier: 'AT&T Mobility LLC' });
    assert.strictEqual(get.mock.calls[0].arguments[0],
        'https://apilayer.net/api/validate?access_key=KEY&number=5551234567&country_code=US');
});

test('numverify explicit country overrides defaultCountry', async (t) => {
    const get = t.mock.method(request, 'get', (url, cb) => cb(null, {}, '{}'));
    await lookups.numverify({ apiKey: 'KEY', defaultCountry: 'US' }, '1', 'CA');
    assert.match(get.mock.calls[0].arguments[0], /country_code=CA$/);
});

test('whitepages builds the phone_intel URL, defaults country to US, and marks result valid', async (t) => {
    const get = t.mock.method(request, 'get', (url, cb) => cb(null, {}, JSON.stringify({ carrier: 'Verizon Wireless' })));
    const res = await lookups.whitepages({ apiKey: 'KEY' }, '5551234567');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.carrier, 'Verizon Wireless');
    assert.strictEqual(get.mock.calls[0].arguments[0],
        'https://proapi.whitepages.com/3.0/phone_intel?api_key=KEY&phone.country_hint=US&phone=5551234567');
});

test('carrier name mappings point at carriers the email table supports', () => {
    const supported = consts.emails.getPossibleCarriers();
    for (const [method, mapping] of Object.entries(consts.verifiers)) {
        for (const [name, carrier] of Object.entries(mapping)) {
            assert.ok(supported.includes(carrier), `${method}: "${name}" -> "${carrier}" unsupported`);
        }
    }
});

test('numverify rejects with error when request fails', async (t) => {
    t.mock.method(request, 'get', (url, cb) => cb(new Error('network down')));
    await assert.rejects(
        lookups.numverify({ apiKey: 'KEY' }, '5551234567'),
        /There was an error with the numVerify API/
    );
});

test('numverify invalid JSON response rejects properly', async (t) => {
    t.mock.method(request, 'get', (url, cb) => process.nextTick(() => cb(null, {}, 'not json')));
    await assert.rejects(
        lookups.numverify({ apiKey: 'KEY' }, '5551234567'),
        /There was an error parsing the numVerify API response/
    );
});

test('whitepages rejects with error when request fails', async (t) => {
    t.mock.method(request, 'get', (url, cb) => cb(new Error('network down')));
    await assert.rejects(
        lookups.whitepages({ apiKey: 'KEY' }, '5551234567'),
        /There was an error with the whitepages API/
    );
});

test('whitepages invalid JSON response rejects properly', async (t) => {
    t.mock.method(request, 'get', (url, cb) => process.nextTick(() => cb(null, {}, 'not json')));
    await assert.rejects(
        lookups.whitepages({ apiKey: 'KEY' }, '5551234567'),
        /There was an error parsing the whitepages API response/
    );
});
