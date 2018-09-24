const verifyMessage = (message) => {
    const result = {
        valid: message.length < 140
    }
    if (!result.valid) {
        result.reason = 'The message must not exceed 140 characters';
    }
    return result; 
}

module.exports = verifyMessage;