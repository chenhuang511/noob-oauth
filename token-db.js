const abstractDb = require('./db.js')
const logger = require('./logger.js')

const db = abstractDb.init().catch(e => logger.l(e))

db.ensureIndex({fieldName: 'hash', unique: true})

const insert = (doc) => {
    doc.model = 'token'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findTokenByTypeAndHash = (type, hashValue) => {
    return new Promise(resolve => {
        db.find({model: 'token', type: type, hash: hashValue}, (err, docs) => {
            if (err) logger.l(err)
            else resolve(docs.pop())
        })
    })
}

const findTokenByTypeAndValue = (type, value) => {
    return new Promise(resolve => {
        db.find({model: 'token', type: type, value: value}, (err, docs) => {
            if (err) logger.l(err)
            else resolve(docs.pop())
        })
    })
}