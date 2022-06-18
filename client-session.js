const clientSessionDb = require('./client-session-db.js')

const defaultScopes = 'email profile'

const create = async (realm, client_id, scopes, request_state) => {
    if (!scopes) scopes = defaultScopes
    try {
        return await clientSessionDb.insert({realm, client_id, scopes, request_state})
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