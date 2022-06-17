const abstractDb = require('./db.js')
const logger = require('./logger.js')

const db = abstractDb.init().catch(e => logger.l(e))

db.ensureIndex({fieldName: 'server_session_id', unique: true})

const insert = (doc) => {
    doc.model = 'client_session'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findByServerSessionId = (server_session_id) => {
    return new Promise(resolve => {
        db.find({model: 'client_session', server_session_id: server_session_id}, (err, docs) => {
            if (err) logger.l(err)
            else resolve(docs.pop())
        })
    })
}
