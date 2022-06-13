const user1 = {
    realm: 'noob-realm',
    username: 'user01',
    password: '123456',
    client_roles: [
        {client: 'client_1', roles: ['user']},
        {client: 'client_2', roles: ['user']}
    ],
    realm_roles: ['realm-user', 'default-roles-noob-realm'],
    granted_client_scopes: 'profile email'
}

const user2 = {
    realm: 'noob-realm',
    username: 'user02',
    password: '123456',
    client_roles: [
        {client: 'client_1', roles: ['admin']},
        {client: 'client_2', roles: ['admin']}
    ],
    realm_roles: ['realm-user', 'default-roles-noob-realm'],
    granted_client_scopes: 'profile email'
}

let users = [user1, user2]

const authenticate = (realm, username, password) => {
    let f = false
    for (let u of users) {
        f = realm === u.realm && username === u.username && password === u.password
        if (f) return u
    }
    return f
}

const register = (realm, username, password) => {
    let realm_roles = ['realm-user', `default-roles-${realm}`]
    let client_roles = [
        {client: 'client_1', roles: ['user']},
        {client: 'client_2', roles: ['user']}
    ]
    let granted_client_scopes = 'profile email'
    users.push({realm, username, password, realm_roles, client_roles, granted_client_scopes})
}

module.exports = {authenticate, register}