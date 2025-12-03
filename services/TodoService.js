const todoSchema = require('../shemas/Todo');
const appid = require('../config').appid
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var Todo = mongoose.model('Todo', todoSchema)

Todo.createIndexes();

module.exports.addOneTodo = async function ( user_id, options, callback) {
    // console.log("ok")
    try {
        // const responseOfApi = await http.get(`?q=${city}&units=metric&appid=${appid}`)
        console.log(responseOfApi.data)
        const todo = {
            user_id: user_id,
        }
        var new_todo = new Todo(todo);
        var errors = new_todo.validateSync();
        if (errors) {
            errors = errors['errors'];
            var text = Object.keys(errors).map((e) => {
                return errors[e]['properties'];
            }).join(' ');
            var fields = _.transform(Object.keys(errors), function (result, value) {
                result[value] = errors[value]['properties'];
            }, {});
            var err = {
                msg: text,
                fields_with_error: Object.keys(errors),
                fields: fields,
                type_error: "validator"
            };
            callback(err);
        } else {
            await new_todo.save();
            callback(null, new_todo.toObject());
        }
    } catch (error) {
        // console.log(error)
        if (error.code === 11000) { // Erreur de duplicité
            var field = Object.keys(error.keyValue)[0];
            var err = {
                msg: `Duplicate key error: ${field} must be unique.`,
                fields_with_error: [field],
                fields: { [field]: `The ${field} is already taken.` },
                type_error: "duplicate"
            };
            callback(err);
        } else {
            if (error.response.data.cod === "404") {
                return callback({ msg: "todo renseignée n'existe pas", type_error: "no-found" })
            }
            if (error.response.data.cod === "400") {
                return callback({ msg: "informations renseignées non valides", type_error: "no-valid" })
            }
            callback(error); // Autres erreurs
        }
    }
};



module.exports.addManyTodos = async function (user_id, options, callback) {
    const todos = [];
    const errors = [];

    for (const city of cities) {
        try {
            // const responseOfApi = await http.get(`?q=${city}&appid=${appid}`);
            // console.log(responseOfApi)
            const todo = {
                user_id: user_id,
            };
            // console.log(responseOfApi.data.sys.sunset)
            const new_todo= new Todo(todo);
            const validationErrors = new_todo.validateSync();

            if (validationErrors) {
                const errorDetails = validationErrors['errors'];
                const errorMsg = Object.keys(errorDetails).map((e) => {
                    return errorDetails[e]['properties']['message'];
                }).join(' ');

                const fields = _.transform(Object.keys(errorDetails), function (result, value) {
                    result[value] = errorDetails[value]['properties']['message'];
                }, {});

                errors.push({
                    msg: errorMsg,
                    fields_with_error: Object.keys(errorDetails),
                    fields: fields,
                    city: city,
                    type_error: "validator"
                });
            } else {
                todos.push(new_todo);
            }
        } catch (error) {
            // console.log(`Error processing city ${city}:`, error);
            if (error.code === 11000) { // Duplicate key error
                const field = Object.keys(error.keyValue)[0];
                errors.push({
                    msg: `Duplicate key error: ${field} must be unique.`,
                    fields_with_error: [field],
                    fields: { [field]: `The ${field} is already taken.` },
                    city: city,
                    type_error: "duplicate"
                });
            } else if (error.response && error.response.data.cod === "404") {
                errors.push({ msg: "ville renseignée n'existe pas", type_error: "no-found", city: city });
            } else if (error.response && error.response.data.cod === "400") {
                errors.push({ msg: "informations renseignées non valides", type_error: "no-valid", city: city });
            } else {
                errors.push({ msg: "Une erreur inattendue est survenue", type_error: "unknown", city: city, error });
            }
        }
    }

    if (errors.length > 0) {
        callback({ msg: "Certaines todos n'ont pas été ajoutées", errors, type_error: "multi" });
        return;
    }

    try {
        const data = await Todo.insertMany(todos, { ordered: false });
        callback(null, data);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error during batch insert
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
            callback({ msg: "Certaines todos n'ont pas été ajoutées", errors: duplicateErrors, type_error: "multi" });
        } else {
            callback(error); // Other errors
        }
    }
};

module.exports.findOneTodoById = async function (todo_id, options, callback) {
    try {
        // Vérifier si l'ID fourni est un ObjectId valide
        if (!mongoose.isValidObjectId(todo_id)) {
            return callback({
                msg: "ObjectId non conforme.",
                type_error: 'no-valid'
            });
        }

        // Options pour la requête, incluant la population de champs associés si spécifié
        const opts = { populate: options && options.populate ? ["user_id"] : [] };

        // Rechercher le todo par son ID
        const todo = await Todo.findById(todo_id, null, opts).exec();

        // Gérer les cas où aucune todo correspondant n'est trouvé
        if (!todo) {
            return callback({
                msg: "Aucun todo trouvé.",
                type_error: "no-found"
            });
        }

        // Retourner les données trouvées
        return callback(null, todo.toObject());
    } catch (error) {
        // Gérer les erreurs potentielles lors de la requête MongoDB
        console.error('Erreur lors de la recherche en base de données:', error);
        return callback({
            msg: "Impossible de chercher l'élément.",
            type_error: "error-mongo"
        });
    }
};




module.exports.findOneTodo = function (tab_field, value, option, callback) {
    const opt = { populate: option && option.populate ? ["user_id"] : [] };
    // const field_unique = ["humidity", "city"];

    // Validation des champs
    if (
        tab_field &&
        Array.isArray(tab_field) &&
        value &&
        _.filter(tab_field, (e) => field_unique.indexOf(e) === -1).length === 0
    ) {
        const obj_find = _.map(tab_field, (e) => ({ [e]: value }));

        // Requête à MongoDB
        Todo.findOne({ $or: obj_find }, null, opt)
            .then((result) => {
                if (result) {
                    callback(null, result.toObject());
                } else {
                    callback({ msg: 'Todo non trouvé.', type_error: 'no-found' });
                }
            })
            .catch((err) => {
                callback({ msg: "Erreur interne MongoDB", type_error: "error-mongo" });
            });
    } else {
        // Construction du message d'erreur
        let msg = "";

        if (!tab_field || !Array.isArray(tab_field)) {
            msg += "Les champs de recherche sont incorrects.";
        }

        if (!value) {
            msg += msg ? " Et la valeur de recherche est vide." : "La valeur de recherche est vide.";
        }

        const field_not_authorized = _.filter(tab_field, (e) => field_unique.indexOf(e) === -1);
        if (field_not_authorized.length > 0) {
            msg += msg
                ? ` Et (${field_not_authorized.join(',')}) ne sont pas des champs autorisés.`
                : `Les champs (${field_not_authorized.join(',')}) ne sont pas des champs de recherche autorisés.`;

            callback({
                msg: msg,
                type_error: "no-valid",
                field_not_authorized: field_not_authorized,
            });
        } else {
            callback({ msg: msg, type_error: "no-valid" });
        }
    }
};

module.exports.findManyTodos = function (search, page, limit, options, callback) {
    page = !page ? 1 : parseInt(page)
    limit = !limit ? 10 : parseInt(limit)
    var populate = options && options.populate ? ['user_id'] : []
    if (typeof page !== "number" || typeof limit !== "number" || isNaN(page) || isNaN(limit)) {
        callback({ msg: `format de ${typeof page !== "number" ? "page" : "limit"} est incorrect`, type_error: "no-valid" })
    } else {
        var query_mongo = search ? {
            $or: _.map(["name"], (e) => {
                return { [e]: { $regex: search } }
            })
        } : {}
        Todo.countDocuments(query_mongo).then((value) => {
            if (value > 0) {
                const skip = ((page - 1) * limit)
                Todo.find(query_mongo, null, { skip: skip, limit: limit, populate: populate, lean: true }).then((results) => {
                    callback(null, {
                        count: value,
                        results: results
                    })
                })
            } else {
                callback(null, { count: 0, results: [] })
            }
        }).catch((e) => {
            // console.log(e)
            callback(e)
        })
    }
}

module.exports.updateOneTodo = function (todo_id, update, callback) {
    if (todo_id && mongoose.isValidObjectId(todo_id)) {
        Todo.findByIdAndUpdate(todo_id, update, { new: true, runValidators: true })
            .then((value) => {
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Todo non trouvé.", type_error: "no-found" });
                }
            })
            .catch((errors) => {
                if (errors.code === 11000) {
                    var field = Object.keys(errors.keyPattern)[0]
                    const duplicateErrors = {
                        msg: `Duplicate key error: ${field} must be unique.`,
                        fields_with_error: [field],
                        fields: { [field]: `The ${field} is already taken.` },
                        type_error: "duplicate"
                    };
                    callback(duplicateErrors)
                } else {
                    errors = errors['errors']
                    var text = Object.keys(errors).map((e) => {
                        return errors[e]['properties']['message']
                    }).join(' ')
                    var fields = _.transform(Object.keys(errors), function (result, value) {
                        result[value] = errors[value]['properties']['message'];
                    }, {});
                    var err = {
                        msg: text,
                        fields_with_error: Object.keys(errors),
                        fields: fields,
                        type_error: "validator"
                    }
                    callback(err)
                }
            })

    } else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
};

module.exports.updateManyTodos = function (todos_id, update, callback) {
    if (Array.isArray(todos_id) && todos_id.length > 0 && todos_id.every(mongoose.isValidObjectId)) {
        const ids = todos_id.map(id => new ObjectId(id));
        Todo.updateMany({ _id: { $in: ids } }, update, { runValidators: true })
            .then((value) => {
                if (value.modifiedCount > 0) {
                    callback(null, value);
                } else {
                    callback({ msg: "Aucune todo trouvé.", type_error: "no-found" });
                }
            })
            .catch((errors) => {
                if (errors.code === 11000) {
                    var field = Object.keys(errors.keyPattern)[0]
                    const duplicateErrors = {
                        msg: `Duplicate key error: ${field} must be unique.`,
                        fields_with_error: [field],
                        fields: { [field]: `The ${field} is already taken.` },
                        type_error: "duplicate"
                    };
                    callback(duplicateErrors)
                } else {
                    errors = errors['errors']
                    var text = Object.keys(errors).map((e) => {
                        return errors[e]['properties']['message']
                    }).join(' ')
                    var fields = _.transform(Object.keys(errors), function (result, value) {
                        result[value] = errors[value]['properties']['message'];
                    }, {});
                    var err = {
                        msg: text,
                        fields_with_error: Object.keys(errors),
                        fields: fields,
                        type_error: "validator"
                    }
                }
                callback(err)
            })

    }
    else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
};

module.exports.deleteOneTodo = function (todo_id, callback) {
    if (todo_id && mongoose.isValidObjectId(todo_id)) {
        Todo.findByIdAndDelete(todo_id)
            .then((value) => {
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Todo non trouvé.", type_error: "no-found" });
                }
            })
            .catch((err) => {
                callback({ msg: "Impossible de supprimer l'élément.", type_error: "error-mongo" });
            });
    } else {
        callback({ msg: "ObjectId non conforme.", type_error: 'no-valid' });
    }
};

module.exports.deleteManyTodos = function (todos_id, callback) {
    if (Array.isArray(todos_id) && todos_id.length > 0 && todos_id.every(mongoose.isValidObjectId)) {
        const ids = todos_id.map(id => new ObjectId(id));
        Todo.deleteMany({ _id: { $in: ids } })
            .then((value) => {
                callback(null, value);
            })
            .catch((err) => {
                callback({ msg: "Erreur lors de la suppression.", type_error: "error-mongo" });
            });
    } else {
        callback({ msg: "Liste d'IDs non conforme.", type_error: 'no-valid' });
    }
};

function handleValidationErrors(errors, index = null) {
    errors = errors['errors'];
    const text = Object.keys(errors).map(e => errors[e]['properties']['message']).join(' ');
    const fields = _.transform(Object.keys(errors), (result, value) => {
        result[value] = errors[value]['properties']['message'];
    }, {});
    return {
        msg: text,
        fields_with_error: Object.keys(errors),
        fields: fields,
        index: index,
        type_error: "validator"
    };
}

function handleMongoError(error, callback) {
    if (error.code === 11000) { // Erreur de duplicité
        const field = Object.keys(error.keyValue)[0];
        const err = {
            msg: `Duplicate key error: ${field} must be unique.`,
            fields_with_error: [field],
            fields: { [field]: `The ${field} is already taken.` },
            type_error: "duplicate"
        };
        callback(err);
    } else {
        callback(error); // Autres erreurs
    }
}
