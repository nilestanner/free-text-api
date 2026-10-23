const fs = require('fs');
// const config = require('./config.js');
const consts = require('./const/barrel.js');

const verify = require('./lib/verifier/verifier');

module.exports = (config) => {
    // Capture validation promise to enforce securely before sending text
    const configValidation = verify(config, 'configFormat');

    // ⚡ Bolt: Cache carrier lookups to prevent duplicate expensive external API requests
    const carrierCache = new Map();
    // Prevent unhandled promise rejection DoS if sendText is never called
    configValidation.catch(() => {});

    let transporter;
    const getTransporter = () => {
        if (!transporter) {
            // ⚡ Bolt: Lazily require nodemailer and defer transport creation until first send to save ~50ms on startup
            const nodemailer = require('nodemailer');
            if (config && config.transport && config.transport.service && config.transport.service.toLowerCase() === 'sendgrid') {
                const sgTransport = require('nodemailer-sendgrid-transport');
                transporter = nodemailer.createTransport(sgTransport(config.transport));
            } else {
                transporter = nodemailer.createTransport((config && config.transport) || {});
            }
        }
        return transporter;
    };

    
    const sendText = async (options) => {
        // Verify config first to prevent crashes on malformed configs
        try {
            await configValidation;
        } catch (ex) {
            return ex.toString();
        }

        options = options || {};
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
            options.from = (config && config.mailOptions) ? config.mailOptions.from : undefined;
        }
        if (!options.carrier) {
            options.carrier = await getCarrier(options.number);
        }
        options.number = options.number + '';
        return options;
    }
    
    const getCarrier = async (number) => {
        if (!config.carrierLookup || !config.carrierLookup.method || !config.carrierLookup.apiKey) {
            throw 'No Carrier method was provided in the config and no Carrier was provided in the request';
        }

        const numberStr = String(number);
        if (carrierCache.has(numberStr)) {
            return carrierCache.get(numberStr);
        }

        const fetchCarrier = async () => {
            // ⚡ Bolt: Lazily require carrierLookup (and `request` lib) to save ~100ms on startup for users not doing lookups
            const carrierLookup = require('./lib/carrier-lookup/barrel.js');
            const carrierInfo = await carrierLookup[config.carrierLookup.method.toLowerCase()](config.carrierLookup, numberStr);
            if (carrierInfo.valid) {
                const carrier = consts.verifiers[config.carrierLookup.method][carrierInfo.carrier];
                return carrier;
            }
            throw `Number is not valid, check number or carrier lookup configuration`;
        };

        const fetchPromise = fetchCarrier();

        // Remove from cache if the API request fails so we can retry later
        fetchPromise.catch(() => carrierCache.delete(numberStr));

        // Prevent memory leaks by capping cache at 1000 entries
        if (carrierCache.size >= 1000) {
            carrierCache.delete(carrierCache.keys().next().value);
        }
        carrierCache.set(numberStr, fetchPromise);

        return fetchPromise;
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
            getTransporter().sendMail(mailOptions, (error, info) => {
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
