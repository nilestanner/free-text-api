const verifiers = {
    'numverify':require('./numverify.carrierlookup.js'),
    'whitepages':require('./whitepages.carrierlookup.js')
}
module.exports = {
    verifiers,
    emails: require('./text-emails.js')
}