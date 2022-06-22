const constants = require('../constants')

const getOAuth2Config = (realm) => {
    let issuer = constants.oauth2_base_url + '/' + realm
    let authorization_endpoint = constants.oauth2_base_url + `/${realm}/authorize`
    let token_endpoint = constants.oauth2_base_url + `/${realm}/token`
    let scopes_supported = constants.scopes_supported
    let response_types_supported = constants.response_types_supported
    let grant_types_supported = constants.grant_types_supported
    let end_session_endpoint = constants.oauth2_base_url + `/${realm}/logout`
    return {
        issuer,
        authorization_endpoint,
        token_endpoint,
        scopes_supported,
        response_types_supported,
        grant_types_supported,
        end_session_endpoint
    }
}

module.exports = {getOAuth2Config}