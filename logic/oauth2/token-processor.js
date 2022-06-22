const constants = require('../../constants.js')
const client = require('../../service/client.js')
const token = require('../../service/token.js')
const authCode = require('../../service/auth-code.js')

const STATUS = {
    ok: 0,
    err: 1,
    err_authenticate: 2
}

let ERROR_CODE = {
    invalid_request: `The request is missing a required parameter, includes an unsupported parameter value (other than grant type), repeats a parameter, includes multiple credentials, utilizes more than one mechanism for authenticating the client, or is otherwise malformed.`,
    invalid_client: 'Client authentication failed',
    invalid_grant: `The authorization code or refresh token is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client`,
    unauthorized_client: `The authenticated client is not authorized to use this authorization grant type`,
    unsupported_grant_type: `The authorization grant type is not supported by the authorization server.`,
    invalid_scope: `The requested scope is invalid, unknown, malformed, or exceeds the scope granted by the resource owner.`,
}

const process = async (realm, grant_type, client_id, client_secret, code, refresh_token) => {
    let result = {status: STATUS.err, message: '', data: {}}
    try {
        if (!grant_type || !client_id || !client_secret || (!code && !refresh_token)) {
            result.status = STATUS.err
            result.message = 'not supported grant type'
            result.data = getErrorResponse('invalid_request')
            return result
        }

        //check grant_type
        if (!constants.grant_types_supported.includes(grant_type)) {
            result.status = STATUS.err
            result.message = 'not supported grant type'
            result.data = getErrorResponse('unsupported_grant_type')
            return result
        }

        //check client credentials
        let checkClient = await client.authenticate(realm, client_id, client_secret)
        if (!checkClient) {
            result.status = STATUS.err_authenticate
            result.message = 'authenticate client failed'
            result.data = getErrorResponse('invalid_client')
            return result
        }

        if (grant_type === 'authorization_code')
            return await processWithAuthCode(code, client_id)
        else
            return await processWithRefreshToken(refresh_token)
    } catch (e) {
        result.status = STATUS.err
        result.message = e.message
        result.data = getErrorResponse('invalid_request')
        return result
    }
}

const processWithAuthCode = async (code, client_id) => {
    let result = {status: STATUS.err, message: '', data: {}}
    try {
        //check auth code
        let checkCode = await authCode.checkValidCode(code, client_id)
        if (!checkCode) {
            result.status = STATUS.err
            result.message = 'invalid code'
            result.data = getErrorResponse('invalid_grant')
            return result
        }

        let parsed = code.split('.')
        let userSessionId = parsed[1]
        let clientSessionId = parsed[2]

        let tokens = await token.generateTokens(userSessionId, clientSessionId)
        //inactive used auth code
        await authCode.inactiveCode(code)

        result.status = STATUS.ok
        result.data = tokens
        return result
    } catch (e) {
        result.status = STATUS.err
        result.message = e.message
        result.data = getErrorResponse('invalid_request')
        return result
    }
}

const processWithRefreshToken = async (refresh_token) => {
    let result = {status: STATUS.err, message: '', data: {}}
    try {
        let checkToken = await token.validateRefreshToken(refresh_token)
        if (!checkToken) {
            result.status = STATUS.err
            result.data = getErrorResponse('invalid_grant')
            return result
        }

        let tokens = await token.refreshTokens(refresh_token)
        result.status = STATUS.ok
        result.data = tokens
        return result
    } catch (e) {
        result.status = STATUS.err
        result.message = e.message
        result.data = getErrorResponse('invalid_request')
        return result
    }
}

const getErrorResponse = (error) => {
    return {error, error_description: ERROR_CODE[error]}
}

module.exports = {process, STATUS}