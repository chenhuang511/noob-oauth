const abstractDb = require('./db.js')

const initConn = async () => {
    return await abstractDb.init()
}

const insert = (doc) => {
    doc.model = 'auth_code'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findByCode = async (code) => {
    let db = await initConn()
    return new Promise((resolve, reject) => {
        db.find({model: 'auth_code', code: code}, (err, docs) => {
            if (err) reject(err)
            else resolve(docs.pop())
        })
    })
}

const removeByCode = async (code) => {
    let db = await initConn()
    return new Promise((resolve, reject) => {
        db.remove({model: 'auth_code', code: code}, (err, removedNum) => {
            if (err) reject(err)
            else resolve(removedNum)
        })
    })
}

module.exports = {insert, findById, findByCode, removeByCode}