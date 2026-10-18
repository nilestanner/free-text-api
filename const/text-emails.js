const getDomain = (carrier, messageType = 'sms') => {
    if (messageType !== 'sms' && messageType !== 'mms') {
        throw `${messageType} is invalid, message type must be sms or mms`;
    }
    const carriers = getPossibleCarriers();
    if (!carrier) {
        throw `Must provide carrier name`;
    }
    carrier = carrier.toLowerCase();
    if (!carriers.includes(carrier)) {
        throw `${carrier} is invalid, carrier must be one of the following: \n ${carriers.join('\n')}`;
    }
    return mapping[carrier][messageType];
}

const getPossibleCarriers = () => {
    return Object.keys(mapping);
}


const mapping = {
    'verizon':{
        'sms':'@vtext.com',
        'mms':'@vzwpix.com'
    },
    'att': {
        'sms':'@txt.att.net',
        'mms':'@mms.att.net'
    },
    'sprint': {
        'sms':'@messaging.sprintpcs.com',
        'mms':'@pm.sprint.com'
    },
    'tmobile': {
        'sms':'@tmomail.net',
        'mms':'@tmomail.net'
    },
    'cricket': {
        'sms':'@sms.mycricket.com',
        'mms':'@mms.mycricket.com'
    },
    'virgin': {
        'sms':'@vmobl.com',
        'mms':'@vmpix.com'
    },
    'tracfone': {
        'sms':'@mmst5.tracfone.com',
        'mms':'@mmst5.tracfone.com'
    },
    'metropcs': {
        'sms':'@mymetropcs.com',
        'mms':'@mymetropcs.com'
    },
    'boost': {
        'sms':'@sms.myboostmobile.com',
        'mms':'@myboostmobile.com'
    },
    'republic': {
        'sms':'@text.republicwireless.com',
        'mms':''
    },
    'googlefi': {
        'sms':'@msg.fi.google.com',
        'mms':'@msg.fi.google.com'
    },
    'uscellular': {
        'sms':'@email.uscc.net',
        'mms':'@mms.uscc.net'
    },
    'ting': {
        'sms':'@message.ting.com',
        'mms':'@message.ting.com'
    },
    'consumercellular': {
        'sms':'@mailmymobile.net',
        'mms':'@mailmymobile.net'
    },
    'cspire': {
        'sms':'@cspire1.com',
        'mms':'@cspire1.com' 
    },
    'pageplus': {
        'sms':'@vtext.com',
        'mms':'@vtext.com' 
    }
};

module.exports = {
    getDomain,
    getPossibleCarriers
}

// Cricket: number@sms.cricketwireless.net (SMS), number@mms.cricketwireless.net (MMS)