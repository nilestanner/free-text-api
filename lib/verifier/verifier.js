const Validator = require('node-input-validator');
const carrierLookups = Object.keys(require('../carrier-lookup/barrel.js'));
const carriers = require('../../const/barrel.js').emails.getPossibleCarriers();

const textOptionsFormat = {
    'number': 'required|phoneNumber' ,
    'message':'required|maxLength:140',
    'carrier':'required|carrier',
    'from': 'required|email'
};

const configFormat = {
    'mailOptions.from': 'required|email',
    'transport': 'required|object'
}

const validationFormats = {
    textOptionsFormat,
    configFormat
};

Validator.messages({
    'carrier': `Invalid carrier used, Please use one of the following:\n${carriers.join('\n')}`,
    'carrierLookup': `Invalid carrier lookup method,  Please use one of the following:\n${carrierLookups.join('\n')}`
});

Validator.extend('carrierLookup', async function (field, value) {
    if(carrierLookups.includes(value.toLowerCase())){
        return true;
    }
    this.validator.addError(field, 'carrierLookup');
    return false;
});

Validator.extend('carrier', async function (field, value) {
    if(carriers.includes(value.toLowerCase())){
        return true;
    }
    this.validator.addError(field, 'carrier');
    return false;
});

const verify = async (obj, objType) => {
    const validator = new Validator(obj, validationFormats[objType]);
    const valid = await validator.check();
    if (!valid) {
        throw `\n\nErrors found in ${objType}:\n${validatorErrorsToString(validator.errors)}\n`;
    }
    return valid;
}

const validatorErrorsToString = (errors) => {
    return Object.keys(errors).map(key => {
        return errors[key].message;
    }).join('\n');
}

module.exports = verify;