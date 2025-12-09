const TaskSchema = require('../shemas/Task');
const mongoose = require('mongoose');
const _ = require('lodash');
const ObjectId = mongoose.Types.ObjectId;

var Task = mongoose.model('Task', TaskSchema);

// Création d'une tâche
module.exports.createTask = async function (task, options, callback) {
  try {
    var new_task = new Task(task);
    var errors = new_task.validateSync();

    if (errors) {
      errors = errors.errors;
      const text = Object.keys(errors).map(e => errors[e].properties.message).join(' ');
      const fields = _.transform(Object.keys(errors), (result, value) => {
        result[value] = errors[value].properties.message;
      }, {});
      return callback({
        msg: text,
        fields_with_error: Object.keys(errors),
        fields: fields,
        type_error: "validator"
      });
    }

    await new_task.save();
    callback(null, new_task.toObject());
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      callback({
        msg: `Duplicate key error: ${field} must be unique.`,
        fields_with_error: [field],
        fields: { [field]: `The ${field} is already taken.` },
        type_error: "duplicate"
      });
    } else {
      callback(err);
    }
  }
};

// Récupérer une tâche par ID
module.exports.findTaskById = function (task_id, options, callback) {
  if (!task_id || !mongoose.isValidObjectId(task_id)) {
    return callback({ msg: "ID invalide.", type_error: 'no-valid' });
  }

  Task.findById(task_id).then(task => {
    if (task) {
      callback(null, task.toObject());
    } else {
      callback({ msg: "Tâche non trouvée.", type_error: "no-found" });
    }
  }).catch(err => {
    callback({ msg: "Erreur Mongo.", type_error: "error-mongo" });
  });
};

// Récupérer toutes les tâches d'un utilisateur
module.exports.findUserTasks = function (user_id, options, callback) {
  if (!user_id || !mongoose.isValidObjectId(user_id)) {
    return callback({ msg: "ID utilisateur invalide.", type_error: 'no-valid' });
  }

  Task.find({ user_id: new ObjectId(user_id) }).then(tasks => {
    callback(null, tasks);
  }).catch(err => {
    callback({ msg: "Erreur Mongo.", type_error: "error-mongo" });
  });
};

// Mettre à jour une tâche par ID
module.exports.updateTask = function (task_id, update, options, callback) {
  if (!task_id || !mongoose.isValidObjectId(task_id)) {
    return callback({ msg: "ID invalide.", type_error: 'no-valid' });
  }

  Task.findByIdAndUpdate(task_id, update, { new: true, runValidators: true })
    .then(task => {
      if (task) callback(null, task.toObject());
      else callback({ msg: "Tâche non trouvée.", type_error: "no-found" });
    })
    .catch(err => {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        callback({
          msg: `Duplicate key error: ${field} must be unique.`,
          fields_with_error: [field],
          fields: { [field]: `The ${field} is already taken.` },
          type_error: "duplicate"
        });
      } else {
        callback(err);
      }
    });
};

// Supprimer une tâche par ID
module.exports.deleteTask = function (task_id, options, callback) {
  if (!task_id || !mongoose.isValidObjectId(task_id)) {
    return callback({ msg: "ID invalide.", type_error: 'no-valid' });
  }

  Task.findByIdAndDelete(task_id).then(task => {
    if (task) callback(null, task.toObject());
    else callback({ msg: "Tâche non trouvée.", type_error: "no-found" });
  }).catch(err => {
    callback({ msg: "Erreur Mongo.", type_error: "error-mongo" });
  });
};
