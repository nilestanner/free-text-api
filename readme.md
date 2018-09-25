#Free text API
Ever wanted to send texts from your application but didn't want to pay for services like Twilio? This library's goal was to provide a way to do just that!

## Installation 
```
npm install free-text-api
```

## How does it work?

This is all possible because many major cell phone carriers allow users to send emails to phone numbers! The library will do all of the sorting and what not for you, however you will need to provide some configuration.

## Carrier look ups (optional)

You can go without this configuration if you already know the carrier for the number you are sending to.

Otherwise you can sign up for one of the following supported APIs:

* [NumVerify](https://numverify.com/)

## Outbound emails

Next you will need to add a emailing service to your application. 

* [Ethereal](https://ethereal.email/) (use for testing. Messages will not actually send)
* [Sendgrid](https://app.sendgrid.com/guide/integrate/langs/smtp)

## Some sample code



```
const freeTextAPI = require('free-text-api');

const textService = freeTextAPI({
    carrierLookup: { // this should include all the nessisary configurations for your carrier lookup
        method: 'numverify',
        apiKey: '####',
        defaultCountry: 'US',
        path: 'http://apilayer.net/api/validate'
    },
    mailOptions: { // this is optional, but if you go without you must provide a from when sending a text!
        from: 'noreply@freetexter.com'
    },
    transport: { // I have provided an exmaple for sendgrid, however this object can be formatted as any valid transport config object for nodeMailer
        service: 'SendGrid',
        auth: {
            user: 'user',
            pass: '****'
        }
    }
});

textService.sendText({
    number: 1234567890, // 10-digit phone number
    message:'Hello from the text service', // message no longer than 140 characters
    carrier:'Verizon', // optional, carrier name case-insensitive
    from: 'test@test.com' // optional, from email address (email format works best)
}).then((result) => {
    console.log(result);
});
```

