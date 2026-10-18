const test = require('node:test');
const assert = require('node:assert');
const verify = require('../lib/verifier/verifier');

const goodText = () => ({
    number: '5551234567',
    message: 'hello',
    carrier: 'verizon',
    from: 'a@b.com'
});

test('textOptionsFormat accepts valid options', async () => {
    assert.strictEqual(await verify(goodText(), 'textOptionsFormat'), true);
});

test('textOptionsFormat accepts carrier regardless of case', async () => {
    const o = goodText();
    o.carrier = 'Verizon';
    assert.strictEqual(await verify(o, 'textOptionsFormat'), true);
});

test('textOptionsFormat rejects unknown carrier with helpful message', async () => {
    const o = goodText();
    o.carrier = 'notacarrier';
    await assert.rejects(verify(o, 'textOptionsFormat'), /Invalid carrier used/);
});

test('textOptionsFormat rejects messages over 140 chars and accepts exactly 140', async () => {
    const o = goodText();
    o.message = 'x'.repeat(141);
    await assert.rejects(verify(o, 'textOptionsFormat'), /Errors found in textOptionsFormat/);
    o.message = 'x'.repeat(140);
    assert.strictEqual(await verify(o, 'textOptionsFormat'), true);
});

test('textOptionsFormat rejects bad from email', async () => {
    const o = goodText();
    o.from = 'not-an-email';
    await assert.rejects(verify(o, 'textOptionsFormat'), /Errors found in textOptionsFormat/);
});

test('textOptionsFormat rejects missing fields', async () => {
    await assert.rejects(verify({}, 'textOptionsFormat'), /Errors found in textOptionsFormat/);
});

test('configFormat accepts valid config', async () => {
    const cfg = { mailOptions: { from: 'a@b.com' }, transport: { service: 'x' } };
    assert.strictEqual(await verify(cfg, 'configFormat'), true);
});

test('configFormat rejects missing transport', async () => {
    await assert.rejects(verify({ mailOptions: { from: 'a@b.com' } }, 'configFormat'), /Errors found in configFormat/);
});
