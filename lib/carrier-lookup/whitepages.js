const request = require('request');

const lookupNumber = (config, number, country = config.defaultCountry || 'US') => {
    return new Promise((resolve, reject) => {
        const url = `https://proapi.whitepages.com/3.0/phone_intel?api_key=${encodeURIComponent(config.apiKey)}&phone.country_hint=${encodeURIComponent(country)}&phone=${encodeURIComponent(number)}`;
        request.get(url, (err, res, body) => {
            if (err) {
                return reject(`There was an error with the whitepages API:
                Error: ${err}`);
            }
            let json;
            try {
                json = JSON.parse(body);
            } catch (parseErr) {
                // Prevent unhandled exception (DoS) if API returns non-JSON
                return reject(`There was an error parsing the whitepages API response:
                Error: ${parseErr}`);
            }
            json.valid = true;
            resolve(json);
        });
    });
}

module.exports = lookupNumber;
