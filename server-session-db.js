const abstractDb = require('./db.js')
const logger = require('./logger.js')

const db = abstractDb.init().catch(e => logger.l(e))

const insert = (doc) => {
    doc.model = 'server_session'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}