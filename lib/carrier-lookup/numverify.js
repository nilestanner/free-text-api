const fs = require('fs');
// const config = require('../../config.js').carrierLookup;
const request = require('request');

const lookupNumber = (config, number, country = config.defaultCountry) => {
    return new Promise((resolve, reject) => {
        const url = `https://apilayer.net/api/validate?access_key=${config.apiKey}&number=${number}&country_code=${country}`;
        request.get(url, (err, res, body) => {
            if (err) {
                return reject(`There was an error with the numVerify API:
                Error: ${err}`);
            }
            let json;
            try {
                json = JSON.parse(body);
            } catch (parseErr) {
                // Prevent unhandled exception (DoS) if API returns non-JSON
                return reject(`There was an error parsing the numVerify API response:
                Error: ${parseErr}`);
            }
            resolve(json);
        });
    });
    
}

module.exports = lookupNumber;