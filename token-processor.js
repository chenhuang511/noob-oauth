const constants = require('./constants.js')
const client = require('./client.js')
const token = require('./token.js')
const authCode = require('./auth-code.js')

const STATUS = {
    ok: 0,
    err: 99,
    grant_type_err: 1,
    client_err: 2,
    auth_code_err: 3,
    user_session_err: 4,
    client_session_err: 5
}

const process = async (realm, grant_type, client_id, client_secret, data) => {
    let result = {status: STATUS.err, message: '', data: {}}
    try {
        //check grant_type
        if (!constants.grant_types_supported.includes(grant_type)) {
            result.status = STATUS.grant_type_err
            result.message = 'not supported grant type'
            return result
        }

        //check client credentials
        let checkClient = await client.authenticate(realm, client_id, client_secret)
        if (!checkClient) {
            result.status = STATUS.client_err
            result.message = 'authenticate client failed'
            return result
        }

        if (grant_type === 'authorization_code')
            return await processWithAuthCode(data)
        else
            return await processWithRefreshToken(data)
    } catch (e) {
        result.status = STATUS.err
        result.message = e
        return result
    }
}

const processWithAuthCode = async (code) => {
    let result = {status: STATUS.err, message: '', data: {}}
    try {
        //check auth code
        let checkCode = await authCode.checkValidCode(code)
        if (!checkCode) {
            result.status = STATUS.auth_code_err
            result.message = 'code is not valid'
            return result
        }

        let parsed = code.split('.')
        let userSessionId = parsed[1]
        let clientSessionId = parsed[2]

        let tokens = await token.generateTokens(userSessionId, clientSessionId)
        result.status = STATUS.ok
        result.data = tokens
        return result
    } catch (e) {
        result.status = STATUS.err
        result.message = e
        return result
    }
}

const processWithRefreshToken = async (refresh_token) => {
    let result = {status: STATUS.err, message: '', data: {}}
    try {
        let tokens = await token.refreshTokens(refresh_token)
        result.status = STATUS.ok
        result.data = tokens
        return result
    } catch (e) {
        result.status = STATUS.err
        result.message = e
        return result
    }
}

module.exports = {process}