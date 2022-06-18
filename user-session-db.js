const abstractDb = require('./db.js')

const initConn = async () => {
    return await abstractDb.init()
}

const insert = (doc) => {
    doc.model = 'user_session'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findDynamically = async (conditions) => {
    let db = await initConn()
    conditions.model = 'user_session'
    return new Promise((resolve, reject) => {
        db.find(conditions, (err, docs) => {
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

const removeOne = async (id) => {
    return abstractDb.removeOne(id)
}

module.exports = {insert, update, findById, findDynamically, removeOne}