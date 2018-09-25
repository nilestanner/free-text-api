const fs = require('fs');
// const config = require('./config.js');
const carrierLookup = require('./lib/carrier-lookup/barrel.js');
const consts = require('./const/barrel.js');
const nodemailer = require('nodemailer');
const verify = require('./lib/verifier/verifier');

module.exports = (config) => {
    const transporter = nodemailer.createTransport(config.transport);

    const sendText = async (options) => {
        const {number, message, country, carrier, from} = options;
        if (!from) {
            options.from = config.mailOptions.from;
        }
        options.carrier = carrier.toLowerCase();
        if (!carrier) {
            options.carrier = await getCarrier(number);
        }
        const verifyResult = verify(options);
        if (!verifyResult.valid) {
            return verifyResult.reason;
        }
        options.email = formatEmail(options);
        const result = await mail(options);
        return result;
    }
    
    const getCarrier = async (number) => {
        const carrierInfo = await carrierLookup[config.carrierLookup.method](config.carrierLookup, number);
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
    
    const mail = ({email, message, from}) => {
        return new Promise((resolve, reject) => {
            const mailOptions = {
                from: from,
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

    return {
        sendText
    };
}
