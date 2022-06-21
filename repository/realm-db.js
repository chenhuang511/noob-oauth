const abstractDb = require('./db.js')

const initConn = async () => {
    return await abstractDb.init()
}

const insert = async (doc) => {
    doc.model = 'realm'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findByName = async (name) => {
    let db = await initConn()
    return new Promise(((resolve, reject) => {
        db.find({model: 'realm', name: name, active: 1}, (err, docs) => {
            if (err) reject(err)
            else resolve(docs.pop())
        })
    }))
}

const removeAll = () => {
    return abstractDb.removeAll('realm')
}

module.exports = {insert, findById, findByName, removeAll}