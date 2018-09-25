const freeTextAPI = require('../index.js');
// const freeTextAPI = require('free-text-api');  // use when installing with npm

const textService = freeTextAPI({
    carrierLookup: {
        method:'numverify',
        apiKey:'***REMOVED***',
        defaultCountry: 'US',
        path:'http://apilayer.net/api/validate'
    },
    mailOptions: {
        from: 'noreply@freetexter.com'
    },
    transport: {
        service: 'SendGrid',
        auth: {
            user: '***REMOVED***',
            pass: '***REMOVED***'
        }
    }
});

textService.sendText({
    number:***REMOVED***,
    message:'Hello from the text service',
    carrier:'Verizon',
    from: 'test@test.com'
}).then((result) => {
    console.log(result);
});