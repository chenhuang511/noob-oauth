//TODO: logout process is the Openid Connect context (not OAuth2),
// so need implement the id_token_hint in the logout request
// and normalize the request queries

const userSession = require('../../service/user-session.js')

const confirmLogout = async (realm, serverSession) => {
    if (serverSession) {
        let parsed = serverSession.split('/')
        if (!parsed || parsed.length !== 3) return
        let cookieRealm = parsed[0]
        let authUserId = parsed[1]
        let authHttpSessionId = parsed[2]

        if (cookieRealm !== realm) return

        let authUserSession = await userSession.findByUserIdAndHttpSessionId(cookieRealm, authUserId, authHttpSessionId)
        if (authUserSession) {
            //terminate authenticated session
            await userSession.terminate(authUserSession._id)
        }
    }
}

module.exports = {confirmLogout}