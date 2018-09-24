const verifyPhoneNumber = require('./phone.verify');
const verifyCarrier = require('./carrier.verify');
const verifyMessage = require('./message.verify');

const verify = ({number, message, carrier}) => {
    const numberResult = verifyPhoneNumber(number);
    if (!numberResult.valid) {
        return numberResult;
    }
    const messageResult = verifyMessage(message);
    if (!messageResult.valid) {
        return messageResult;
    }
    const carrierResult = verifyCarrier(carrier);
    if (!carrierResult.valid) {
        return carrierResult;
    }
    return {
        valid: true
    };
}

module.exports = verify;