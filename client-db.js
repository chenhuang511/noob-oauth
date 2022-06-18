const abstractDb = require('./db.js')

const initConn = async () => {
    return await abstractDb.init()
}

const insert = (doc) => {
    doc.model = 'client'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findByClientId = async (client_id) => {
    let db = await initConn()
    return new Promise((resolve, reject) => {
        db.find({model: 'client', client_id: client_id}, (err, docs) => {
            if (err) reject(err)
            else resolve(docs.pop())
        })
    })
}

//for authentication
const findByClientCredentials = async (realm, client_id, client_secret) => {
    let db = await initConn()
    return new Promise((resolve, reject) => {
        db.find({model: 'client', realm: realm, client_id: client_id, client_secret: client_secret}, (err, docs) => {
            if (err) reject(err)
            else resolve(docs.pop())
        })
    })
}

const removeAll = () => {
    return abstractDb.removeAll('client')
}

module.exports = {insert, findById, findByClientId, findByClientCredentials, removeAll}