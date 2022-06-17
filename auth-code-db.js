const abstractDb = require('./db.js')
const logger = require('./logger.js')

const db = abstractDb.init().catch(e => logger.l(e))

db.ensureIndex({fieldName: 'value', unique: true})

const insert = (doc) => {
    doc.model = 'auth_code'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findByCode = (code) => {
    return new Promise(resolve => {
        db.find({model: 'auth_code', value: code}, (err, docs) => {
            if (err) logger.l(err)
            else resolve(docs.pop())
        })
    })
}