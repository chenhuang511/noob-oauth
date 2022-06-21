const authCodeDb = require('../repository/auth-code-db.js')
const constants = require('../constants.js')

const lifeSpanInSeconds = constants.authorization_code_expiration / 1000

const create = async (code, client_id) => {
    let create_time = Math.floor(new Date().getTime() / 1000)
    let expire_time = create_time + lifeSpanInSeconds
    return authCodeDb.insert({code, client_id, create_time, expire_time})
}

const checkValidCode = async (code, client_id) => {
    if (!code) return false
    let tmp = code.split('.')
    if (!tmp || tmp.length !== 3)
        return false
    let authCode = await authCodeDb.findByCode(code)
    if (!authCode || !authCode._id)
        return false
    if (client_id !== authCode.client_id)
        return false
    let expire_time = authCode.expire_time
    let now = Math.floor(new Date().getTime() / 1000)
    return expire_time >= now;
}

const inactiveCode = async (code) => {
    return authCodeDb.removeByCode(code)
}

module.exports = {create, checkValidCode, inactiveCode}