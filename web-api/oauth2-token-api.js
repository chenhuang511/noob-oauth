const express = require('express')
const constants = require('../constants.js')
const tokenProcessor = require('../logic/oauth2/token-processor')

let router = express.Router()

router.post('/:realm/token', async (req, res) => {
    let realm = req.params['realm']
    let {grant_type, client_id, client_secret, code, refresh_token} = req.body
    let result = await tokenProcessor.process(realm, grant_type, client_id, client_secret, code, refresh_token)
    res.set('Cache-Control', 'no-store')
    res.set('Pragma', 'no-cache')
    if (result.status !== 0) {
        res.json({error: result.message})
    } else {
        res.json(result.data)
    }
})

module.exports = router