const fs = require('fs');
// const config = require('../../config.js').carrierLookup;
const request = require('request');

const lookupNumber = (config, number, country = config.defaultCountry) => {
    return new Promise((resolve, reject) => {
        // Encode URI components to prevent injection vulnerabilities
        const safeApiKey = encodeURIComponent(config.apiKey);
        const safeNumber = encodeURIComponent(number);
        const safeCountry = encodeURIComponent(country);
        // Use https to prevent unencrypted transmission
        const url = `https://apilayer.net/api/validate?access_key=${safeApiKey}&number=${safeNumber}&country_code=${safeCountry}`;

        request.get(url, (err, res, body) => {
            if (err) {
                // Reject instead of throw to prevent Unhandled Exception crashes (DoS)
                return reject(new Error(`There was an error with the numVerify API:\n                Error: ${err}`));
            }
            try {
                let json = JSON.parse(body);
                resolve(json);
            } catch (e) {
                reject(new Error(`Invalid JSON from numVerify API: ${e.message}`));
            }
        });
    });
    
}

module.exports = lookupNumber;