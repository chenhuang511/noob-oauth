const client1 = {
    id: 'client_1',
    realm: 'noob-realm',
    callback: 'http://localhost:3005/callback',
    roles: ['user', 'admin'],
    secret: '7s9SAqgf3BJtUUXkGReQ',
}

const client2 = {
    id: 'client_2',
    realm: 'noob-realm',
    callback: 'http://localhost:3006/callback',
    roles: ['user', 'admin'],
    secret: 'DgJGDRlK7bfTCbXctt9x',
}

const clients = [client1, client2]

const authenticate = (realm, client_id, client_secret) => {
    let f = false
    for (let c of clients) {
        f = realm === c.realm && client_id === c.id && client_secret === c.secret
        if (f) return c
    }
    return f
}

const exist = (client_id) => {
    let f = false
    for (let c of clients) {
        f = client_id === c.id
        if (f) return c
    }
    return f
}

module.exports = {authenticate, exist}