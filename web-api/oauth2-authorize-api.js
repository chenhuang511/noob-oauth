const express = require('express')
const constants = require('../constants.js')
const logger = require('../logger.js')
const authorizeProcessor = require('../logic/oauth2/authorize-processor.js')

let router = express.Router()

const API_PREFIX = '/oauth2'

const authStatus = authorizeProcessor.STATUS

//authorize endpoint
router.get('/:realm/authorize', async (req, res) => {
    let realm = req.params['realm']
    let client_id = req.query.client_id
    let scope = req.query.scope || ''
    let response_type = req.query.response_type
    let state = req.query.state || ''
    let redirect_uri = req.query.redirect_uri || ''
    let httpSessionId = req.sessionID
    let serverSessionId = req.cookies[constants.server_session_key]

    let result = await authorizeProcessor.beforeAuthenticationProcess(realm, client_id, response_type, scope, state,
        redirect_uri, httpSessionId, serverSessionId)

    switch (result.status) {
        case authStatus.error_with_login_redirect:
        case authStatus.ok_with_login_redirect:
            await redirectToLogin(httpSessionId, res, realm, state, redirect_uri, client_id, scope, result.message)
            break
        case authStatus.error_with_return_client:
            res.json(result.data)
            break
        case authStatus.ok_with_callback_client:
            await callbackClient(res, result)
            break
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
    let redirect_uri = req.redirect_uri || ''

    let {username, password} = req.body

    if (!requestSession || requestSession !== httpSessionId) {
        await redirectToLogin(httpSessionId, res, realm, state, redirect_uri, client_id, scope, 'invalid session')
        return
    }

    let result = await authorizeProcessor.handleAuthenticationProcess(realm, client_id, username, password, scope, state, redirect_uri, httpSessionId)
    switch (result.status) {
        case authStatus.error_with_login_redirect:
        case authStatus.ok_with_login_redirect:
            await redirectToLogin(httpSessionId, res, realm, state, redirect_uri, client_id, scope, result.message)
            break
        case authStatus.error_with_return_client:
            res.json(result.data)
            break
        case authStatus.ok_with_callback_client:
            await callbackClient(res, result)
            break
    }
})

const redirectToLogin = async (reqSessionId, response, realm, state, redirect_uri, client_id, scope, message) => {
    let passData = {}
    let authAction = `${API_PREFIX}/${realm}/authenticate?client_id=${client_id}`
    if (state) authAction += `&state=${state}`
    if (scope) authAction += `&scope=${scope}`
    if (redirect_uri) authAction += `&redirect_uri=${redirect_uri}`
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