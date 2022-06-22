const allowRedirectionDb = require('../repository/allow-redirection-db')

const getRegisteredDomains = async () => {
    return await allowRedirectionDb.findAll()
}

module.exports = {getRegisteredDomains}