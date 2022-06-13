const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cookieParser = require("cookie-parser")
const sessions = require('express-session')

const constants = require('./constants.js')
const realms = require('./realm/realm.js')
const idp = require('./idp/idp.js')
const client = require('./client/client.js')
const utils = require('./util/utils.js')

const app = express()
const PORT = 4000

const NodeCache = require("node-cache");
const authCodeManager = new NodeCache();
const authCodes = {}

app.use(sessions({
    secret: "ddSF9jLfmajLF629",
    saveUninitialized: true,
    resave: false
}))

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('./web'))

app.get('/realms/:realm/protocol/openid-connect/auth', ((req, res) => {
    try {
        //validate realm
        let realm = req.params['realm']
        if (realm !== realms.active)
            res.status(404).json({error: "Realm does not exist"})

        //validate client
        let client_id = req.query.client_id
        let _client = client.exist(client_id)
        if (!_client) {
            res.sendStatus(400)
            return
        }

        //validate response_type
        let supported = constants.response_types_supported
        if (!supported.includes(req.query.response_type)) {
            res.json({error: "unsupported_response_type"})
            return
        }

        let redirect = false
        let immediateData

        //check cookie for resource owner authenticated session
        if (req.cookies['noob-session']) {
            immediateData = utils.decrypt(req.cookies['noob-session'])
            immediateData = JSON.parse(immediateData)
            let genTime = immediateData.time
            let now = new Date().getTime()
            let duration = now - genTime
            redirect = immediateData.realm === realm
                // && immediateData.client_id === client_id
                && duration <= constants.authorization_code_expiration
        }

        //user is authenticated, redirect to client with authorization code
        if (redirect) {
            immediateData.time = new Date().getTime()
            let code = utils.genUUID()
            authCodeManager.set(code, immediateData, constants.authorization_code_expiration)
            let callbackUrl = `${_client.callback}?session_state=${req.sessionID}&code=${code}`
            res.redirect(302, callbackUrl)
        } else {
            //otherwise redirect user to login page
            res.cookie('realm', realm)
            res.cookie('client_id', req.query.client_id)
            res.sendFile(path.join(__dirname, './web/login.html'))
        }
    } catch (e) {
        console.log(e)
        res.json({error: 'server_error'})
    }
}))

app.post('/realms/:realm/login-actions/authenticate', ((req, res) => {
    let realm = req.params['realm']
    let client_id = req.query.client_id
    let {username, password} = req.body
    let _user = idp.authenticate(realm, username, password)
    let _client = client.exist(req.query.client_id)
    if (_user && _client) {
        let time = new Date().getTime()
        let immediateData = {realm, client_id, username, time}
        res.cookie('noob-session', utils.encrypt(JSON.stringify(immediateData)), {
            expires: new Date(Date.now() + constants.authorization_code_expiration),
            httpOnly: true
        })
        let code = utils.genUUID()
        authCodeManager.set(code, immediateData, constants.authorization_code_expiration)
        let callbackUrl = `${_client.callback}?session_state=${req.sessionID}&code=${code}`
        res.json({url: callbackUrl})
    } else {
        res.json({error: 'Invalid user credentials'})
    }
}))

app.post('/realms/:realm/protocol/openid-connect/token', ((req, res) => {
    try {
        //validate realm
        let realm = req.params['realm']
        if (realm !== realms.active)
            res.status(404).json({error: "Realm does not exist"})

        let {grant_type, client_id, client_secret, code, refresh_token} = req.body
        if (!grant_type || !client_id || !client_secret || (!code && !refresh_token)) {
            res.json({error: "invalid_request"})
            return
        }

        let supported = constants.grant_types_supported
        if (!supported.includes(grant_type)) {
            res.json({error: "unsupported_grant_type"})
            return
        }

        //authenticate client
        let checkClient = client.authenticate(realm, client_id, client_secret)
        if (!checkClient) {
            res.json({error: "invalid_client"})
            return
        }

        if (grant_type === 'authorization_code') {
            //check auth code
            let cache = authCodeManager.get(code)
            if (!cache || cache.realm !== realm || cache.client_id !== client_id) {
                res.json({error: 'invalid_grant'})
                return
            }
        }
    } catch (e) {
        console.log(e)
        res.json({error: 'server_error'})
    }
}))

// start app
app.listen(PORT, () => {
    console.log('noob oauth started')
})