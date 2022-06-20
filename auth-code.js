const authCodeDb = require('./auth-code-db.js')
const constants = require('./constants.js')

const lifeSpanInSeconds = constants.authorization_code_expiration / 1000

const create = async (code) => {
    let create_time = Math.floor(new Date().getTime() / 1000)
    let expire_time = create_time + lifeSpanInSeconds
    return authCodeDb.insert({code, create_time, expire_time})
}

const checkValidCode = async (code) => {
    if (!code) throw new Error('Invalid code')
    let tmp = code.split('.')
    if (!tmp || tmp.length !== 3) throw new Error('Invalid code')
    let authCode = await authCodeDb.findByCode(code)
    if (!authCode || !authCode._id) throw new Error('Code not found')
    let expire_time = authCode.expire_time
    let now = Math.floor(new Date().getTime() / 1000)
    if (expire_time < now) throw new Error('Code is expired')
    return true
}

module.exports = {create, checkValidCode}