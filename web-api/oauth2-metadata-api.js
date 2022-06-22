const express = require('express')
const metadata = require('../service/metadata')

let router = express.Router()

router.get('/:realm/metadata', (req, res) => {
    let realm = req.params['realm']
    res.json(metadata.getOAuth2Config(realm))
})

module.exports = router