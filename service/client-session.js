const clientSessionDb = require('../repository/client-session-db.js')

const defaultScope = 'email profile'

const create = async (realm, client_id, scope, request_state, http_session_id) => {
    scope = scope || defaultScope
    try {
        return await clientSessionDb.insert({realm, client_id, scope, request_state, http_session_id})
    } catch (e) {
        throw e
    }
}

const terminate = async (id) => {
    try {
        return await clientSessionDb.removeOne(id)
    } catch (e) {
        throw e
    }
}

const findOne = async (id) => {
    return await clientSessionDb.findById(id)
}

module.exports = {create, findOne, terminate}