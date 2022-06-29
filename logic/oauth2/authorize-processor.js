//TODO: need implement the authorization grant scopes confirmation in the authorized workflow
// this step is the confirmation page before go to login page
const constants = require('../../constants.js')
const client = require('../../service/client.js')
const user = require('../../service/user.js')
const clientSession = require('../../service/client-session.js')
const userSession = require('../../service/user-session.js')
const authCode = require('../../service/auth-code.js')

let STATUS = {
    ok: 0,
    ok_with_login_redirect: 1,
    ok_with_callback_client: 2,
    error_with_login_redirect: 3,
    error_with_return_client: 4
}

/*
    Follows oauth v2-31, section 4.1.2.1, the specification about authorization error response
 */
let ERROR_CODE = {
    invalid_request: 'The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed',
    unauthorized_client: 'The client is not authorized to request an authorization code using this method.',
    access_denied: 'The resource owner or authorization server denied the request.',
    unsupported_response_type: 'The authorization server does not support obtaining an authorization code using this method.',
    invalid_scope: 'The requested scope is invalid, unknown, or malformed.',
    server_error: 'The authorization server encountered an unexpected condition that prevented it from fulfilling the request.',
    temporarily_unavailable: 'The authorization server is currently unable to handle the request due to a temporary overloading or maintenance of the server.',
}

/*
    When authorized request is called, validate request parameters and decide redirect user to login page or return authorization code directly to client
 */
const beforeAuthenticationProcess = async (realm, client_id, response_type, scope, state, redirect_uri, http_session, server_session = '') => {
    let result = {status: STATUS.ok_with_login_redirect, message: '', data: {}}
    try {
        //validate client
        let checkClient = await client.exists(realm, client_id)
        if (!checkClient) {
            result.status = STATUS.error_with_return_client
            result.message = `client not found`
            result.data = getErrorResponse('unauthorized_client', state)
            return result
        }
        //validate response type
        if (!constants.response_types_supported.includes(response_type)) {
            result.status = STATUS.error_with_return_client
            result.message = `response type not supported`
            result.data = getErrorResponse('unsupported_response_type', state)
            return result
        }
        //validate request scope
        if (scope) {
            let tmp = scope.split(' ')
            let checkScope = tmp.some(s => checkClient.scope.includes(s))
            if (!checkScope) {
                result.status = STATUS.error_with_return_client
                result.message = `requested scope not valid`
                result.data = getErrorResponse('invalid_scope', state)
                return result
            }
        }
        if (server_session)
            return await processWithSession(realm, client_id, server_session, scope, state, redirect_uri, http_session)
        else {
            result.status = STATUS.ok_with_login_redirect
            result.data = {client_name: checkClient.name}
        }
        return result
    } catch (e) {
        result.status = STATUS.error_with_return_client
        result.message = e.message
        result.data = getErrorResponse('server_error', state)
        return result
    }
}

/*
    User-agent (web browsers) have server session within the requested cookies, so user does not need login to grant authorization,
    the authorization code is returned instead
 */
const processWithSession = async (realm, client_id, serverSession, scope, state, redirect_uri, http_session) => {
    let result = {status: STATUS.ok_with_login_redirect, message: '', data: {}}
    try {
        //validate server_session
        let parsed = serverSession.split('/')
        if (!parsed || parsed.length !== 3) {
            result.status = STATUS.error_with_login_redirect
            result.message = 'invalid session'
            return result
        }
        let cookieRealm = parsed[0]
        let authenticatedUserId = parsed[1]
        let authenticatedHttpSessionId = parsed[2]

        let authenticatedUserSession = await userSession.findByUserIdAndHttpSessionId(cookieRealm, authenticatedUserId, authenticatedHttpSessionId)
        if (cookieRealm !== realm || http_session !== authenticatedHttpSessionId
            || !authenticatedUserSession || !authenticatedUserSession._id) {
            result.status = STATUS.error_with_login_redirect
            result.message = 'Session not active'
            return result
        }

        let newClientSessionId = await clientSession.create(realm, client_id, scope, state, authenticatedHttpSessionId)

        //create authorization code & store into db
        let code = `${authenticatedHttpSessionId}.${authenticatedUserSession._id}.${newClientSessionId}`
        await authCode.create(code, client_id)

        //get client callback url
        let existClient = await client.exists(realm, client_id)
        //TODO: oauth v2-31, section 10.5:
        // MUST validate the redirect_uri client provided in the authorize request is in the uri list client registered
        let callback_url = redirect_uri || existClient.callback_url

        result.status = STATUS.ok_with_callback_client
        result.data = {
            registered_id: existClient._id,
            callback_url,
            code,
            server_session: serverSession,
            state,
            session_state: http_session
        }
        return result
    } catch (e) {
        result.status = STATUS.error_with_return_client
        result.message = e.message
        result.data = getErrorResponse('server_error', state)
        return result
    }
}

/*
    Redirect user to login page for authorization grant
 */
const handleAuthenticationProcess = async (realm, client_id, username, password, scope, state, redirect_uri, http_session_id) => {
    let result = {status: STATUS.ok_with_login_redirect, message: '', data: {}}
    try {
        //authenticate user credentials
        let checkUser = await user.authenticate(realm, username, password)
        if (!checkUser) {
            result.status = STATUS.error_with_login_redirect
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
        await authCode.create(code, client_id)

        //get client callback url
        //TODO: need check the redirect_uri from request is match with URIs the client registered
        let existClient = await client.exists(realm, client_id)
        let callback_url = redirect_uri || existClient.callback_url

        result.status = STATUS.ok_with_callback_client
        result.data = {
            registered_id: existClient._id,
            callback_url,
            code,
            server_session,
            state,
            session_state: http_session_id
        }
        return result
    } catch (e) {
        result.status = STATUS.error_with_login_redirect
        result.message = e.message
        return result
    }
}

const getErrorResponse = (error, state) => {
    let response = {error, error_description: ERROR_CODE[error]}
    if (state)
        response.state = state
    return response
}

module.exports = {beforeAuthenticationProcess, handleAuthenticationProcess, STATUS}
