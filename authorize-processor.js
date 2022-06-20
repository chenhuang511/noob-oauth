const constants = require('./constants.js')
const client = require('./client.js')
const user = require('./user.js')
const clientSession = require('./client-session.js')
const userSession = require('./user-session.js')
const authCode = require('./auth-code.js')

let STATUS = {
    ok: 0,
    err: 99,
    client_err: 1,
    response_type_err: 2,
    user_authentication_err: 3
}

const beforeAuthenticationProcess = async (realm, client_id, response_type, scopes, state, http_session, server_session = '') => {
    let result = {status: STATUS.err, message: '', data: {}}
    try {
        //validate client
        let checkClient = await client.exists(realm, client_id)
        if (!checkClient) {
            result.status = STATUS.client_err
            result.message = `client not found`
            return result
        }
        //validate response type
        if (!constants.response_types_supported.includes(response_type)) {
            result.status = STATUS.response_type_err
            result.message = `response type not supported`
        }

        if (server_session)
            return await processWithSession(server_session, scopes, state, result)
        else {
            result.status = STATUS.ok
            result.data = {redirect_login: true}
        }
        return result
    } catch (e) {
        result.status = STATUS.err
        result.message = e
        return result
    }
}

const processWithSession = async (serverSession, scopes, state, result) => {

}

const handleAuthenticationProcess = async (realm, client_id, username, password, scope, state, http_session_id) => {
    let result = {status: STATUS.err, message: '', data: {}}
    try {
        //authenticate user credentials
        let checkUser = await user.authenticate(realm, username, password)
        if (!checkUser) {
            result.status = STATUS.client_err
            result.message = `user authentication failed`
            return result
        }

        //create client session
        let clientSessionId = await clientSession.create(realm, client_id, scope, state, http_session_id)

        //create user session
        let authenticateTime = Math.floor(new Date().getTime() / 1000)
        let userSessionId = await userSession.create(realm, http_session_id, checkUser._id, username, authenticateTime)

        //create server session (cookie)
        let server_session = `${realm}/${checkUser._id}/${http_session_id}`

        //create authorization code & store into db
        let code = `${http_session_id}.${userSessionId}.${clientSessionId}`
        await authCode.create(code)

        //get client callback url
        let existClient = await client.exists(realm, client_id)
        let callback_url = existClient.callback_url

        result.status = STATUS.ok
        result.data = {
            redirect_client: true,
            callback_url,
            code,
            server_session
        }
        return result
    } catch (e) {
        result.status = STATUS.user_authentication_err
        result.message = e
        return result
    }
}

module.exports = {beforeAuthenticationProcess, handleAuthenticationProcess}
