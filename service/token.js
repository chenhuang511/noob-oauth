const tokenDb = require('../repository/token-db.js')
const constants = require('../constants.js')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const userSessionDb = require('../repository/user-session-db.js')
const clientSessionDb = require('../repository/client-session-db.js')
const userDb = require('../repository/user-db.js')

let tokenTypes = ['access_token', 'refresh_token']

const generateTokens = async (userSessionId, clientSessionId) => {
    let userSession = await userSessionDb.findById(userSessionId)
    if (!userSession) throw new Error('Session not active')
    let clientSession = await clientSessionDb.findById(clientSessionId)
    if (!clientSession) throw new Error('Session not active')
    let userId = userSession.user_id
    let authenticatedUser = await userDb.findById(userId)
    if (!clientSession) throw new Error('User not found')

    let jti = crypto.randomUUID()
    let resource_access = authenticatedUser.granted_roles
    let scope = clientSession.scope
    let preferred_username = authenticatedUser.username
    let session_state = userSession.http_session_id
    let sid = userSession.http_session_id
    let sub = userId
    let azp = clientSession.client_id
    let iss = constants.base_url + '/realms/' + userSession.realm
    let typ = 'Bearer'
    let auth_time = userSession.authenticate_time

    //generate access_token payload
    let accessTokenPayload = {
        auth_time,
        iss,
        sub,
        jti,
        azp,
        typ,
        session_state,
        resource_access,
        scope,
        sid,
        preferred_username
    }

    let access_token = jwt.sign(accessTokenPayload, constants.jwt_private_key, {
        algorithm: 'RS256',
        expiresIn: constants.jwt_expiry_seconds
    })
    //store into db
    let access_token_id = await create(jti, access_token, 'access_token', userSessionId, clientSessionId)

    jti = crypto.randomUUID()
    typ = 'ID'
    //generate refresh_token payload
    let refreshTokenPayload = {auth_time, jti, iss, sub, typ, azp, session_state, sid, preferred_username}
    let refresh_token = jwt.sign(refreshTokenPayload, constants.jwt_private_key, {
        algorithm: 'RS256',
        expiresIn: constants.jwt_expiry_seconds
    })
    //store into db
    let refresh_token_id = await create(jti, refresh_token, 'refresh_token', userSessionId, clientSessionId)
    return {
        access_token,
        expires_in: constants.jwt_expiry_seconds,
        refresh_expires_in: constants.jwt_expiry_seconds,
        refresh_token,
        // access_token_id,
        // refresh_token_id,
        token_type: 'Bearer',
        session_state: userSession.http_session_id,
        scope: clientSession.scope,
    }
}

//gen tokens from the refresh_token after validation
const refreshTokens = async (refresh_token) => {
    //verify token
    const decoded = await verifyToken(refresh_token)
    let dbToken = await tokenDb.findByUUID(decoded.jti)
    let userSessionId = dbToken.user_session_id
    let clientSessionId = dbToken.client_session_id
    let newTokens = await generateTokens(userSessionId, clientSessionId)
    await revokeToken(dbToken._id)
    return newTokens
}

const validateRefreshToken = async (refresh_token) => {
    try {
        const decoded = await verifyToken(refresh_token)
        if (!decoded || !decoded.jti)
            return false
        let dbToken = await tokenDb.findByUUID(decoded.jti)
        return (dbToken && dbToken.is_revoked === 0)
    } catch (e) {
        return false
    }
}

const verifyToken = async (token) => {
    return jwt.verify(token, constants.jwt_public_key, {})
}

const create = async (uuid, value, type, user_session_id, client_session_id) => {
    if (!value) throw new Error('invalid token')
    if (!type || !tokenTypes.includes(type)) throw new Error('invalid token type')
    let create_time = Math.floor(new Date().getTime() / 1000)
    let expire_time = create_time + constants.jwt_expiry_seconds
    let is_revoked = 0
    let hash = crypto.createHash('md5').update(value).digest('hex')
    return tokenDb.insert({
        uuid,
        value,
        hash,
        type,
        create_time,
        expire_time,
        is_revoked,
        user_session_id,
        client_session_id
    })
}

const isRevoked = async (id) => {
    let token = await tokenDb.findById(id)
    if (!token || !token._id) throw new Error('Token not found')
    return token.is_revoked === 1
}

const revokeToken = async (id) => {
    let token = await tokenDb.findById(id)
    if (!token || !token._id) throw new Error('Token not found')
    token.is_revoked = 1
    token.revoke_time = Math.floor(new Date().getTime() / 1000)
    return tokenDb.update(id, token)
}

module.exports = {generateTokens, refreshTokens, isRevoked, revokeToken, verifyToken, validateRefreshToken}