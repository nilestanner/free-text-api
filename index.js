const fs = require('fs');
const config = require('./config.js');
const carrierLookup = require('./lib/carrier-lookup/barrel.js');
const consts = require('./const/barrel.js');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport(config.transport.configUrl);


const sendText = (number, message, country) => {
    carrierLookup[config.carrierLookup.method](number).then((carrierInfo) => {
        if (carrierInfo.valid) {
            const carrier = consts.verifiers[config.carrierLookup.method][carrierInfo.carrier];
            console.log(carrier);
            const emailPostFix = consts.emails[carrier].sms;
            console.log(emailPostFix);
            const mailOptions = {
                from: config.transport.email,
                to: `1${number}${emailPostFix}`,
                subject: 'Sending Email using Node.js',
                text: 'That was easy!'
            };
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
            });
        }
    })
}

sendText(***REMOVED***, 'test');
