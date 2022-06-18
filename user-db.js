const abstractDb = require('./db.js')

const initConn = async () => {
    return await abstractDb.init()
}

const insert = (doc) => {
    doc.model = 'user'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findByUsername = async (realm, username) => {
    let db = await initConn()
    return new Promise((resolve, reject) => {
        db.find({model: 'user', realm: realm, username: username}, (err, docs) => {
            if (err) reject(err)
            else resolve(docs.pop())
        })
    })
}

//for authentication
const findByUserCredentials = async (realm, username, password) => {
    let db = await initConn()
    return new Promise(resolve => {
        db.find({model: 'user', realm: realm, username: username, password: password}, (err, docs) => {
            if (err) reject(err)
            else resolve(docs.pop())
        })
    })
}

const updateGrantedRoles = async (_id, finalRoles) => {
    let db = await initConn()
    return new Promise((resolve, reject) => {
        db.update({_id: _id}, {$set: {granted_roles: finalRoles}}, (err, numReplaced) => {
            if (err) reject(err)
            else resolve(numReplaced)
        })
    })
}

const removeAll = () => {
    return abstractDb.removeAll('user')
}

module.exports = {insert, findById, findByUsername, findByUserCredentials, updateGrantedRoles, removeAll}