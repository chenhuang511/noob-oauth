const userSessionDb = require('./user-session-db.js')

const create = async (realm, http_session_id, user_id, authenticated_username, authenticate_time) => {
    return await userSessionDb.insert({realm, http_session_id, user_id, authenticated_username, authenticate_time})
}

const terminate = async (id) => {
    return await userSessionDb.removeOne(id)
}

const findById = async (id) => {
    return userSessionDb.findById(id)
}

module.exports = {create, terminate, findById}