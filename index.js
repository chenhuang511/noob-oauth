const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cookieParser = require("cookie-parser")
const sessions = require('express-session')
const logger = require('./logger.js')
const crypto = require('crypto')

//api controller
const oauth2Controller = require('./web-api/oauth2-api.js')

const app = express()
const PORT = 4000

//view engine setup
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.set('views', path.join(__dirname, './web-view/'))

app.use(sessions({
    secret: crypto.randomBytes(16).toString('base64'),
    saveUninitialized: true,
    resave: false
}))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('./web'))

// default api
app.get('/', (req, res) => {
    res.json({message: 'Hello world'})
})

// oauth2 api
app.use('/oauth2', oauth2Controller)

// start app
app.listen(PORT, () => {
    logger.l('noob oauth started')
})