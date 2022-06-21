const clientDb = require('../repository/client-db.js')
const realmDb = require('../repository/realm-db.js')
const log = require('../logger.js')
const crypto = require('crypto')

const create = async (realm, name, callback_url) => {
    if (!name) throw new Error('name is not valid')
    if (!callback_url || (!callback_url.startsWith('http://') && !callback_url.startsWith('https://')))
        throw new Error('callback_url is not valid')
    let check = await realmDb.findByName(realm)
    if (!check || !check._id) throw new Error('realm is not valid')

    let roles = ['user', 'admin']
    let scopes = ['username', 'profile'] // default scopes
    let client_secret = crypto.randomBytes(24).toString("base64")
    try {
        let _id = await clientDb.insert({client_id: name, client_secret, realm, callback_url, roles, scopes})
        return {_id, client_id: name, client_secret}
    } catch (e) {
        throw e
    }
}

const exists = async (realm, client_id) => {
    let client = await clientDb.findByClientId(realm, client_id)
    return client || false
}

const authenticate = async (realm, client_id, client_secret) => {
    let client = await clientDb.findByClientCredentials(realm, client_id, client_secret)
    return client || false
}

const removeAll = async () => {
    return await clientDb.removeAll()
}

module.exports = {create, exists, authenticate, removeAll}