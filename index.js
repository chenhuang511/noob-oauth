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
const jwt = require('./util/jwt.js')

const app = express()
const PORT = 4000

//in-memory storage
const NodeCache = require("node-cache");
const authCodeManager = new NodeCache();

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
            res.status(400).json({error: 'Client not found'})
            return
        }

        //check if client exchange the state in url query
        let state = req.query.state

        //validate response_type
        let supported = constants.response_types_supported
        if (!supported.includes(req.query.response_type)) {
            let cbUrl = `${_client.callback}?error=unsupported_response_type`
            if (state) cbUrl += `&state=${state}`
            res.redirect(302, cbUrl)
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
                && duration <= constants.authorization_code_expiration
        }

        //user is authenticated, redirect to client with authorization code
        if (redirect) {
            immediateData.time = new Date().getTime()
            let code = utils.genUUID()
            authCodeManager.set(code, immediateData, constants.authorization_code_expiration)
            let callbackUrl = `${_client.callback}?session_state=${req.sessionID}&code=${code}`
            if (state) callbackUrl += `&state=${state}`
            res.redirect(302, callbackUrl)
        } else {
            //otherwise redirect user to login page
            //store client state for next request with key = client_id + sessionID
            if (state) authCodeManager.set(client_id + req.sessionID, state)
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
        let session_state = req.sessionID
        let immediateData = {realm, client_id, username, time, session_state}
        res.cookie('noob-session', utils.encrypt(JSON.stringify(immediateData)), {
            expires: new Date(Date.now() + constants.authorization_code_expiration),
            httpOnly: true
        })
        let code = utils.genUUID()
        authCodeManager.set(code, immediateData, constants.authorization_code_expiration)
        // we should send back to client with the state this client exchanged before
        let state = authCodeManager.get(client_id + req.sessionID)
        let callbackUrl = `${_client.callback}?session_state=${session_state}&code=${code}`
        if (state) callbackUrl += `&state=${state}`
        res.json({url: callbackUrl})
    } else {
        res.json({error: 'Invalid user credentials'})
    }
}))

app.post('/realms/:realm/protocol/openid-connect/token', ((req, res) => {
    try {
        //required response headers from OAuth2 protocol
        res.set('Cache-Control', 'no-store')
        res.set('Pragma', 'no-cache')

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
            res.json({error: "invalid_client", message: 'Invalid client credentials'})
            return
        }

        if (grant_type === 'authorization_code') {
            //check auth code
            let cache = authCodeManager.get(code)
            if (!cache) {
                res.json({error: 'invalid_grant', message: 'Code not valid'})
                return
            }
            let user = idp.findUserByUsername(cache.username)
            let session_state = cache.session_state
            let access_token = jwt.getAccessToken(realm, client_id, user, session_state, Math.floor(cache.time / 1000))
            let expires_in = constants.jwt_expiry_seconds
            let token_type = constants.token_type
            let scope = user.granted_client_scopes

            res.json({access_token, token_type, expires_in, session_state, scope})
            authCodeManager.del(code)
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