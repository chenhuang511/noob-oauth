const express = require('express')
const constants = require('../constants.js')
const logoutProcessor = require('../logic/oauth2/logout-processor')

let router = express.Router()
const API_PREFIX = '/oauth2'

router.get('/:realm/logout', async (req, res) => {
    let realm = req.params['realm']
    res.set('Cache-Control', 'no-cache')
    let redirectUrl = req.query.redirect_url
    await req.session.destroy()
    let confirmUrl = `${API_PREFIX}/${realm}/logout/confirm`
    if (redirectUrl) confirmUrl += `?redirect_url=${redirectUrl}`
    res.redirect(307, confirmUrl)
})

router.get('/:realm/logout/confirm', async (req, res) => {
    let sessionId = req.sessionID
    res.set('Cache-Control', 'no-cache')
    res.cookie(constants.request_session_key, sessionId)
    res.render('logout-confirm.html')
})

router.post('/:realm/logout/confirm', async (req, res) => {
    let realm = req.params['realm']
    let serverSession = req.cookies[constants.server_session_key]
    let redirectUrl = req.query.redirect_url
    await logoutProcessor.confirmLogout(realm, serverSession)
    res.clearCookie(constants.server_session_key)
    res.clearCookie(constants.request_session_key)
    if (redirectUrl) {
        res.redirect(redirectUrl)
    } else {
        res.json({message: 'logged out'})
    }
})

const validURL = (str) => {
    let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str)
}

module.exports = router