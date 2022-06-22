const express = require('express')
const constants = require('../constants.js')
const logger = require('../logger.js')
const authorizeProcessor = require('../logic/oauth2/authorize-processor.js')

let router = express.Router()

const API_PREFIX = '/oauth2'

//authorize endpoint
router.get('/:realm/authorize', async (req, res) => {
    let realm = req.params['realm']
    let client_id = req.query.client_id
    let scope = req.query.scope || ''
    let response_type = req.query.response_type
    let state = req.query.state || ''
    let httpSessionId = req.sessionID
    let serverSessionId = req.cookies[constants.server_session_key]

    let result = await authorizeProcessor.beforeAuthenticationProcess(realm, client_id, response_type, scope, state, httpSessionId, serverSessionId)
    //if error, return json
    if (result.status !== 0) {
        res.json({error: result.message})
        return
    }
    //without error
    //case: redirect to client with authorization code
    if (result.data.redirect_client) {
        await callbackClient(res, result)
        return
    }
    //case: display login page
    if (result.data.redirect_login) {
        await redirectToLogin(httpSessionId, res, realm, state, client_id, scope, result.message)
    }
})

//resource owner authorization grant endpoint: user authentication endpoint
router.post('/:realm/authenticate', async (req, res) => {
    //check session first
    let requestSession = req.cookies[constants.request_session_key]
    let httpSessionId = req.sessionID
    let realm = req.params['realm']
    let client_id = req.query.client_id
    let scope = req.query.scope || ''
    let state = req.query.state || ''

    let {username, password} = req.body

    if (!requestSession || requestSession !== httpSessionId) {
        await redirectToLogin(httpSessionId, res, realm, state, client_id, scope, 'invalid session')
        return
    }

    let result = await authorizeProcessor.handleAuthenticationProcess(realm, client_id, username, password, scope, state, httpSessionId)
    //in case error
    if (result.status !== 0) {
        res.render('login.html', {errorMessage: result.message})
        return
    }
    //without error, redirect to client with authorization code
    if (result.data.redirect_client) {
        await callbackClient(res, result)
    } else {
        res.json({error: 'internal server error'})
    }
})

const redirectToLogin = async (reqSessionId, response, realm, state, client_id, scope, message) => {
    let passData = {}
    let authAction = `${API_PREFIX}/${realm}/authenticate?client_id=${client_id}`
    if (state) authAction += `&state=${state}`
    if (scope) authAction += `&scope=${scope}`
    passData.authAction = authAction
    passData.errorMessage = message || ''
    response.cookie(constants.request_session_key, reqSessionId)
    response.render('login.html', passData)
}

const callbackClient = async (response, authorizeResult) => {
    let clientCallback = authorizeResult.data.callback_url
    let code = authorizeResult.data.code
    let serverSession = authorizeResult.data.server_session
    let state = authorizeResult.data.state
    let session_state = authorizeResult.data.session_state
    let url = `${clientCallback}?session_state=${session_state}&code=${code}`
    if (state) url += `&state=${state}`
    response.cookie(constants.server_session_key, serverSession)
    response.cookie(constants.request_session_key, session_state)
    response.redirect(302, url)
}

module.exports = router