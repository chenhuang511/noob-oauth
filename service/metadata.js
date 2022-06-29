const constants = require('../constants')
const crypto = require('crypto')

let keys = []

const getOAuth2Config = (realm) => {
    let issuer = constants.oauth2_base_url + '/' + realm
    let authorization_endpoint = constants.oauth2_base_url + `/${realm}/authorize`
    let token_endpoint = constants.oauth2_base_url + `/${realm}/token`
    let scopes_supported = constants.scopes_supported
    let response_types_supported = constants.response_types_supported
    let grant_types_supported = constants.grant_types_supported
    let end_session_endpoint = constants.oauth2_base_url + `/${realm}/logout`
    let userinfo_endpoint = constants.oauth2_base_url + `/${realm}/userinfo`
    let jwks_uri = constants.oauth2_base_url + `/${realm}/certs`
    return {
        issuer,
        authorization_endpoint,
        token_endpoint,
        userinfo_endpoint,
        jwks_uri,
        scopes_supported,
        response_types_supported,
        grant_types_supported,
        end_session_endpoint
    }
}

const getCertConfig = (realm) => {
    if (!keys || keys.length === 0) {
        let pemPublicKey = constants.jwt_public_key
        let pemCert = constants.jwt_cert

        const pubKey = crypto.createPublicKey(pemPublicKey)
        const jwkExported = pubKey.export({format: 'jwk'})
        let kty = jwkExported.kty
        let n = jwkExported.n
        let e = jwkExported.e
        const x509cert = new crypto.X509Certificate(new Buffer(pemCert))
        let x5t = Buffer.from(x509cert.fingerprint.replace(/:/g, ''), 'hex').toString('base64')
        let x5tS256 = Buffer.from(x509cert.fingerprint256.replace(/:/g, ''), 'hex').toString('base64')
        let kid = x5t
        let cert = pemCert.replace('-----BEGIN CERTIFICATE-----', '')
            .replace('-----END CERTIFICATE-----', '')
            .replace(/\r\n|\r|\n/g, '')
        let x5c = []
        x5c.push(cert)
        let alg = 'RS256'
        keys.push({kid, use: 'sig', kty, alg, n, e, x5c, x5t, 'x5t#S256': x5tS256})
    }
    return {keys}
}

// console.log(getCertConfig('noob-realm'))

module.exports = {getOAuth2Config, getCertConfig}