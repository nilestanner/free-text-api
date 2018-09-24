const carriers = require('../../const/text-emails.js')
const verifyCarrier = (carrier) => {
    const result = {
        valid: carriers[carrier] !== null || carriers[carrier] !== undefined
    }
    if (!result.valid) {
        result.reason = `${carrier} is not a supported carrier`;
    }
    return result;
}

module.exports = verifyCarrier;