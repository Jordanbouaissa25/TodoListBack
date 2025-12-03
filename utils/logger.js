const fs = require('fs');
const pretty = require('pino-pretty')

const logStream = fs.createWriteStream(`logs/${new Date().toLocaleString().split('/').join('-').split(':')
    .join('_')}__${process.env.npm_lifecycle_event != 'test'
        ? "PRODUCTION" : "TESTING"}.log`, { flasg: 'a' })

const prettyStream = pretty()
prettyStream.pipe(logStream)

const pino_http = require('pino-http')(process.env.npm_lifecycle_event != 'test' ? prettyStream : logStream)
const pino = require('pino')(process.env.npm_lifecycle_event != 'test' ? prettyStream : logStream)

module.exports.http = pino_http
module.exports.pino = pino