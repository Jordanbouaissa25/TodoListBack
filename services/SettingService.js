const SettingSchema = require('../shemas/Setting');
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var Setting = mongoose.model('Setting', SettingSchema)

Setting.createIndexes();

module.exports.addOneSetting = async function (setting, options, callback) {
    try {
        var new_setting = new Setting(setting);
        var errors = new_setting.validateSync();
        if (errors) {
            errors = errors['errors'];
            var text = Object.keys(errors).map((e) => {
                return errors[e]['properties']['message'];
            }).join(' ');
            var fields = _.transform(Object.keys(errors), function (result, value) {
                result[value] = errors[value]['properties']['message'];
            }, {});
            var err = {
                msg: text,
                fields_with_error: Object.keys(errors),
                fields: fields,
                type_error: "validator"
            };
            callback(err);
            // console.log(err)
        } else {
            await new_setting.save();
            callback(null, new_setting.toObject());
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
             return (err); //  // Autres erreurs
        }
    }
};



module.exports.addManySettings = async function (settings, callback) {
    var errors = [];

    // Vérifier les erreurs de validation
    for (var i = 0; i < settings.length; i++) {
        var setting = settings[i];
        var new_setting = new Setting(setting);
        var error = new_setting.validateSync();
        if (error) {
            error = error['errors'];
            var text = Object.keys(error).map((e) => {
                return error[e]['properties']['message'];
            }).join(' ');
            var fields = _.transform(Object.keys(error), function (result, value) {
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
        callback(errors);
    } else {
        try {
            // Tenter d'insérer les utilisateurs
            const data = await Setting.insertMany(settings, { ordered: false });
            callback(null, data);
        } catch (error) {
            if (error.code === 11000) { // Erreur de duplicité
                const duplicateErrors = error.writeErrors.map(err => {
                    // const field = Object.keys(err.keyValue)[0];
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
                callback(error); // Autres erreurs
            }
        }
    }
};



module.exports.findOneSettingById = function (user_id, options, callback) {
    var opts = { populate: options && options.populate ? ["user_id"] : [] }
    // console.log('Received setting_id:', setting_id); // Debugging log
    if (user_id && mongoose.isValidObjectId(user_id)) {
        Setting.findOne({ user_id: user_id }, null, opts)
            .then((value) => {
                //   console.log('Found value:', value); // Debugging log
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Aucun setting trouvé.", type_error: "no-found" });
                }
            })
            .catch((err) => {
                console.error('Error querying database:', err); // Debugging log
                callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
            });
    } else {
        console.error('Invalid ObjectId:', user_id); // Debugging log
        callback({ msg: "ObjectId non conforme.", type_error: 'no-valid' });
    }
};


module.exports.findOneSetting = function (tab_field, value, option, callback) {
    var opt = { populate: option && option.populate ? ["user_id"] : [] }
    // var field_unique = ["setting_wind", "setting_temperature"]
    if (tab_field && Array.isArray(tab_field) && value
        && _.filter(tab_field, (e) => {
            return field_unique.indexOf(e) == -1
        }).length == 0) {
        var obj_find = []
        _.forEach(tab_field, (e) => {
            obj_find.push({ [e]: value })
        })
        Setting.findOne({ $or: obj_find }, null, opt).then((value) => {
            if (value)
                callback(null, value.toObject())
            else {
                callback({ msg: 'Setting non trouvé.', type_error: 'no-found' })
            }
        }).catch((err) => {
            callback({ msg: "Error interne mongo", type_error: "error-mongo" })
        })
    }
    else {
        let msg = ""
        if (!tab_field || !Array.isArray(tab_field)) {
            msg += "Les champs de recherche sont incorrecte."
        }
        if (!value) {
            msg += msg ? " Et la valeur de recherche est vide." : "La valeur de recherche est vide."
        }
        if (_.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1 }).length > 0) {
            var field_not_authorized = _.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1 })
            msg += msg ? ` Et (${field_not_authorized.join(',')}) ne sont pas des champs autorisés.` :
                `Les champs (${field_not_authorized.join(',')}) ne sont pas des champs de recherche autorisé`
            callback({ msg: msg, type_error: "no-valid", field_not_authorized: field_not_authorized })
        } else {
            callback({ msg: msg, type_error: "no-valid" })
        }
    }
}

module.exports.findManySettingsById = function (settings_id, options, callback) {
    var opts = { populate: options && options.populate ? ["user_id"] : [], lean: true }
    if (settings_id && Array.isArray(settings_id) && settings_id.length > 0 && settings_id.filter((e) => { return mongoose.isValidObjectId(e) }).length == settings_id.length) {
        settings_id = settings_id.map((e) => { return new ObjectId(e) })
        Setting.find({ _id: settings_id }, null, opts).then((value) => {
            try {
                if (value && Array.isArray(value) && value.length != 0) {
                    callback(null, value);
                } else {
                    callback({ msg: "Aucun setting trouvé.", type_error: "no-found" });
                }
            }
            catch (e) {

            }
        }).catch((err) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        });
    }
    else if (settings_id && Array.isArray(settings_id) && settings_id.length > 0 && settings_id.filter((e) => { return mongoose.isValidObjectId(e) }).length != settings_id.length) {
        callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: settings_id.filter((e) => { return !mongoose.isValidObjectId(e) }) });
    }
    else if (settings_id && !Array.isArray(settings_id)) {
        callback({ msg: "L'argement n'est pas un tableau.", type_error: 'no-valid' });

    }
    else {
        callback({ msg: "Tableau non conforme.", type_error: 'no-valid' });
    }
}


module.exports.findManySettings = function (search, page, limit, options, callback) {
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
        Setting.countDocuments(query_mongo).then((value) => {
            if (value > 0) {
                const skip = ((page - 1) * limit)
                Setting.find(query_mongo, null, { skip: skip, limit: limit, populate: populate, lean: true }).then((results) => {
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

module.exports.updateOneSetting = function (setting_id, update, callback) {
    if (setting_id && mongoose.isValidObjectId(setting_id)) {
        Setting.findByIdAndUpdate(setting_id, update, { new: true, runValidators: true })
            .then((value) => {
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Setting non trouvé.", type_error: "no-found" });
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

module.exports.updateManySettings = function (settings_id, update, callback) {
    if (Array.isArray(settings_id) && settings_id.length > 0 && settings_id.every(mongoose.isValidObjectId)) {
        const ids = settings_id.map(id => new ObjectId(id));
        Setting.updateMany({ _id: { $in: ids } }, update, { runValidators: true })
            .then((value) => {
                if (value.modifiedCount > 0) {
                    callback(null, value);
                } else {
                    callback({ msg: "Aucun setting trouvé.", type_error: "no-found" });
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

module.exports.deleteOneSetting = function (setting_id, callback) {
    if (setting_id && mongoose.isValidObjectId(setting_id)) {
        Setting.findByIdAndDelete(setting_id)
            .then((value) => {
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Setting non trouvé.", type_error: "no-found" });
                }
            })
            .catch((err) => {
                callback({ msg: "Impossible de supprimer l'élément.", type_error: "error-mongo" });
            });
    } else {
        callback({ msg: "ObjectId non conforme.", type_error: 'no-valid' });
    }
};

module.exports.deleteManySettings = function (settings_id, callback) {
    if (Array.isArray(settings_id) && settings_id.length > 0 && settings_id.every(mongoose.isValidObjectId)) {
        const ids = settings_id.map(id => new ObjectId(id));
        Setting.deleteMany({ _id: { $in: ids } })
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
