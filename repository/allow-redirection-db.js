const abstractDb = require('./db.js')

const initConn = async () => {
    return await abstractDb.init()
}

const insert = (doc) => {
    doc.model = 'allow_redirection'
    return abstractDb.insert(doc)
}

const findAll = async () => {
    let db = await initConn()
    return new Promise(((resolve, reject) => {
        db.find({model: 'allow_redirection'}, (err, docs) => {
            if (err) reject(err)
            let urls = ["'self'"]
            docs.forEach(d => urls.push(d.domain))
            urls = [...new Set(urls)]
            resolve(urls)
        })
    }))
}

const removeByClientId = async (client_id) => {
    let db = await initConn()
    return new Promise(((resolve, reject) => {
        db.remove({model: 'allow_redirection', client_id}, (err, removedNum) => {
            if (err) reject(err)
            resolve(removedNum)
        })
    }))
}

const removeAll = () => {
    return abstractDb.removeAll('allow_redirection')
}

module.exports = {insert, findAll, removeByClientId, removeAll}