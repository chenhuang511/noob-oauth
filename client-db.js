const abstractDb = require('./db.js')
const logger = require('./logger.js')

const db = abstractDb.init().catch(e => logger.l(e))

db.ensureIndex({fieldName: 'client_id', unique: true})

const insert = (doc) => {
    doc.model = 'client'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findByClientId = (client_id) => {
    return new Promise(resolve => {
        db.find({model: 'client', client_id: client_id}, (err, docs) => {
            if (err) logger.l(err)
            else resolve(docs.pop())
        })
    })
}

//for authentication
const findByClientCredentials = (realm, client_id, client_secret) => {
    return new Promise(resolve => {
        db.find({model: 'client', realm: realm, client_id: client_id, client_secret: client_secret}, (err, docs) => {
            if (err) logger.l(err)
            else resolve(docs.pop())
        })
    })
}

module.exports = {insert, findById, findByClientId, findByClientCredentials}