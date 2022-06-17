const abstractDb = require('./db.js')
const logger = require('./logger.js')

const db = abstractDb.init()
    .then(r => {
        r.ensureIndex({fieldName: 'name', unique: true}, () => {})
    }).catch(e => logger.l(e))

const insert = (doc) => {
    doc.model = 'realm'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findByName = (name) => {
    return new Promise(((resolve, reject) => {
        db.find({model: 'realm', name: name, active: 1}, (err, docs) => {
            if (err) logger.l(err)
            else resolve(docs.pop())
        })
    }))
}

module.exports = {insert, findById, findByName}