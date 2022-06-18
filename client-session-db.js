const abstractDb = require('./db.js')

const initConn = async () => {
    return await abstractDb.init()
}

const insert = (doc) => {
    doc.model = 'client_session'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const removeOne = async (id) => {
    return abstractDb.removeOne(id)
}

module.exports = {insert, findById, removeOne}