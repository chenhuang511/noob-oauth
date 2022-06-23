const constants = require('../../constants')
const token = require('../../service/token')

let STATUS = {
    ok: 0,
    error: 1
}

const getInfo = async (jwtToken) => {
    let result = {status: STATUS.error, message: '', data: {}}
    try {
        if (!jwtToken) {
            result.status = STATUS.error
            result.data = {error: 'invalid_token', error_description: 'Token verification failed'}
            return result
        }
        let prefix = 'Bearer '
        if (jwtToken.startsWith(prefix))
            jwtToken = jwtToken.slice(prefix.length)

        const decoded = await token.verifyToken(jwtToken)
        if (!decoded) {
            result.status = STATUS.error
            result.data = {error: 'invalid_token', error_description: 'Token verification failed'}
            return result
        }
        const isRevoker = await token.verifyToken(decoded.jti)
        if (isRevoker) {
            result.status = STATUS.error
            result.data = {error: 'invalid_token', error_description: 'Token verification failed'}
            return result
        }
        result.status = STATUS.ok
        result.data = {
            sub: decoded.sub,
            preferred_username: decoded.preferred_username,
            resource_access: decoded.resource_access
        }
    } catch (e) {
        result.status = STATUS.error
        result.data = {error: 'invalid_token', error_description: 'Token verification failed'}
    }
    return result
}

module.exports = {getInfo, STATUS}