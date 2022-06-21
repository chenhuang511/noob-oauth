const abstractDb = require('./db.js')

const initConn = async () => {
    return await abstractDb.init()
}

const insert = (doc) => {
    doc.model = 'token'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findByUUID = async (uuid) => {
    let db = await initConn()
    return new Promise(resolve => {
        db.find({model: 'token', uuid: uuid}, (err, docs) => {
            if (err) reject(err)
            else resolve(docs.pop())
        })
    })
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

module.exports = {insert, findById, update, findByUUID}