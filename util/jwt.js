const jwt = require('jsonwebtoken')
const constants = require('../constants.js')

const jwtAlgo = 'RS256'

const accessTokenPayload = (realm, client_id, user, session_id, auth_time) => {
    let realm_access = {}
    realm_access['roles'] = user.realm_roles || []

    let resource_access = {}
    let client_roles = user.client_roles
    for (let r of client_roles) {
        if (r.client === client_id) {
            resource_access[r.client] = r.roles
        }
    }
    let scope = user.granted_client_scopes
    let preferred_username = user.username
    let sid = session_id
    let session_state = session_id
    let azp = client_id
    let iss = constants.base_url + '/realms/' + realm

    return {auth_time, iss, azp, session_state, realm_access, resource_access, scope, sid, preferred_username}
}

const getAccessToken = (realm, client_id, user, session_id, auth_time) => {
    let payload = accessTokenPayload(realm, client_id, user, session_id, auth_time)
    return jwt.sign(payload, constants.jwt_private_key, {algorithm: jwtAlgo, expiresIn: constants.jwt_expiry_seconds})
}

const buildRefreshTokenPayload = () => {

}

const verifyToken = (token) => {
    const decoded = jwt.verify(token, constants.jwt_public_key, {})
    return !!decoded
}

//test our functions work or not
const test = () => {
    const user2 = {
        realm: 'noob-realm',
        username: 'user02',
        password: '123456',
        client_roles: [
            {client: 'client_1', roles: ['admin']},
            {client: 'client_2', roles: ['admin']}
        ],
        realm_roles: ['realm-user', 'default-roles-noob-realm'],
        granted_client_scopes: 'profile email'
    }

    const token = getAccessToken('noob-realm', 'client_1', user2, 'n6gJns-6NPIEQgaLxbVpNM6ODCWX2YIq', '1655112349')
    console.log(token)
    jwt.verify(token, constants.jwt_public_key, {}, (err, decoded) => {
        if (err) console.log(err)
        else console.log(decoded)
    })
}

// test()

module.exports = {getAccessToken, verifyToken}
