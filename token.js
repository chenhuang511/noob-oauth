const tokenDb = require('./token-db.js')
const constants = require('./constants.js')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const userSessionDb = require('./user-session-db.js')
const clientSessionDb = require('./client-session-db.js')
const userDb = require('./user-db.js')

let tokenTypes = ['access_token', 'refresh_token']

const generateAccessToken = async (userSessionId, clientSessionId) => {
    let userSession = await userSessionDb.findById(userSessionId)
    if (!userSession) throw new Error('UserSession not found')
    let clientSession = await clientSessionDb.findById(clientSessionId)
    if (!clientSession) throw new Error('ClientSession not found')
    let userId = userSession.user_id
    let authenticatedUser = await userDb.findById(userId)
    if (!clientSession) throw new Error('Not found authenticated user')

    let jti = crypto.randomUUID()
    let resource_access = authenticatedUser.granted_roles
    let scope = clientSession.scopes
    let preferred_username = authenticatedUser.username
    let session_state = userSession.http_session_id
    let sid = userSession.http_session_id
    let sub = userId
    let azp = clientSession.client_id
    let iss = constants.base_url + '/realms/' + userSession.realm
    let typ = 'Bearer'
    let auth_time = userSession.authenticate_time

    let payload = {auth_time, iss, sub, azp, typ, session_state, resource_access, scope, sid, preferred_username}

    return jwt.sign(payload, constants.jwt_private_key, {algorithm: 'RS256', expiresIn: constants.jwt_expiry_seconds})
}

const create = async (uuid, value, type) => {
    if (!value) throw new Error('invalid token')
    if (!type || !tokenTypes.includes(type)) throw new Error('invalid token type')
    let create_time = Math.floor(new Date().getTime() / 1000)
    let expire_time = create_time + constants.jwt_expiry_seconds
    let is_revoked = 0
    let hash = crypto.createHash('md5').update(value).digest('hex')
    return tokenDb.insert({uuid, value, hash, type, create_time, expire_time, is_revoked})
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

module.exports = {create, isRevoked, revokeToken}