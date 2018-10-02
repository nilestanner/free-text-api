const request = require('request');

const lookupNumber = (config, number, country = config.defaultCountry) => {
    return new Promise((resolve, reject) => {
        const url = `https://proapi.whitepages.com/3.0/phone_intel?api_key=${config.apiKey}&phone.country_hint=${country}&phone=${number}`;
        request.get(url, (err, res, body) => {
            if (err) {
                reject(err);
            }
            let json = JSON.parse(body);
            json.valid = true;
            resolve(json);
        });
    });
}

module.exports = lookupNumber;
