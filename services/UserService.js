const UserSchema = require('../shemas/User')
const SettingService = require('../services/SettingService');
const _ = require('lodash')
const async = require('async')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const bcrypt = require('bcryptjs');
const TokenUtils = require('../utils/token')
const SALT_WORK_FACTOR = 10;

var User = mongoose.model('User', UserSchema)
module.exports.addOneUser = async function (user, options, callback) {
  // console.log("1️⃣  Début addOneUser");

  try {
    // console.log("2️⃣  Vérification longueur password :", user.password?.length);

    if (user.password.length >= 8) {

      // console.log("3️⃣  Génération du sel...");
      const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
      // console.log("4️⃣  Sel généré");

      if (user && user.password) {
        // console.log("5️⃣  Hash du password en cours...");
        user.password = await bcrypt.hash(user.password, salt)
        // console.log("6️⃣  Hash terminé");
      }

      // console.log("7️⃣  Création new User...");
      var new_user = new User(user);
      // console.log("8️⃣  new_user créé :", new_user);

      var errors = new_user.validateSync();
      // console.log("9️⃣  Résultat validateSync :", errors);

      if (errors) {
        // console.log("🔟  Erreurs de validation détectées");

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

        // console.log("1️⃣1️⃣  Callback avec erreur validator");
        callback(err);

      } else {

        // console.log("1️⃣2️⃣  Sauvegarde MongoDB...");
        await new_user.save();
        // console.log("1️⃣3️⃣  Sauvegarde MongoDB OK");

        try {
          // console.log("1️⃣4️⃣  Appel SettingService.addOneSetting...");
          await SettingService.addOneSetting({
            themes: "light",
            language: "fr",
            user_id: new_user._id
          });
          // console.log("1️⃣5️⃣  SettingService OK");

        } catch (err) {
          // console.error("❌ SettingService error:", err);
        }

        // console.log("1️⃣6️⃣  Callback final OK");
        callback(null, new_user.toObject());
      }

    } else {
      // console.log("❌ Mot de passe trop court");
      callback({ msg: "le mot de passe doit faire 8 caractères minimum", type_error: "no-valid" })
    }

  } catch (error) {

    // console.log("❌ ERREUR attrapée :", error);

    if (error.code === 11000) { // Erreur de duplicité
      // console.log("1️⃣7️⃣  Erreur duplicité détectée");

      var field = Object.keys(error.keyValue)[0];
      var err = {
        msg: `Duplicate key error: ${field} must be unique.`,
        fields_with_error: [field],
        fields: { [field]: `The ${field} is already taken.` },
        type_error: "duplicate"
      };

      console.log("1️⃣8️⃣  Callback erreur duplicité");
      callback(err);

    } else {
      console.log("1️⃣9️⃣  Callback erreur générique");
      callback(error); // Autres erreurs
    }
  }
};


module.exports.addManyUsers = async function (users, options, callback) {
  var errors = [];

  // Vérifier les erreurs de validation
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR)
    if (user && user.password)
      user.password = await bcrypt.hash(user.password, salt)
    var new_user = new User(user);
    var error = new_user.validateSync();
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
      const data = await User.insertMany(users, { ordered: false });
      callback(null, data);
    } catch (error) {
      if (error.code === 11000) { // Erreur de duplicité
        const duplicateErrors = error.writeErrors.map(err => {
          //const field = Object.keys(err.keyValue)[0];
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

module.exports.loginUser = async function (email, password, options, callback) {
  module.exports.findOneUser(["email"], email, null, async (err, value) => {
    if (err)
      callback(err)
    else {
      if (bcrypt.compareSync(password, value.password)) {
        var token = TokenUtils.createToken({ _id: value._id }, null)

        module.exports.updateOneUser(value._id, { token: token }, null, (err, value) => {
          callback(null, { ...value, token: token })
        })
      }
      else {
        callback({ msg: "La comparaison des mots de passe est fausse.", type_error: "no-comparaison" })
      }
    }
  })
}

module.exports.findOneUserById = function (user_id, options, callback) {
  if (user_id && mongoose.isValidObjectId(user_id)) {
    User.findById(user_id).then((value) => {
      try {
        if (value) {
          callback(null, value.toObject());
        } else {
          callback({ msg: "Aucun utilisateur trouvé.", type_error: "no-found" });
        }
      }
      catch (e) {

      }
    }).catch((err) => {
      callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
    });
  } else {
    callback({ msg: "ObjectId non conforme.", type_error: 'no-valid' });
  }
}

module.exports.findOneUser = function (tab_field, value, options, callback) {
  var field_unique = ["email"]
  if (tab_field && Array.isArray(tab_field) && value
    && _.filter(tab_field, (e) => {
      return field_unique.indexOf(e) == -1
    }).length == 0) {
    var obj_find = []
    _.forEach(tab_field, (e) => {
      obj_find.push({ [e]: value })
    })
    User.findOne({ $or: obj_find }).then((value) => {
      if (value)
        callback(null, value.toObject())
      else {
        callback({ msg: 'Utilisateur non trouvé.', type_error: 'no-found' })
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


module.exports.findManyUsersById = function (users_id, options, callback) {
  if (users_id && Array.isArray(users_id) && users_id.length > 0 && users_id.filter((e) => { return mongoose.isValidObjectId(e) }).length == users_id.length) {
    users_id = users_id.map((e) => { return new ObjectId(e) })
    User.find({ _id: users_id }).then((value) => {
      try {
        if (value && Array.isArray(value) && value.length != 0) {
          callback(null, value);
        } else {
          callback({ msg: "Aucun utilisateur trouvé.", type_error: "no-found" });
        }
      }
      catch (e) {

      }
    }).catch((err) => {
      callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
    });
  }
  else if (users_id && Array.isArray(users_id) && users_id.length > 0 && users_id.filter((e) => { return mongoose.isValidObjectId(e) }).length != users_id.length) {
    callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: users_id.filter((e) => { return !mongoose.isValidObjectId(e) }) });
  }
  else if (users_id && !Array.isArray(users_id)) {
    callback({ msg: "L'argement n'est pas un tableau.", type_error: 'no-valid' });

  }
  else {
    callback({ msg: "Tableau non conforme.", type_error: 'no-valid' });
  }
}

module.exports.findManyUsers = function (search, page, limit, options, callback) {
  page = !page ? 1 : parseInt(page)
  limit = !limit ? 10 : parseInt(limit)
  if (typeof page !== "number" || typeof limit !== "number" || isNaN(page) || isNaN(limit)) {
    callback({ msg: `format de ${typeof page !== "number" ? "page" : "limit"} est incorrect`, type_error: "no-valid" })
  } else {
    var query_mongo = search ? {
      $or: _.map(["firstName", "lastName", "email"], (e) => {
        return { [e]: { $regex: search } }
      })
    } : {}
    User.countDocuments(query_mongo).then((value) => {
      if (value > 0) {
        const skip = ((page - 1) * limit)
        User.find(query_mongo, null, { skip: skip, limit: limit }).then((results) => {
          callback(null, {
            count: value,
            results: results
          })
        })
      } else {
        callback(null, { count: 0, results: [] })
      }
    }).catch((e) => {
      callback(e)
    })
  }
}

module.exports.updateOneUser = async function (user_id, update, options, callback) {
  if (user_id && mongoose.isValidObjectId(user_id)) {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR)
    if (update && update.password)
      update.password = await bcrypt.hash(update.password, salt)
    User.findByIdAndUpdate(new ObjectId(user_id), update, { returnDocument: 'after', runValidators: true }).then((value) => {
      try {
        // callback(null, value.toObject())
        if (value)
          callback(null, value.toObject())
        else
          callback({ msg: "Utilisateur non trouvé.", type_error: "no-found" });

      } catch (e) {

        callback(e)
      }
    }).catch((errors) => {
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
}

// Fonction pour mettre à jour un utilisateur basé sur une condition spécifique
module.exports.findOneAndUpdate = async function (criteria, update, options, callback) {
  if (!criteria || typeof criteria !== 'object') {
    return callback({ msg: "Critères de recherche invalides.", type_error: 'no-valid' });
  }

  if (!update || typeof update !== 'object') {
    return callback({ msg: "Données de mise à jour invalides.", type_error: 'no-valid' });
  }

  if (update.password) {
    // Vérification des caractères spéciaux
    const invalidChars = /[^a-zA-Z0-9]/;
    if (invalidChars.test(update.password)) {
      return callback({ msg: "Le mot de passe contient des caractères spéciaux non autorisés.", type_error: 'no-valid' });
    }

    // Vérification de la longueur du mot de passe (par exemple, minimum 8 caractères)
    if (update.password.length < 8) {
      return callback({ msg: "Le mot de passe doit contenir au moins 8 caractères.", type_error: 'no-valid' });
    }

    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    update.password = await bcrypt.hash(update.password, salt);
  }

  try {
    // Mise à jour de l'utilisateur
    const user = await User.findOneAndUpdate(criteria, update, { new: true, runValidators: true });
    if (user) {
      callback(null, user.toObject());
    } else {
      callback({ msg: "Utilisateur non trouvé.", type_error: "no-found" });
    }
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const duplicateErrors = {
        msg: `Erreur de clé dupliquée : ${field} doit être unique.`,
        fields_with_error: [field],
        fields: { [field]: `Le ${field} est déjà pris.` },
        type_error: "duplicate"
      };
      callback(duplicateErrors);
    } else {
      const errors = err.errors;
      const text = Object.keys(errors).map((e) => errors[e].properties.message).join(' ');
      const fields = Object.keys(errors).reduce((result, value) => {
        result[value] = errors[value].properties.message;
        return result;
      }, {});
      const errorResponse = {
        msg: text,
        fields_with_error: Object.keys(errors),
        fields: fields,
        type_error: "validator"
      };
      callback(errorResponse);
    }
  }
};

module.exports.updatePassword = async function (email, newPassword, options, callback) {
  if (!email || typeof email !== 'string') {
    return callback({ msg: "L'email est requis et doit être une chaîne de caractères.", type_error: 'no-valid' });
  }

  if (!newPassword || typeof newPassword !== 'string') {
    return callback({ msg: "Le mot de passe est requis et doit être une chaîne de caractères.", type_error: 'no-valid' });
  }

  // Vérification des caractères spéciaux dans le mot de passe
  const invalidChars = /[^a-zA-Z0-9]/;
  if (invalidChars.test(newPassword)) {
    return callback({ msg: "Le mot de passe contient des caractères spéciaux non autorisés.", type_error: 'no-valid' });
  }

  // Vérification de la longueur du mot de passe (minimum 8 caractères)
  if (newPassword.length < 8) {
    return callback({ msg: "Le mot de passe doit contenir au moins 8 caractères.", type_error: 'no-valid' });
  }

  try {
    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mise à jour de l'utilisateur
    const user = await User.findOneAndUpdate(
      { email: email },
      { password: hashedPassword },
      { new: true, runValidators: true }
    );

    if (user) {
      callback(null, user.toObject());
    } else {
      callback({ msg: "Utilisateur non trouvé.", type_error: "no-found" });
    }
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const duplicateErrors = {
        msg: `Erreur de clé dupliquée : ${field} doit être unique.`,
        fields_with_error: [field],
        fields: { [field]: `Le ${field} est déjà pris.` },
        type_error: "duplicate"
      };
      callback(duplicateErrors);
    } else {
      const errors = err.errors;
      const text = Object.keys(errors).map(e => errors[e].properties.message).join(' ');
      const fields = Object.keys(errors).reduce((result, value) => {
        result[value] = errors[value].properties.message;
        return result;
      }, {});
      const errorResponse = {
        msg: text,
        fields_with_error: Object.keys(errors),
        fields: fields,
        type_error: "validator"
      };
      callback(errorResponse);
    }
  }
};

// module.exports.updateManyUsers = async function (users_id, update, options, callback) {
//   if (users_id && Array.isArray(users_id) && users_id.length > 0 && users_id.filter((e) => { return mongoose.isValidObjectId(e) }).length == users_id.length) {
//     users_id = users_id.map((e) => { return new ObjectId(e) })
//     const salt = await bcrypt.genSalt(SALT_WORK_FACTOR)
//     if (update && update.password)
//       update.password = await bcrypt.hash(update.password, salt)
//     User.updateMany({ _id: users_id }, update, { runValidators: true }).then((value) => {
//       try {
//         if (value && value.modifiedCount !== 0)
//           callback(null, value)
//         else
//           callback({ msg: "Utilisateur non trouvé.", type_error: "no-found" })
//       } catch (e) {

//         callback(e)
//       }
//     }).catch((errors) => {
//       if (errors.code === 11000) {
//         var field = Object.keys(errors.keyPattern)[0]
//         const duplicateErrors = {
//           msg: `Duplicate key error: ${field} must be unique.`,
//           fields_with_error: [field],
//           fields: { [field]: `The ${field} is already taken.` },
//           type_error: "duplicate"
//         };
//         callback(duplicateErrors)
//       } else {
//         errors = errors['errors']
//         var text = Object.keys(errors).map((e) => {
//           return errors[e]['properties']['message']
//         }).join(' ')
//         var fields = _.transform(Object.keys(errors), function (result, value) {
//           result[value] = errors[value]['properties']['message'];
//         }, {});
//         var err = {
//           msg: text,
//           fields_with_error: Object.keys(errors),
//           fields: fields,
//           type_error: "validator"
//         }
//       }
//       callback(err)
//     })

//   }
//   else {
//     callback({ msg: "Id invalide.", type_error: 'no-valid' })
//   }
// }

module.exports.deleteOneUser = function (user_id, options, callback) {
  if (user_id && mongoose.isValidObjectId(user_id)) {
    User.findByIdAndDelete(user_id).then((value) => {
      try {
        if (value)
          callback(null, value.toObject())
        else
          callback({ msg: "Utilisateur non trouvé.", type_error: "no-found" });
      }
      catch (e) {

        callback(e)
      }
    }).catch((e) => {
      callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
    })
  }
  else {
    callback({ msg: "Id invalide.", type_error: 'no-valid' })
  }
}

module.exports.deleteManyUsers = function (users_id, options, callback) {
  if (users_id && Array.isArray(users_id) && users_id.length > 0 && users_id.filter((e) => { return mongoose.isValidObjectId(e) }).length == users_id.length) {
    users_id = users_id.map((e) => { return new ObjectId(e) })
    User.deleteMany({ _id: users_id }).then((value) => {
      callback(null, value)
    }).catch((err) => {
      callback({ msg: "Erreur mongo suppression.", type_error: "error-mongo" });
    })
  }
  else if (users_id && Array.isArray(users_id) && users_id.length > 0 && users_id.filter((e) => { return mongoose.isValidObjectId(e) }).length != users_id.length) {
    callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: users_id.filter((e) => { return !mongoose.isValidObjectId(e) }) });
  }
  else if (users_id && !Array.isArray(users_id)) {
    callback({ msg: "L'argement n'est pas un tableau.", type_error: 'no-valid' });

  }
  else {
    callback({ msg: "Tableau non conforme.", type_error: 'no-valid' });
  }
}





















/* 
function checkSchemaUser(user, callback) {
    //var element_check = user
    var element_check = _.pick(user, UserSchema.authorized)
    var required_isnt_include = _.difference(UserSchema.required.sort(), _.keys(_.pick(element_check, UserSchema.required)).sort())
    var required_is_empty = _.filter(UserSchema.required, (e) => { return _.isEmpty(element_check[e]) })
    required_is_empty = _.difference(required_is_empty, required_isnt_include)
    var text_error = ""
    if (required_isnt_include.length > 0)
        text_error += `Une des propriétés requis (${required_isnt_include.join(', ')}) n'est pas inclus. `
    if (required_is_empty.length > 0)
        text_error += `Une des propriétés requis (${required_is_empty.join(', ')}) est inclus mais vide.`
    var error = {
        msg: text_error,
        key_required_not_include: required_isnt_include,
        key_required_empty: required_is_empty
    }
    if (required_isnt_include.length > 0 || required_is_empty.length > 0) {
        callback(error)
    }
    else {
        callback(null, element_check)
    }
}

// La fonction permet d'ajouter un utilisateur.
module.exports.addOneUser = function (user, callback) {
    checkSchemaUser(user, function (err, value) {
        if (err)
            callback(err)
        else {
            value.id = _.uniqueId()
            UserSchema.elements.push(value)
            callback(null, value)
        }
    })
}

// La fonction permet d'ajouter plusieurs utilisateurs.
module.exports.addManyUsers = function (users, callback) {
    var i = 0;
    async.map(users, function (user, next) {
        checkSchemaUser(user, function (err, value) {
            if (err) {
                err.index = i
                next(null, err)
            }
            else {
                next(null, null)
            }
            i++;
        })
    }, function (err, val) {
        var error = _.filter(val, (e) => { return !_.isEmpty(e) })
        if (error.length > 0) {
            callback(error)
        }
        else {
            async.map(users, checkSchemaUser, function (err, val) {
                var tab = _.map(val, (e) => { e.id = _.uniqueId(); return e })
                UserSchema.elements = [...UserSchema.elements, ...tab]
                callback(null, val)
            })
        }
    });
}

// La fonction permet de chercher un utilisateur.
module.exports.findOneUserById = function (id, callback) {
    var user = _.find(UserSchema.elements, ["id", id])
    if (user) {
        callback(null, user)
    }
    else {
        callback({ error: true, msg: 'Utilisateur not found.', error_type: 'Not-Found' })
    }
}

// La fonction permet de chercher plusieurs utilisateurs.
module.exports.findManyUsersByIdById = function (ids, callback) {
    var users = _.filter(UserSchema.elements, (e) => {
        return ids.indexOf(e.id) > -1
    })
    callback(null, users)
}

// La fonction permet de supprimer un utilisateur.
module.exports.deleteOneUser = function (id, callback) {
    var user_index = _.findIndex(UserSchema.elements, ["id", String(id)])
    if (user_index > -1) {
        var user_delete = UserSchema.elements.splice(user_index, 1)[0]
        callback(null, {msg: "Element supprimé.", user_delete: user_delete})
    }
    else {
        callback({error: 1, msg: "L'utilisateur à effacé n'a pas été trouvé. (Id invalide)"})
    }
}

// La fonction permet de supprimer plusieurs utilisateurs.
module.exports.deleteManyUsers = function (ids, callback) {
    var count_remove = 0
    for (var i = 0; i < ids.length;i++) {
        var user_index = _.findIndex(UserSchema.elements, ["id", String(ids[i])])
        if (user_index > -1)  {
            count_remove++
            UserSchema.elements.splice(user_index, 1)
        }

    }
    callback(null, {msg: `${count_remove} élément(s) supprimé(s).`, count_remove: count_remove})
}

// La fonction permet de modifier un utilisateur.
module.exports.updateOneUser = function (id, user_edition, callback) {
    var user_index = _.findIndex(UserSchema.elements, ["id", id])
    var user_tmp = { ...UserSchema.elements[user_index], ...user_edition }
    checkSchemaUser(user_tmp, function (err, value) {
        if (err)
            callback(err)
        else {
            UserSchema.elements[user_index] = { ...UserSchema.elements[user_index], ...value }
            callback(null, UserSchema.elements[user_index])
        }
    })
}

// La fonction permet de modifier plusieurs utilisateurs.
module.exports.updateManyUsers = function () {

} */