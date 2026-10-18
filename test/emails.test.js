const test = require('node:test');
const assert = require('node:assert');
const emails = require('../const/text-emails.js');

test('getPossibleCarriers returns lowercase carrier keys including major US carriers', () => {
    const carriers = emails.getPossibleCarriers();
    for (const c of ['verizon', 'att', 'sprint', 'tmobile']) {
        assert.ok(carriers.includes(c), `missing ${c}`);
    }
    for (const c of carriers) {
        assert.strictEqual(c, c.toLowerCase());
    }
});

test('getDomain defaults to sms and maps known carriers', () => {
    assert.strictEqual(emails.getDomain('verizon'), '@vtext.com');
    assert.strictEqual(emails.getDomain('att', 'sms'), '@txt.att.net');
    assert.strictEqual(emails.getDomain('att', 'mms'), '@mms.att.net');
});

test('getDomain is case-insensitive on carrier', () => {
    assert.strictEqual(emails.getDomain('VeRiZoN', 'mms'), '@vzwpix.com');
});

test('getDomain throws for missing carrier', () => {
    assert.throws(() => emails.getDomain(), /Must provide carrier name/);
});

test('getDomain throws for unknown carrier and lists valid ones', () => {
    assert.throws(() => emails.getDomain('nope'), /nope is invalid, carrier must be one of the following/);
});

test('getDomain throws for invalid message type', () => {
    assert.throws(() => emails.getDomain('verizon', 'fax'), /fax is invalid, message type must be sms or mms/);
});

test('every carrier has an sms domain starting with @', () => {
    for (const c of emails.getPossibleCarriers()) {
        assert.match(emails.getDomain(c, 'sms'), /^@[\w.-]+$/, c);
    }
});

test('every non-empty mms domain starts with @', () => {
    for (const c of emails.getPossibleCarriers()) {
        const d = emails.getDomain(c, 'mms');
        if (d !== '') {
            assert.match(d, /^@[\w.-]+$/, c);
        }
    }
});

// Data quirk: 'republic' has an empty mms gateway, so MMS to it would produce a bare number as the address.
test('republic has an empty mms domain (known data gap)', { todo: 'republic mms gateway is empty in const/text-emails.js' }, () => {
    assert.notStrictEqual(emails.getDomain('republic', 'mms'), '');
});
