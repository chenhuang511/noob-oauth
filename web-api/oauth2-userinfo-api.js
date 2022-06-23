const userInfoProcessor = require('../logic/oauth2/userinfo-processor')
const express = require('express')

let router = express.Router()

router.get('/:realm/userinfo', async (req, res) => {
    let realm = req.params['realm']
    let jwt = req.headers['authorization'] || ''
    let userInfo = await userInfoProcessor.getInfo(jwt)
    if (userInfo.status === userInfoProcessor.STATUS.error) {
        res.status(401).json(userInfo.data)
    } else {
        res.json(userInfo.data)
    }
})

module.exports = router
