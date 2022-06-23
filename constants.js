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
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDC9BXl62AqR09U
4mOw4qS7TJCcrWfgrl4F0Vmq4ABnJjB5qsLTyCOTdJXxurNvmLfKiyfzGrzGB2Lq
g2yV+l6KSrD6+XWE1uke5Iz2sdTUSSZR67tHfZFffB0hKEOESN86bUPe1D3RPRT4
uOOQLVb7JojDDKWntI8iGC7YzFZhX4YL9ov0rdDn1aVcPsCjEuvCwcO43/jFepR1
mJWhR6uJg8n4gbHoKo2VPs7P+fIuvsgam5N22/WWnG7HmYih9becH7cmQ8ooXY0j
DhWLR0+zcWj3eW75/4/Dx5NjpDEQQpRGzcTYlshPR8iwt4jZ/xJ7os333ggAfBNK
1WQKZVy1AgMBAAECggEADqSbwnW/9tz9UfBhMYeMfP7+u63wp/kg2coENKf3j8fY
C0Nut86IEYrHumzeDmtHnsB+Ay4GcM9cOCYf8VHpaPS8P1WeZJhp0Sa0idEIndtS
tAODQRbm5OejHnryO0zn63EKkIGblQxD93yXpxwotNuLmS7pgGO4/oQXfLQ4Zr7O
+IG6JsrB9Oo6EMmU5Gepew7YYtko1gUs1THnfM5jm+4XPL7fcbnRGyHirItufZtJ
lK5Gd450hVSd95M6oudy7e4aWjorsZ+Rx/IM6dnGMxpKd0lN6+lvN3q4jgegcPEt
dxVqElvZNLLaaBZj65NG6y721CUav9C7V5HyRBPnYQKBgQDhc34HnkU8cTClxudc
B/dqtuR4TRCiBbcG01gpK+QJNGHLxVpzgUXb0QaGMuW22oJuSruLKrXT3kpDUECN
taGS/vOpZ6TiM3h8SQom9TV02pEKgSJLbyXI950lGkbSUMmktcCpTugtfD4FJo+z
2N3FvZWfhtVl1XOfD8YOkvY28QKBgQDdXq6EXM9bZ18GcoqpYnhQngK3RY6bkd4w
IjNIWvn89mtWv6sEb53ll9vuTwMsAuI9kwkVYr/o43PuqTy62D/5K02VOrTAs+ZE
Vj2dM6oZn/t16bpUZA/HN9JUqRk3trqtJCgd3Sfuf+3ouiRLlIFNp5CgTZ79FDQN
jhKXvz7qBQKBgBijQHCgsTxLul9Df2ElVbqJxioHcfvi1/+c9RN6wm7nFJDqPlpF
FFdTXn0n7sau1nYrIJey0TAYKNF2Ybea0892oTYwJ2q46T/b04oyXecpQ5R8TD0m
JmDx/nBhkL/HKGIhoq5d+y2NWFHDxwyGdKX5c/J9D7ETRJFrbd+F2/ZhAoGARzoy
zvYJ5jAhnDJ4uT2s1suwtgWUeCv8IOKwO4TCUQl8yiHLxhaf6ILvSgN0UtHut786
uf3XH/knkVA08S2pj+PGB9Em3aZE3hIdqxo3jh0yzOLSiFrV1NT6QTFTouCRuiob
GljRg2T4SNyz1vnGjRTwbRPspyO8B+yBwP/RH30CgYBAoXWd91za2VdoHylPy6ua
PkQ28XvekxQznvzb8y44XuggWwFHNTpVxkfzYGMvrtJObNvQsZjKm2Sdn0Wnux41
wTMX7FzxzByDesDsK81dLKKMbVZsZo9KtUqLwNBnEB/kYwf7fg4/hTKBJd0foEbd
wvXL82pWNcpuJDaId3av7g==
-----END PRIVATE KEY-----`,
    jwt_public_key: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwvQV5etgKkdPVOJjsOKk
u0yQnK1n4K5eBdFZquAAZyYwearC08gjk3SV8bqzb5i3yosn8xq8xgdi6oNslfpe
ikqw+vl1hNbpHuSM9rHU1EkmUeu7R32RX3wdIShDhEjfOm1D3tQ90T0U+LjjkC1W
+yaIwwylp7SPIhgu2MxWYV+GC/aL9K3Q59WlXD7AoxLrwsHDuN/4xXqUdZiVoUer
iYPJ+IGx6CqNlT7Oz/nyLr7IGpuTdtv1lpxux5mIofW3nB+3JkPKKF2NIw4Vi0dP
s3Fo93lu+f+Pw8eTY6QxEEKURs3E2JbIT0fIsLeI2f8Se6LN994IAHwTStVkCmVc
tQIDAQAB
-----END PUBLIC KEY-----`,
    jwt_cert: `-----BEGIN CERTIFICATE-----
MIIDAjCCAeqgAwIBAgIEYrPtSTANBgkqhkiG9w0BAQsFADBDMQswCQYDVQQGEwJW
TjEXMBUGA1UECgwOU29mdGRyZWFtcyBKU0MxGzAZBgNVBAMMEk5vb2IgT0F1dGgy
IFNlcnZlcjAeFw0yMjA2MjMwNDM0MTdaFw0yMzA2MjMwNDM0MTdaMEMxCzAJBgNV
BAYTAlZOMRcwFQYDVQQKDA5Tb2Z0ZHJlYW1zIEpTQzEbMBkGA1UEAwwSTm9vYiBP
QXV0aDIgU2VydmVyMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwvQV
5etgKkdPVOJjsOKku0yQnK1n4K5eBdFZquAAZyYwearC08gjk3SV8bqzb5i3yosn
8xq8xgdi6oNslfpeikqw+vl1hNbpHuSM9rHU1EkmUeu7R32RX3wdIShDhEjfOm1D
3tQ90T0U+LjjkC1W+yaIwwylp7SPIhgu2MxWYV+GC/aL9K3Q59WlXD7AoxLrwsHD
uN/4xXqUdZiVoUeriYPJ+IGx6CqNlT7Oz/nyLr7IGpuTdtv1lpxux5mIofW3nB+3
JkPKKF2NIw4Vi0dPs3Fo93lu+f+Pw8eTY6QxEEKURs3E2JbIT0fIsLeI2f8Se6LN
994IAHwTStVkCmVctQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQC0oYbuIBLpOvGw
0bpbbn9CiUd61tfOmNz3GVucCifDVMqdoC4+aWlgujLmRWBdtGyZKPOeCVDsfoqV
eauJnqmIuUXCwcNUpbiUFwcziZaG71CcTmHl9hrT8aB1Dw1ebipvmWv0ME27DM6r
XX5XWlRXZzrLgdhcWWYWpd4couhWlrQ4FZtEwyWq3ubcIC5+1j4cL1OZHgqRQRts
d8XgS4yC2q2HOUEuCtp+Gb0WjEbjpIk4e7zIZ6xTpakw3IC+Y3mGVWs265+XI4in
vaT+jvywXYHZUr/R4SJnuTQ5I9ghUK7nQPNIuXdx70d/BiDW5tStZT7RkZSB8Inr
khStJlKF
-----END CERTIFICATE-----`,
    jwt_key_id: 'YRJaHrxJDZ+1WtIoerLsX5VsAwM=',
    jwt_expiry_seconds: 1800,
    token_type: 'Bearer',
    default_client_type: 'confidential',
    default_client_scope: ['email', 'profile'],
    scopes_supported: ['email', 'profile', 'phone', 'roles', 'address']
}