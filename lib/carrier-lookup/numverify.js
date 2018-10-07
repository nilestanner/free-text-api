const fs = require('fs');
// const config = require('../../config.js').carrierLookup;
const request = require('request');

const lookupNumber = (config, number, country = config.defaultCountry) => {
    return new Promise((resolve, reject) => {
        const url = `http://apilayer.net/api/validate?access_key=${config.apiKey}&number=${number}&country_code=${country}`;
        request.get(url, (err, res, body) => {
            if (err) {
                throw `There was an error with the numVerify API:
                Error: ${err}`;
            }
            let json = JSON.parse(body);
            resolve(json);
        });
    });
    
}

module.exports = lookupNumber;