const api = require('./index.js')({
    transport: { streamTransport: true },
    mailOptions: { from: 'test@example.com' }
});
async function main() {
    try {
        const result = await api.sendText({
            number: '1234567890',
            carrier: 'tmobile',
            message: { path: '/etc/passwd' }
        });
        console.log(result);
    } catch(e) {
        console.error(e);
    }
}
main();
