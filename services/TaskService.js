const TaskSchema = require('../shemas/Task');
const _ = require('lodash');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var Task = mongoose.model('Task', TaskSchema);

Task.createIndexes();

/* -------------------------------------------------------------------------- */
/*                               ADD ONE TASK                                 */
/* -------------------------------------------------------------------------- */

module.exports.addOneTask = async function (task, options, callback) {
    try {
        var new_task = new Task(task);
        var errors = new_task.validateSync();

        if (errors) {
            errors = errors['errors'];
            var text = Object.keys(errors).map(e => errors[e]['properties']['message']).join(' ');
            var fields = _.transform(Object.keys(errors), (result, value) => {
                result[value] = errors[value]['properties']['message'];
            }, {});
            callback({
                msg: text,
                fields_with_error: Object.keys(errors),
                fields: fields,
                type_error: "validator"
            });
        } else {
            await new_task.save();
            callback(null, new_task.toObject());
        }

    } catch (error) {
        if (error.code === 11000) {
            var field = Object.keys(error.keyValue)[0];
            callback({
                msg: `Duplicate key error: ${field} must be unique.`,
                fields_with_error: [field],
                fields: { [field]: `The ${field} is already taken.` },
                type_error: "duplicate"
            });
        } else {
            callback(error);
        }
    }
};

/* -------------------------------------------------------------------------- */
/*                               ADD MANY TASKS                               */
/* -------------------------------------------------------------------------- */

module.exports.addManyTasks = async function (tasks, callback) {
    var errors = [];

    for (var i = 0; i < tasks.length; i++) {
        var new_task = new Task(tasks[i]);
        var error = new_task.validateSync();

        if (error) {
            error = error['errors'];
            var text = Object.keys(error).map(e => error[e]['properties']['message']).join(' ');
            var fields = _.transform(Object.keys(error), (result, value) => {
                result[value] = error[value]['properties']['message'];
            }, {});

            errors.push({
                msg: text,
                fields_with_error: Object.keys(error),
                fields: fields,
                index: i,
                type_error: "validator"
            });
        }
    }

    if (errors.length > 0) {
        return callback(errors);
    }

    try {
        const inserted = await Task.insertMany(tasks, { ordered: false });
        callback(null, inserted);
    } catch (error) {
        if (error.code === 11000) {
            const duplicateErrors = error.writeErrors.map(err => {
                const field = err.err.errmsg.split(" dup key: { ")[1].split(':')[0].trim();
                return {
                    msg: `Duplicate key error: ${field} must be unique.`,
                    fields_with_error: [field],
                    fields: { [field]: `The ${field} is already taken.` },
                    index: err.index,
                    type_error: "duplicate"
                };
            });
            callback(duplicateErrors);
        } else {
            callback(error);
        }
    }
};

/* -------------------------------------------------------------------------- */
/*                        FIND ALL TASKS FROM ONE USER                        */
/* -------------------------------------------------------------------------- */

module.exports.findTasksByUser = function (user_id, options, callback) {
    var opts = { populate: options && options.populate ? ["user_id"] : [], lean: true };

    if (user_id && mongoose.isValidObjectId(user_id)) {
        Task.find({ user_id: user_id }, null, opts)
            .then(tasks => {
                if (tasks && tasks.length > 0) callback(null, tasks);
                else callback({ msg: "Aucune tâche trouvée pour cet utilisateur.", type_error: "no-found" });
            })
            .catch(() => callback({ msg: "Erreur interne mongo.", type_error: "error-mongo" }));
    } else {
        callback({ msg: "ObjectId non conforme.", type_error: "no-valid" });
    }
};

/* -------------------------------------------------------------------------- */
/*                               FIND ONE TASK                                */
/* -------------------------------------------------------------------------- */

module.exports.findOneTask = function (task_id, options, callback) {
    var opts = { populate: options && options.populate ? ["user_id"] : [] };

    if (!task_id || !mongoose.isValidObjectId(task_id)) {
        return callback({ msg: "ObjectId non conforme.", type_error: "no-valid" });
    }

    Task.findById(task_id, null, opts)
        .then(task => {
            if (task) callback(null, task.toObject());
            else callback({ msg: "Tâche non trouvée.", type_error: "no-found" });
        })
        .catch(() => callback({ msg: "Erreur interne mongo.", type_error: "error-mongo" }));
};

/* -------------------------------------------------------------------------- */
/*                              UPDATE ONE TASK                               */
/* -------------------------------------------------------------------------- */

module.exports.updateOneTask = function (task_id, update, callback) {
    if (!task_id || !mongoose.isValidObjectId(task_id)) {
        return callback({ msg: "Id invalide.", type_error: "no-valid" });
    }

    Task.findByIdAndUpdate(task_id, update, { new: true, runValidators: true })
        .then(task => {
            if (task) callback(null, task.toObject());
            else callback({ msg: "Tâche non trouvée.", type_error: "no-found" });
        })
        .catch(errors => {
            if (errors.code === 11000) {
                var field = Object.keys(errors.keyPattern)[0];
                callback({
                    msg: `Duplicate key error: ${field} must be unique.`,
                    fields_with_error: [field],
                    fields: { [field]: `The ${field} is already taken.` },
                    type_error: "duplicate"
                });
            } else {
                errors = errors['errors'];
                var text = Object.keys(errors).map(e => errors[e]['properties']['message']).join(' ');
                var fields = _.transform(Object.keys(errors), (result, value) => {
                    result[value] = errors[value]['properties']['message'];
                }, {});
                callback({
                    msg: text,
                    fields_with_error: Object.keys(errors),
                    fields: fields,
                    type_error: "validator"
                });
            }
        });
};

/* -------------------------------------------------------------------------- */
/*                              DELETE ONE TASK                               */
/* -------------------------------------------------------------------------- */

module.exports.deleteOneTask = function (task_id, callback) {
    if (!task_id || !mongoose.isValidObjectId(task_id)) {
        return callback({ msg: "ObjectId non conforme.", type_error: "no-valid" });
    }

    Task.findByIdAndDelete(task_id)
        .then(task => {
            if (task) callback(null, task.toObject());
            else callback({ msg: "Tâche non trouvée.", type_error: "no-found" });
        })
        .catch(() => callback({ msg: "Erreur interne Mongo.", type_error: "error-mongo" }));
};

/* -------------------------------------------------------------------------- */
/*                             DELETE MANY TASKS                              */
/* -------------------------------------------------------------------------- */

module.exports.deleteManyTasks = function (tasks_id, callback) {
    if (!Array.isArray(tasks_id) || tasks_id.length === 0 || !tasks_id.every(mongoose.isValidObjectId)) {
        return callback({ msg: "Liste d'IDs non conforme.", type_error: "no-valid" });
    }

    const ids = tasks_id.map(id => new ObjectId(id));

    Task.deleteMany({ _id: { $in: ids } })
        .then(res => callback(null, res))
        .catch(() => callback({ msg: "Erreur interne Mongo.", type_error: "error-mongo" }));
};
