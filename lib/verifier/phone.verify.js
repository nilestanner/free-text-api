const verifyPhoneNumber = (number) => {
    const result = {
        valid: true
    }
    if (typeof number === 'number') {
        number = number + '';
    }
    if (typeof parseInt(number) !== 'number') {
        result.valid = false;
        result.reason = `${number} is not a valid number, contains non numeric characters`;
        return result;
    }
    if (number.length !== 10) {
        result.valid = false;
        result.reason = `${number} is the incorrect length, it must be 10 digits long`;
        return result;
    }
    return result;
}

module.exports = verifyPhoneNumber;