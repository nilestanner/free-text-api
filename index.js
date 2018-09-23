const fs = require('fs');
const config = require('./config.js');
const carrierLookup = require('./lib/carrier-lookup/barrel.js');
const consts = require('./const/barrel.js');
const nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
const transporter = nodemailer.createTransport(config.transport.sendGrid);


const sendText = (number, message, country) => {
    carrierLookup[config.carrierLookup.method](number).then((carrierInfo) => {
        if (carrierInfo.valid) {
            const carrier = consts.verifiers[config.carrierLookup.method][carrierInfo.carrier];
            console.log(carrier);
            const emailPostFix = consts.emails[carrier].sms;
            console.log(emailPostFix);
            const email = `${number}${emailPostFix}`;
            mail(email, message);
        }
    })
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

// sendText(123, 'cool test');

