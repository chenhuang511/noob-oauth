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
    return new Promise((resolve, reject) => {
        db.find({model: 'auth_code', value: code}, (err, docs) => {
            if (err) reject(err)
            else resolve(docs.pop())
        })
    })
}

module.exports = {insert, findById, findByCode}