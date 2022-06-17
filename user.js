const userDb = require('./user-db.js')
const realmDb = require('./realm-db.js')
const crypto = require('crypto')

const create = async (realm, username, password, granted_roles = []) => {
    let check = await realmDb.findByName(realm)
    if (!check) throw new Error('realm is not valid')
    if (!username) throw new Error('username is not valid')
    if (!password) throw new Error('password is not valid')

    password = hashPassword(password)

    try {
        let _id = await userDb.insert({realm, username, password, granted_roles})
        return {_id, username}
    } catch (e) {
        throw e
    }
}

const grantRoles = async (realm, username, client_id, role) => {
    let user = await userDb.findByUsername(realm, username)
    if (!user || !user._id) throw new Error('user not found')
    let currentRoles = user.granted_roles
    currentRoles.push({client_id: role})
    try {
        let numUpdated = userDb.updateGrantedRoles(user._id, currentRoles)
        // return true/false
        return numUpdated > 0
    } catch (e) {
        throw e
    }
}

const authenticate = async (realm, username, password) => {
    password = hashPassword(password)
    let user = await userDb.findByUserCredentials(realm, username, password)
    return !!user._id
}

const hashPassword = (raw_pass) => {
    return crypto.createHash('md5').update(raw_pass).digest('hex')
}

module.exports = {create, authenticate, grantRoles}