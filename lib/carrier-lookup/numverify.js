const fs = require('fs');
// const config = require('../../config.js').carrierLookup;
const request = require('request');

const lookupNumber = (config, number, country = config.defaultCountry) => {
    return new Promise((resolve, reject) => {
        const url = `${config.path}?access_key=${config.apiKey}&number=${number}&country_code=${country}`;
        request.get(url, (err, res, body) => {
            if (err) {
                reject(err);
            }
            let json = JSON.parse(body);
            console.dir(json);
            resolve(json);
        });
    });
    
}

module.exports = lookupNumber;