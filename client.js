const clientDb = require('./client-db.js')
const realmDb = require('./realm-db.js')
const log = require('./logger.js')
const crypto = require('crypto')

const create = async (realm, name, callback_url) => {
    if (!name) throw new Error('name is not valid')
    if (!callback_url || (!callback_url.startsWith('http://') && !callback_url.startsWith('https://')))
        throw new Error('callback_url is not valid')
    let check = await realmDb.findByName(realm)
    if (!check) throw new Error('realm is not valid')

    let roles = ['user', 'admin']
    let client_secret = crypto.randomBytes(48).toString("base64")
    try {
        let _id = await clientDb.insert({client_id: name, client_secret, realm, callback_url, roles})
        return {_id, client_id: name, client_secret}
    } catch (e) {
        throw e
    }
}

const exists = async (client_id) => {
    let client = await clientDb.findByClientId(client_id)
    return !!client._id
}

const authenticate = async (realm, client_id, client_secret) => {
    let client = await clientDb.findByClientCredentials(realm, client_id, client_secret)
    return !!client._id
}

module.exports = {create, exists, authenticate}