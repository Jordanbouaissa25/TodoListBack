const TaskService = require('./../services/TaskService')
const LoggerHttp = require('../utils/logger').http
const passport = require('passport')

// Créer une tâche
module.exports.createTask = function (req, res) {
    req.log.info("Création d'une tâche")
    TaskService.createTask(req.body, null, (err, value) => {
        if (err && err.type_error === "validator") {
            res.statusCode = 405
            res.send(err)
        } else if (err && err.type_error === "duplicate") {
            res.statusCode = 405
            res.send(err)
        } else {
            res.statusCode = 201
            res.send(value)
        }
    })
}

// Chercher une tâche par ID
module.exports.findTaskById = function (req, res) {
    req.log.info("Chercher une tâche")
    TaskService.findTaskById(req.params.id, null, (err, value) => {
        if (err && err.type_error === "no-found") {
            res.statusCode = 404
            res.send(err)
        } else if (err && err.type_error === "no-valid") {
            res.statusCode = 405
            res.send(err)
        } else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// Récupérer toutes les tâches d'un utilisateur
module.exports.findUserTasks = function (req, res) {
    req.log.info("Récupérer les tâches d'un utilisateur")
    TaskService.findUserTasks(req.params.userId, null, (err, value) => {
        if (err && err.type_error === "no-found") {
            res.statusCode = 404
            res.send(err)
        } else if (err && err.type_error === "no-valid") {
            res.statusCode = 405
            res.send(err)
        } else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// Mettre à jour une tâche
module.exports.updateTask = function (req, res) {
    const taskId = req.params.id
    const taskData = req.body
    req.log.info("Modifier une tâche")
    TaskService.updateTask(taskId, taskData, null, (err, value) => {
        if (err && err.type_error === "no-found") {
            res.statusCode = 404
            res.send(err)
        } else if (err && err.type_error === "validator") {
            res.statusCode = 405
            res.send(err)
        } else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// Supprimer une tâche
module.exports.deleteTask = function (req, res) {
    req.log.info("Supprimer une tâche")
    TaskService.deleteTask(req.params.id, null, (err, value) => {
        if (err && err.type_error === "no-found") {
            res.statusCode = 404
            res.send(err)
        } else if (err && err.type_error === "no-valid") {
            res.statusCode = 405
            res.send(err)
        } else {
            res.statusCode = 200
            res.send(value)
        }
    })
}