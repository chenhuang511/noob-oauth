const realm = require('../service/realm.js')
const client = require('../service/client.js')
const user = require('../service/user.js')
const crypto = require('crypto')
const authorizeProcessor = require('../logic/oauth2/authorize-processor.js')
const tokenProcessor = require('../logic/oauth2/token-processor.js')

const realmName = 'noob-realm'
const client_id = 'noob-client'
const client_callback_url = 'http://localhost:3005/callback'
const username = 'noob-user'
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
        let r = await client.create(realmName, client_id, client_callback_url)
        console.log(`create client ok, client_secret: ${r.client_secret}`)
        return r
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

const run = async () => {
    // await clear()
    // await testCreateRealm()
    await testCreateClient()
    await testCreateUser()
    // let authorize1 = await testAuthorize()
    // await testAuthorizeWithCookie(authorize1.data.server_session)
    // await testToken()
    // await clear()
}

run().catch()