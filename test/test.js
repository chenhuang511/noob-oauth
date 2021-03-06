const realm = require('../service/realm.js')
const client = require('../service/client.js')
const user = require('../service/user.js')
const crypto = require('crypto')
const authorizeProcessor = require('../logic/oauth2/authorize-processor.js')
const tokenProcessor = require('../logic/oauth2/token-processor.js')

const realmName = 'noob-realm'
const client_id = 'noob-client'
const client_id_2 = 'smart-client'
const client_id_3 = 'net-client'
const client_id_4 = 'java-client'
const client_id_5 = 'php-client'
const client_id_6 = 'java-client-2'
const client_name = 'noob-client.vn'
const client_name_2 = 'smart-client'
const client_name_3 = 'netclient.vn'
const client_name_4 = 'javaclient.vn'
const client_name_5 = 'phpclient.vn'
const client_name_6 = 'http://127.0.0.1:6080'
const client_password_3 = 'IL45G3iLrHOfX/0Cu/aINMXVg1jUbzFT'
const client_callback_url = 'http://localhost:5080/login/oauth2/code/noob-client'
const client_callback_url_2 = 'http://localhost:5081/login/oauth2/code/smart-client'
const client_callback_url_3 = 'https://netclient.vn:5001/authorization-code/callback'
const client_callback_url_4 = 'http://javaclient.vn:5081/login/oauth2/code/java-client'
const client_callback_url_5 = 'http://phpclient.vn:8885/callback.php'
const client_callback_url_6 = 'http://127.0.0.1:6080/login/oauth2/code/noob-client'
const username = 'noob-user'
const username2 = 'smart-user'
const password = '123456'
let http_session = crypto.randomUUID()

const testCreateRealm = async () => {
    console.log(`=====BEGIN TEST REAM=====\n`)
    try {
        let r = await realm.create(realmName)
        console.log(`create realm ok: ${r}`)
    } catch (e) {
        console.log(`create realm err, _id = ${e}`)
    }
    console.log(`=====DONE TEST REAM=====\n`)
}

const testCreateClient = async () => {
    console.log(`=====BEGIN TEST CLIENT=====\n`)
    try {
        let r = await client.create(realmName, client_id_3, client_name_3, client_callback_url_3)
        console.log(`create client ok, client_id: ${client_id_3}, client_secret: ${r.client_secret}`)
        let r2 = await client.create(realmName, client_id_4, client_name_4, client_callback_url_4)
        console.log(`create client ok, client_id: ${client_id_4}, client_secret: ${r2.client_secret}`)
        let r3 = await client.create(realmName, client_id_5, client_name_5, client_callback_url_5)
        console.log(`create client ok, client_id: ${client_id_5}, client_secret: ${r3.client_secret}`)
        let r4 = await client.create(realmName, client_id_6, client_name_6, client_callback_url_6)
        console.log(`create client ok, client_id: ${client_id_6}, client_secret: ${r4.client_secret}`)
    } catch (e) {
        console.log(`create client err, _id = ${e}`)
    }
    console.log(`=====DONE TEST CLIENT=====\n`)
}

const testCreateUser = async () => {
    console.log(`=====BEGIN TEST USER=====\n`)
    try {
        let r = await user.create(realmName, username, password, [{noob_client: {roles: ['user']}}])
        console.log(`create user ok: ${r._id}`)
        let r2 = await user.create(realmName, username2, password, [{smart_client: {roles: ['user']}}])
        console.log(`create user ${username2} ok: ${r2._id}`)
    } catch (e) {
        console.log(`create user err, _id = ${e}`)
    }
    console.log(`=====DONE TEST USER=====\n`)
}

const testAuthorize = async () => {
    console.log(`=====BEGIN TEST AUTHORIZE=====\n`)

    // let http_session = crypto.randomUUID()
    let scope = 'email profile'
    let state = crypto.randomBytes(10).toString('hex')
    let response_type = 'code'
    let initCheck = await authorizeProcessor.beforeAuthenticationProcess(realmName, client_id, response_type, scope, state, http_session)
    console.log(`init check result: `)
    console.log(initCheck)
    let authorizeCheck = await authorizeProcessor.handleAuthenticationProcess(realmName, client_id, username, password, scope, state, http_session)
    console.log(`authorize check result: `)
    console.log(authorizeCheck)

    console.log(`=====DONE TEST AUTHORIZE=====\n`)
    return authorizeCheck
}

const testAuthorizeWithCookie = async (cookie) => {
    console.log(`=====BEGIN TEST AUTHORIZE WITH COOKIE=====\n`)
    let scope = 'email'
    let state = crypto.randomBytes(10).toString('hex')
    let response_type = 'code'
    let initCheck = await authorizeProcessor
        .beforeAuthenticationProcess(realmName, client_id, response_type, scope, state, http_session, cookie)
    console.log(`init check with code in response:`)
    console.log(initCheck)

    console.log(`=====DONE TEST AUTHORIZE WITH COOKIE=====\n`)
    return initCheck
}

const testToken = async () => {
    console.log(`=====BEGIN TEST TOKEN=====\n`)

    let grant_type = 'authorization_code'
    let client = await testCreateClient()
    let authorizationGrant = await testAuthorize()
    let code = authorizationGrant.data.code
    console.log(`auth_code: ${code}`)
    let tokenData = await tokenProcessor.process(realmName, grant_type, client_id, client.client_secret, code)
    console.log(`token process response`)
    console.log(tokenData)

    console.log('try refresh token')
    let refresh_token = tokenData.data.refresh_token
    grant_type = 'refresh_token'
    let newTokenData = await tokenProcessor.process(realmName, grant_type, client_id, client.client_secret, refresh_token)
    console.log(`refresh token process response`)
    console.log(newTokenData)

    console.log(`=====DONE TEST TOKEN=====\n`)
}

const clear = async () => {
    console.log(`=====BEGIN CLEAR=====\n`)
    let r1 = await realm.removeAll()
    console.log(`remove test realm: ${r1}`)
    let r2 = await client.removeAll()
    console.log(`remove client: ${r2}`)
    let r3 = await user.removeAll()
    console.log(`remove user: ${r3}`)
    console.log(`=====DONE CLEAR=====\n`)
}

const clearClient = async (client_id) => {
    let r1 = await client.removeByClientId(client_id)
    console.log(`remove ${r1} client`)
}

const run = async () => {
    await clear()
    // await clearClient('java-client-2')
    await testCreateRealm()
    await testCreateClient()
    await testCreateUser()
    // let authorize1 = await testAuthorize()
    // await testAuthorizeWithCookie(authorize1.data.server_session)
    // await testToken()
    // await clear()
}

run().catch()