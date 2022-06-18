const realm = require('./realm.js')
const client = require('./client.js')
const user = require('./user.js')

const realmName = 'noob-realm'
const client_id = 'noob-client'
const client_callback_url = 'http://localhost:3005/callback'
const username = 'noob-user'
const password = '123456'

const testCreateRealm = async () => {
    try {
        let r = await realm.create(realmName)
        console.log(`create realm ok: ${r}`)
    } catch (e) {
        console.log(`create realm err, _id = ${e}`)
    }
}

const testCreateClient = async () => {
    try {
        let r = await client.create(realmName, client_id, client_callback_url)
        console.log(`create client ok: ${r._id}`)
    } catch (e) {
        console.log(`create client err, _id = ${e}`)
    }
}

const testCreateUser = async () => {
    try {
        let r = await user.create(realmName, username, password, [{noob_client: {roles: ['user']}}])
        console.log(`create user ok: ${r._id}`)
    } catch (e) {
        console.log(`create user err, _id = ${e}`)
    }
}

const clear = async () => {
    let r1 = await realm.removeAll()
    console.log(`remove test realm: ${r1}`)
    let r2 = await client.removeAll()
    console.log(`remove client: ${r2}`)
    let r3 = await user.removeAll()
    console.log(`remove user: ${r3}`)
}

const run = async () => {
    await clear()
    await testCreateRealm()
    await testCreateClient()
    await testCreateUser()
    await clear()
}

run().catch()