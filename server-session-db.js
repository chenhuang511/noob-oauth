const abstractDb = require('./db.js')

const initConn = async () => {
    return await abstractDb.init()
}

const insert = (doc) => {
    doc.model = 'server_session'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findByValue = async (value) => {
    let db = await initConn()
    return new Promise(((resolve, reject) => {
        db.find({model: 'server_session', value: value}, (err, docs) => {
            if (err) reject(err)
            else resolve(docs.pop())
        })
    }))
}

const update = async (id, newDoc) => {
    let db = await initConn()
    return new Promise(((resolve, reject) => {
        db.update({_id: id}, newDoc, (err, numReplaced) => {
            if (err) reject(err)
            else resolve(numReplaced)
        })
    }))
}

module.exports = {insert, findById, update, findByValue}