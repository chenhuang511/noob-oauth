const config = require('./config')

module.exports = {
    base_url: `http://localhost:${config.port}`,
    oauth2_base_url: `http://localhost:${config.port}/oauth2`,
    server_session_key: 'noob-session',
    request_session_key: 'request-session',
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    authorization_code_expiration: 300000, //
    jwt_private_key: `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCxxwXlRvxq014a
aoRVjhYnzmLK6m7Mb+ow540jS+yfNcbXMpnLHm92PBdzu8QnJ4vW8STchfkLoAVz
OfeJLx95S8SIgzpuBCxlSdiwxh7gsdU3jD3rFZMhcQmOk+5LoKQc/fgiV82oOGxH
EtKgrdocsUUpFV6HUJUHBTi0XCW/zsI6HBivB/H/sbfylqa5AuHZ0tDtVLDaFNHh
V4uJijdVhBRiIPDo/40eIK8cxbw8t6BBz3dsn927VcjUTf+Hbz+BYm9iVTl75FQe
TcMtvivx3+prHR09gQBsA7UrWDN4iMOH7ju0N8aJBZXlmS7rWEVLQnoH2RL8o/zV
93XIWMltAgMBAAECggEAAY28eLQ93P4jZqYzKV9ARNFKLj1NwhYhTROc+We+teZ9
qiBMVUjbDwS37MBBltkC4RpC6PV3x3j6yzbAuc9yXjhCC7Jf5pm9PJZgYS0eFHch
ZqagXOdXnZV0EK2sybbp8EHs8vni93skwRtCQXq7ewA2m0UPSi3zW3gZdoQOpWY4
ra2rCwVwC6N7QYDVuiI0twZJ+PNh6MCcyrUol5Yk2O+pLaOMJVT8/CM+W46M6EIe
ePCT9bvAeR6QATDzx7deGjY1smUiMqF5jHbqIEGhjNwWnCGLtfpA29sGb3VX6rLb
bw5SVk/bVMr4nUgOj94JByBj5hK5vz11ykVa7KgawQKBgQDv27h35dlLFE1qtZuz
EdJwsPhDrApX6Q0ciGJbQ+exowO2JbbuCSzYKRrigzST2N/4QDWCcB9J0+7Us8ze
ZnKnQNY4i3L4kkWPBCdGyJbhgsP6skHZ9iPyQcikP5aLOVBvtaNfx5lvgXXTk/1A
gyHWFzrzvWaQlfLOekQM5fwOwQKBgQC9vcX5M1hp397RUtdQotx648uxBFgnfdCZ
mq8atUVb+1pvwdgsRciCK4/p9yLF61+K7VqIWJgstlToZHZqPog9tLsvwLkXVppU
8NKHC8HN2KScJzAImqCCNz6fn0/1xt0WSmmGKKYZDs0li02PA31v6cICkFeMXIrz
s8zMqggRrQKBgQDSifUUGUdw5bNGtX6j4kLr9AsXq42wuLpvjy92mNZpUIPTgKtf
qeIZI4ubxDuEg1ulFwdhJXXxYfxD7Ecp+JcvRHRFUfJrSkmQTb8EHNKDxDqudYXk
AnBvF1s9ASvtrTNzuuZbDmMaQ3LfcwlbdT9gIyf2BwxeYaCtqRjOkZl8gQKBgQCM
Gnz8rbUzOGNHHWxv1lIHS/00EIknX/eP9HAnwIIekVMOAoyk5EJSG+iAUkQS8OHz
q5+V3hU/rsKzdrsZaGMhbTpq4FvLp979qXVK0puga7/gre8B62tpu3E6XGCmktjd
hMS2k31SM2O3vUzftSwCXxEq43pB4nOXz8QBu+uJYQKBgQDGhaVkarxKv5rzT6W5
gkwJ53qLIePpmqZeR2WsTjQa6kWbuLVTyj1Sg4zHITS60OmNC6D3+Mx3+ZD3PCmK
1YId1xiaJr/yhj1oaHyQh1rAvyt55Sn5qe5qFHZWy6cB1NXpDiFg/oh5EpwTJVxB
0CqXGbO+8CThqS3BGs08391JFQ==
-----END PRIVATE KEY-----`,
    jwt_public_key: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsccF5Ub8atNeGmqEVY4W
J85iyupuzG/qMOeNI0vsnzXG1zKZyx5vdjwXc7vEJyeL1vEk3IX5C6AFczn3iS8f
eUvEiIM6bgQsZUnYsMYe4LHVN4w96xWTIXEJjpPuS6CkHP34IlfNqDhsRxLSoK3a
HLFFKRVeh1CVBwU4tFwlv87COhwYrwfx/7G38pamuQLh2dLQ7VSw2hTR4VeLiYo3
VYQUYiDw6P+NHiCvHMW8PLegQc93bJ/du1XI1E3/h28/gWJvYlU5e+RUHk3DLb4r
8d/qax0dPYEAbAO1K1gzeIjDh+47tDfGiQWV5Zku61hFS0J6B9kS/KP81fd1yFjJ
bQIDAQAB
-----END PUBLIC KEY-----`,
    jwt_key_id: '418aa5be-e5d3-41d7-9b9b-025faca9cbd7',
    jwt_expiry_seconds: 1800,
    token_type: 'Bearer',
    default_client_type: 'confidential',
    default_client_scope: ['email', 'profile'],
    scopes_supported: ['email', 'profile', 'phone', 'roles', 'address']
}