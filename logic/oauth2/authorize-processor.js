const constants = require('../../constants.js')
const client = require('../../service/client.js')
const user = require('../../service/user.js')
const clientSession = require('../../service/client-session.js')
const userSession = require('../../service/user-session.js')
const authCode = require('../../service/auth-code.js')

let STATUS = {
    ok: 0,
    err: 99,
    client_err: 1,
    response_type_err: 2,
    user_authentication_err: 3,
    server_session_err: 4,
}

const beforeAuthenticationProcess = async (realm, client_id, response_type, scope, state, http_session, server_session = '') => {
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
            return result
        }

        if (server_session)
            return await processWithSession(realm, client_id, server_session, scope, state, http_session)
        else {
            result.status = STATUS.ok
            result.data = {redirect_login: true}
        }
        return result
    } catch (e) {
        result.status = STATUS.err
        result.message = e.message
        return result
    }
}

const processWithSession = async (realm, client_id, serverSession, scope, state, http_session) => {
    let result = {status: STATUS.err, message: '', data: {}}
    try {
        //validate server_session
        let parsed = serverSession.split('/')
        if (!parsed || parsed.length !== 3) {
            result.status = STATUS.ok
            result.message = 'invalid session'
            result.data = {redirect_login: true}
            return result
        }
        let cookieRealm = parsed[0]
        let authenticatedUserId = parsed[1]
        let authenticatedHttpSessionId = parsed[2]

        let authenticatedUserSession = await userSession.findByUserIdAndHttpSessionId(cookieRealm, authenticatedUserId, authenticatedHttpSessionId)
        if (cookieRealm !== realm || http_session !== authenticatedHttpSessionId
            || !authenticatedUserSession || !authenticatedUserSession._id) {
            result.status = STATUS.ok
            result.message = 'Session not active'
            result.data = {redirect_login: true}
            return result
        }

        let newClientSessionId = await clientSession.create(realm, client_id, scope, state, authenticatedHttpSessionId)

        //create authorization code & store into db
        let code = `${authenticatedHttpSessionId}.${authenticatedUserSession._id}.${newClientSessionId}`
        await authCode.create(code)

        //get client callback url
        let existClient = await client.exists(realm, client_id)
        let callback_url = existClient.callback_url

        result.status = STATUS.ok
        result.data = {
            redirect_client: true,
            callback_url,
            code,
            server_session: serverSession,
            state,
            session_state: http_session
        }
        return result
    } catch (e) {
        result.status = STATUS.err
        result.message = e.message
        return result
    }
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
            server_session,
            state,
            session_state: http_session_id
        }
        return result
    } catch (e) {
        result.status = STATUS.user_authentication_err
        result.message = e.message
        return result
    }
}

module.exports = {beforeAuthenticationProcess, handleAuthenticationProcess}
