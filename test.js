const realm = require('./realm.js')
// const client = require('./client.js')
// const user = require('./user.js')

const realmName = 'noob-realm'
const client_id = 'noob-client'
const username = 'noob-user'
const password = '123456'

const testCreateRealm = () => {
    realm.create(realmName)
        .then(r => console.log(`create realm ok: ${r}`))
        .catch(e => console.log(`create realm err, _id = ${e}`))
}

testCreateRealm()