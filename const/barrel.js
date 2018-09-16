const verifiers = {
    'numverify':require('./numverify.carrierlookup.js')
}
module.exports = {
    verifiers,
    emails: require('./text-emails.js')
}