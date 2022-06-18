const userSessionDb = require('./user-session-db.js')

const create = async (realm, http_session_id, user_id, authenticated_username, authenticate_time) => {
    return await userSessionDb.insert({realm, http_session_id, user_id, authenticated_username, authenticate_time})
}

const terminate = async (id) => {
    return await userSessionDb.removeOne(id)
}

const findByServerSession = async (serverSession) => {
    if (!serverSession) throw new Error('Invalid cookie')
    let parsed = serverSession.split('/')
    if (!parsed || parsed.length !== 3) throw new Error('Invalid cookie')
    let realm = parsed[0]
    let user_id = parsed[1]
    let http_session_id = parsed[2]
    let userSession = userSessionDb.findDynamically({realm, user_id, http_session_id})
    if (!userSession || !userSession._id) throw new Error(`Not found user session`)
    return userSession
}

module.exports = {create, terminate, findByServerSession}