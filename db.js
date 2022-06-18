const Datastore = require('nedb')
const logger = require('./logger.js')
let db = new Datastore({filename: './data/noob-auth.db', autoload: true})

let _checkInit = false

const init = async () => {
    _checkInit = await loadPromise()
    return db
}

const loadPromise = () => {
    return new Promise(((resolve, reject) => {
        db.loadDatabase((err) => {
            if (err) reject(false)
            else resolve(true)
        })
    }))
}

const insert = (doc) => {
    return new Promise((resolve, reject) => {
        db.insert(doc, (err, newDoc) => {
            if (err) reject(err)
            else resolve(newDoc._id)
        })
    })
}

const findById = (id) => {
    return new Promise(((resolve, reject) => {
        db.findOne({_id: id}, (err, doc) => {
            if (err) logger.l(err)
            else resolve(doc)
        })
    }))
}

const removeOne = (id) => {
    return new Promise(((resolve, reject) => {
        db.remove({_id: id}, (err, numRemoved) => {
            if (err) reject(err)
            else resolve(numRemoved)
        })
    }))
}

const removeAll = (model) => {
    return new Promise(((resolve, reject) => {
        db.remove({model: model}, (err, numRemoved) => {
            if (err) reject(err)
            else resolve(numRemoved)
        })
    }))
}

const checkInit = () => _checkInit

module.exports = {init, checkInit, insert, findById, removeAll, removeOne}