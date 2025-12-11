const TaskService = require('../services/TaskService');
const LoggerHttp = require('../utils/logger').http;

// ───────────────────────────────────────────────────────────
// Ajouter une Task
// ───────────────────────────────────────────────────────────
module.exports.addOneTask = function (req, res) {
    req.log.info("Création d'une Task");

    TaskService.addOneTask(req.body, null, function (err, value) {
        if (err && err.type_error === "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error === "validator") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error === "duplicate") {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 201;
            res.send(value);
        }
    });
};

// ───────────────────────────────────────────────────────────
// Ajouter plusieurs Tasks
// ───────────────────────────────────────────────────────────
module.exports.addManyTasks = function (req, res) {
    req.log.info("Création de plusieurs Tasks");

    TaskService.addManyTasks(req.body, function (err, value) {
        if (err) {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 201;
            res.send(value);
        }
    });
};

// ───────────────────────────────────────────────────────────
// Chercher toutes les tasks d’un utilisateur
// ───────────────────────────────────────────────────────────
module.exports.findTasksByUser = function (req, res) {
    req.log.info("Chercher les tasks d'un utilisateur");

    TaskService.findTasksByUser(req.params.user_id, {}, function (err, value) {
        if (err && err.type_error === "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error === "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

// ───────────────────────────────────────────────────────────
// Chercher une Task
// ───────────────────────────────────────────────────────────
module.exports.findOneTask = function (req, res) {
    req.log.info("Chercher une Task");

    TaskService.findOneTask(req.params.id, {}, function (err, value) {
        if (err && err.type_error === "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error === "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error === "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

// ───────────────────────────────────────────────────────────
// Modifier une Task
// ───────────────────────────────────────────────────────────
module.exports.updateOneTask = function (req, res) {
    const TaskId = req.params.id;
    const TaskData = req.body;

    req.log.info("Modifier une Task");

    TaskService.updateOneTask(TaskId, TaskData, function (err, value) {
        if (err && err.type_error === "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && (err.type_error === "validator" || err.type_error === "duplicate")) {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error === "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

// ───────────────────────────────────────────────────────────
// Supprimer une Task
// ───────────────────────────────────────────────────────────
module.exports.deleteOneTask = function (req, res) {
    req.log.info("Supprimer une Task");

    TaskService.deleteOneTask(req.params.id, function (err, value) {
        if (err && err.type_error === "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error === "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error === "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

// ───────────────────────────────────────────────────────────
// Supprimer plusieurs Tasks
// ───────────────────────────────────────────────────────────
module.exports.deleteManyTasks = function (req, res) {
    let ids = req.query.id;
    if (ids && !Array.isArray(ids)) {
        ids = [ids];
    }

    req.log.info("Supprimer plusieurs Tasks");

    TaskService.deleteManyTasks(ids, function (err, value) {
        if (err && err.type_error === "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error === "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error === "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};
