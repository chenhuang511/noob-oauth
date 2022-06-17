const winston = require('winston')
const logRotation = require('winston-daily-rotate-file')
const path = require('path')
const url = require('url')
const config = require('./config.js')

const log = winston.createLogger({
    transports: [
        new winston.transports.DailyRotateFile({
                filename: '%DATE%.txt',
                level: 'info',
                dirname: __dirname + '/logs',
                format: winston.format.combine(
                    winston.format.timestamp({
                        format: "YYYY-MM-DD HH:mm:ss"
                    }),
                    winston.format.json(),
                    winston.format.printf(i => `${i.timestamp} --- ${i.message}`)
                )
            }
        )
    ]
})

const l = (msg) => {
    //console log for debugging
    if (config.debug) console.log(msg)
    log.info(msg)
}

module.exports = {l}