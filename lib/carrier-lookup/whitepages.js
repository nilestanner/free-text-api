const request = require('request');

const lookupNumber = (config, number, country = config.defaultCountry || 'US') => {
    return new Promise((resolve, reject) => {
        // Encode URI components to prevent injection vulnerabilities
        const safeApiKey = encodeURIComponent(config.apiKey);
        const safeCountry = encodeURIComponent(country);
        const safeNumber = encodeURIComponent(number);
        const url = `https://proapi.whitepages.com/3.0/phone_intel?api_key=${safeApiKey}&phone.country_hint=${safeCountry}&phone=${safeNumber}`;

        request.get(url, (err, res, body) => {
            if (err) {
                // Reject instead of throw to prevent Unhandled Exception crashes (DoS)
                return reject(new Error(`There was an error with the whitepages API:\n                Error: ${err}`));
            }
            try {
                let json = JSON.parse(body);
                json.valid = true;
                resolve(json);
            } catch (e) {
                reject(new Error(`Invalid JSON from whitepages API: ${e.message}`));
            }
        });
    });
}

module.exports = lookupNumber;
