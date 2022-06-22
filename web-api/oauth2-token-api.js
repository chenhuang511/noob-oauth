const express = require('express')
const constants = require('../constants.js')
const tokenProcessor = require('../logic/oauth2/token-processor')

let router = express.Router()
const processStatus = tokenProcessor.STATUS

router.post('/:realm/token', async (req, res) => {
    let realm = req.params['realm']
    let {grant_type, client_id, client_secret, code, refresh_token} = req.body
    let result = await tokenProcessor.process(realm, grant_type, client_id, client_secret, code, refresh_token)
    res.set('Cache-Control', 'no-store')
    res.set('Pragma', 'no-cache')

    switch (result.status) {
        case processStatus.ok:
            res.json(result.data)
            break
        case processStatus.err:
            res.status(400).json(result.data)
            break
        case processStatus.err_authenticate:
            res.status(401).json(result.data)
            break
    }
})

module.exports = router