const fs = require('fs');
const config = require('./config.js');
const carrierLookup = require('./lib/carrier-lookup/barrel.js');
const consts = require('./const/barrel.js');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport(config.transport.sendGrid);
const verify = require('./lib/verifier/verifier');


const sendText = async (options) => {
    const {number, message, country, carrier} = options;
    if (!carrier) {
        options.carrier = await getCarrier(number);
    }
    const verifyResult = verify(options);
    if (!verifyResult.valid) {
        console.log(verifyResult.reason);
    }
    const email = formatEmail(options);
    mail(email, message);
}

const getCarrier = async (number) => {
    const carrierInfo = await carrierLookup[config.carrierLookup.method](number);
    if (carrierInfo.valid) {
        const carrier = consts.verifiers[config.carrierLookup.method][carrierInfo.carrier];
        return carrier;
    }
    return null;
}

const formatEmail = ({number, country, carrier}) => {
    const emailPostFix = consts.emails[carrier].sms;
    const email = `${number}${emailPostFix}`;
    return email;
} 

const mail = (email, message, subject) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: config.mailOptions.from,
            to: email,
            text: message
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              reject(error);
            } else {
              resolve('Email sent: ' + info.response);
            }
        });
    });
}

sendText({number: 123, message: 'I am texting with niles texting service'});

