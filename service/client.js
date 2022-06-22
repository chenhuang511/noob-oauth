const clientDb = require('../repository/client-db.js')
const realmDb = require('../repository/realm-db.js')
const allowRedirectionDb = require('../repository/allow-redirection-db')
const constants = require('../constants')
const log = require('../logger.js')
const crypto = require('crypto')

const create = async (realm, name, callback_url) => {
    if (!name) throw new Error('name is not valid')
    if (!callback_url || (!callback_url.startsWith('http://') && !callback_url.startsWith('https://')))
        throw new Error('callback_url is not valid')
    let check = await realmDb.findByName(realm)
    if (!check || !check._id) throw new Error('realm is not valid')

    let roles = ['user', 'admin']
    let scope = constants.default_client_scope
    let client_type = constants.default_client_type
    let client_secret = crypto.randomBytes(24).toString("base64")
    try {
        // create client
        let _id = await clientDb.insert({
            client_id: name,
            client_secret,
            realm,
            callback_url,
            roles,
            scope,
            client_type
        })
        // create redirection configuration
        let url = new URL(callback_url)
        let domain = `${url.protocol}//${url.hostname}:${url.port}`
        await allowRedirectionDb.insert({client_id: name, domain})

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

const removeByClientId = async (client_id) => {
    await allowRedirectionDb.removeByClientId(client_id)
    return await clientDb.removeByClientId(client_id)
}

const removeAll = async () => {
    await allowRedirectionDb.removeAll()
    return await clientDb.removeAll()
}

module.exports = {create, exists, authenticate, removeAll, removeByClientId}