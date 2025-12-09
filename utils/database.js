const mongoose = require('mongoose')
const Logger = require('./logger').pino
const Config = require('../config')
require('dotenv').config()


mongoose.connection.on('connected', () => Logger.info("Connecté à la base de donnée."));
mongoose.connection.on('open', () => Logger.info("Connection ouverte à la base de donnée."));
mongoose.connection.on('disconnected', () => Logger.error("Déconnecter a la base de donnée."));
mongoose.connection.on('reconnected', () => Logger.info("Reconnecté à la base de donnée."));
mongoose.connection.on('disconnecting', () => Logger.error("Déconnection à la base de donnée."));
mongoose.connection.on('close', () => Logger.info("Connection à la base de donnée fermé."));




mongoose.connect(`${process.env.npm_lifecycle_event == 'test' ? process.env.URL_DATABASE_TEST : process.env.URL_DATABASE}/${process.env.npm_lifecycle_event == 'test' ? "TODO_SERVER_TEST" : "TODO_SERVER_PROD"}`)

// console.log(mongoose.connection.readyState)
