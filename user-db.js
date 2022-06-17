const abstractDb = require('./db.js')
const logger = require('./logger.js')

const db = abstractDb.init().catch(e => logger.l(e))

db.ensureIndex({fieldName: 'username', unique: true})

const insert = (doc) => {
    doc.model = 'user'
    return abstractDb.insert(doc)
}

const findById = (id) => {
    return abstractDb.findById(id)
}

const findByUsername = (realm, username) => {
    return new Promise(resolve => {
        db.find({model: 'user', realm: realm, username: username}, (err, docs) => {
            if (err) logger.l(err)
            else resolve(docs.pop())
        })
    })
}

//for authentication
const findByUserCredentials = (realm, username, password) => {
    return new Promise(resolve => {
        db.find({model: 'user', realm: realm, username: username, password: password}, (err, docs) => {
            if (err) logger.l(err)
            else resolve(docs.pop())
        })
    })
}

const updateGrantedRoles = (_id, finalRoles) => {
    return new Promise(resolve => {
        db.update({_id: _id}, {$set: {granted_roles: finalRoles}}, (err, numReplaced) => {
            if (err) logger.l(err)
            else resolve(numReplaced)
        })
    })
}

module.exports = {insert, findById, findByUsername, findByUserCredentials, updateGrantedRoles}