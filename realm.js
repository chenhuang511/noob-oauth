const realmDb = require('./realm-db.js')

const create = async (name) => {
    let doc = {name: name, active: 1}
    try {
        return await realmDb.insert(doc)
    } catch (e) {
        throw e
    }
}

const check = async (name) => {
    let doc = await realmDb.findByName(name)
    //return true/false
    return !!doc._id;
}

const removeAll = async () => {
    return await realmDb.removeAll()
}

module.exports = {create, check, removeAll}