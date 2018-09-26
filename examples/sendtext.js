const freeTextAPI = require('../index.js');
// const freeTextAPI = require('free-text-api');  // use when installing with npm

const textService = freeTextAPI({
    carrierLookup: {
        method: 'numverify',
        apiKey: '####',
        defaultCountry: 'US',
        path: 'http://apilayer.net/api/validate'
    },
    mailOptions: {
        from: 'noreply@freetexter.com'
    },
    transport: {
        service: 'SendGrid',
        auth: {
            user: 'user',
            pass: '****'
        }
    }
});

textService.sendText({
    number: 1234567890,
    message:'Hello from the text service',
    carrier:'Verizon',
    from: 'test@test.com'
}).then((result) => {
    console.log(result);
});