const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cookieParser = require("cookie-parser")
const sessions = require('express-session')
const logger = require('./logger.js')
const crypto = require('crypto')
const helmet = require('helmet')

//api controller
const oauth2AuthorizeController = require('./web-api/oauth2-authorize-api.js')
const oauth2TokenController = require('./web-api/oauth2-token-api.js')
const oauth2LogoutController = require('./web-api/oauth2-logout-api.js')
const oauth2MetadataController = require('./web-api/oauth2-metadata-api.js')
const oauth2UserInfoController = require('./web-api/oauth2-userinfo-api.js')

const app = express()
const PORT = 4000

//view engine setup
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.set('views', path.join(__dirname, './web-view/'))

app.use(sessions({
    secret: crypto.randomBytes(16).toString('base64'),
    saveUninitialized: true,
    resave: false,
    cookie: {
        // secure: true,
        httpOnly: true,
    }
}))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('./web-view/static'))

// security configure
//TODO: the domains from client redirect uris should be filtered, we should intercept depend on the registration information from all clients
// app.use(helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
//         'form-action': ["'self'"],
//     },
// }))
app.use(helmet.noSniff())
app.use(helmet.xssFilter())

// default api
app.get('/', (req, res) => {
    res.json({message: 'Hello world'})
})

// oauth2 api
app.use('/oauth2', oauth2AuthorizeController)
app.use('/oauth2', oauth2TokenController)
app.use('/oauth2', oauth2LogoutController)
app.use('/oauth2', oauth2MetadataController)
app.use('/oauth2', oauth2UserInfoController)

// start app
app.listen(PORT, () => {
    logger.l('noob oauth started')
})