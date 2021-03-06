const fs = require('fs');
// const config = require('./config.js');
const carrierLookup = require('./lib/carrier-lookup/barrel.js');
const consts = require('./const/barrel.js');
const nodemailer = require('nodemailer');
const verify = require('./lib/verifier/verifier');
const sgTransport = require('nodemailer-sendgrid-transport');

module.exports = (config) => {
    verify(config, 'configFormat');

    let transporter;
    if (config.transport.service.toLowerCase() === 'sendgrid') {
        transporter = nodemailer.createTransport(sgTransport(config.transport));
    } else {
        transporter = nodemailer.createTransport(config.transport);
    }
    
    const sendText = async (options) => {
        options = await repairTextOptions(options);
        try {
            const verifyResult = await verify(options, 'textOptionsFormat');
            options.email = formatEmail(options);
            const result = await mail(options);
            return result;
        } 
        catch (ex) {
            return ex.toString();
        }
    }

    const repairTextOptions = async (options) => {
        if (!options.from) {
            options.from = config.mailOptions.from;
        }
        if (!options.carrier) {
            options.carrier = await getCarrier(number);
        }
        options.number = options.number + '';
        return options;
    }
    
    const getCarrier = async (number) => {
        if (!config.carrierLookup || !config.carrierLookup.method || !config.carrierLookup.apiKey) {
            throw 'No Carrier method was provided in the config and no Carrier was provided in the request';
        }
        const carrierInfo = await carrierLookup[config.carrierLookup.method.toLowerCase()](config.carrierLookup, number);
        if (carrierInfo.valid) {
            const carrier = consts.verifiers[config.carrierLookup.method][carrierInfo.carrier];
            return carrier;
        }
        throw `Number is not valid, check number or carrier lookup configuration`;
    }
    
    const formatEmail = ({number, country, carrier}) => {
        const emailPostFix = consts.emails.getDomain(carrier, 'sms');
        const email = `${number}${emailPostFix}`;
        return email;
    } 
    
    const mail = ({email, message, from, subject}) => {
        return new Promise((resolve, reject) => {
            const mailOptions = {
                subject: subject || 'Message from free-text-api',
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

    const getCarrierList = () => {
        return consts.emails.getPossibleCarriers();
    }

    return {
        sendText,
        getCarrierList
    };
}
