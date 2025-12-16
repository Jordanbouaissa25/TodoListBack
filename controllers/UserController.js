const UserService = require('../services/UserService')
const LoggerHttp = require('../utils/logger').http
const passport = require('passport')

// La fonction pour gerer l'authentification depuis passport
module.exports.loginUser = function (req, res, next) {
    passport.authenticate('login', { badRequestMessage: "Les champs sont manquants." }, async function (err, user) {
        if (err) {
            res.statusCode = 405
            return res.send({ msg: "Le nom d'utilisateur ou mot de passe n'est pas correct.", type_error: "no-valid-login" })
        }
        else {
            req.logIn(user, async function (err) {
                if (err) {
                    // console.log(err)
                    res.statusCode = 500
                    return res.send({ msg: "Problème d'authentification sur le serveur.", type_error: "internal" })
                }
                else {
                    return res.send(user)
                }
            })
        }
    })(req, res, next)
}

/**
 * @swagger
 * /loginUser:
 *  post:
 *    summary: Log in a user
 *    description: Authenticates a user with a username and password
 *    tags:
 *      - Auth
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      username:
 *                          type: string
 *                          example: "user@example.com"
 *                      password:
 *                          type: string
 *                          example: "password123"
 *    responses:
 *       200:
 *          description: User successfully logged in
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *       405:
 *          description: Invalid login credentials
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    example: "Le nom d'utilisateur ou mot de passe n'est pas correct."
 *                  type_error:
 *                    type: string
 *                    example: "no-valid-login"
 *       500:
 *          description: Internal server error during authentication
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    example: "Problème d'authentification sur le serveur."
 *                  type_error:
 *                    type: string
 *                    example: "internal"
 */

module.exports.loginWithApple = function (req, res) {
    const { appleId, email } = req.body;

    if (!appleId) {
        res.statusCode = 405;
        return res.send({
            msg: "AppleId manquant.",
            type_error: "no-valid"
        });
    }

    UserService.loginWithApple(appleId, email, null, (err, user) => {
        if (err && err.type_error === "server-error") {
            res.statusCode = 500;
            return res.send({ msg: "Erreur serveur", type_error: "server-error" });
        }
        else if (err) {
            res.statusCode = 405;
            return res.send(err);
        }
        else {
            res.statusCode = 200;
            return res.send(user);
        }
    });
};

module.exports.logoutUser = function (req, res) {
    req.log.info("Déconnexion d'un utilisateur")
    UserService.updateOneUser(req.user._id, { token: "" }, null, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "validator") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "duplicate") {
            res.statusCode = 405
            res.send(err)
        }
        else {
            res.statusCode = 201
            res.send({ message: "L'utilisateur est déconnecté." })
        }
    })
}

/**
 * @swagger
 * /logoutUser:
 *  post:
 *    summary: Log out a user
 *    description: Logs out the currently authenticated user
 *    tags:
 *      - Auth
 *    responses:
 *       201:
 *          description: User successfully logged out
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "L'utilisateur est déconnecté."
 *       404:
 *          description: User not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    example: "Utilisateur non trouvé."
 *                  type_error:
 *                    type: string
 *                    example: "no-found"
 *       405:
 *          description: Validation error in request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/responses/ValidationError'
 *       500:
 *          description: Internal server error during logout
 */

// La fonction permet d'ajouter un utilisateur.
module.exports.addOneUser = function (req, res) {
    req.log.info("Création d'un utilisateur")
    UserService.addOneUser(req.body, null, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "validator") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "duplicate") {
            res.statusCode = 405
            res.send(err)
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else {
            res.statusCode = 201
            res.send(value)
        }
    })
}

/**
 * @swagger
 * /addOneUser:
 *  post:
 *    summary: add a new user
 *    description: add new user during registration
 *    tags:
 *      - User
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                  $ref: '#/components/schemas/User'
 *    responses:
 *       201:
 *          description: user is correctly created
 *          content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/User'
 *       405:
 *          description: error in body of request
 *          $ref: '#/components/responses/ValidationError'
 *       500:
 *          description: Internal server error.
 */

module.exports.addManyUsers = function (req, res) {
    req.log.info("Création de plusieurs utilisateurs")
    UserService.addManyUsers(req.body, null, function (err, value) {
        if (err) {
            res.statusCode = 405
            res.send(err)
        }
        else {
            res.statusCode = 201
            res.send(value)
        }
    })
}

/**
 * @swagger
 * /addManyUsers:
 *  post:
 *    summary: Add multiple new users
 *    description: Adds multiple new users to the system
 *    tags:
 *      - User
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                  type: array
 *                  items:
 *                      $ref: '#/components/schemas/User'
 *    responses:
 *       201:
 *          description: Users are correctly created
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/User'
 *       405:
 *          description: Error in body of request
 *          $ref: '#/components/responses/ValidationError'
 *       500:
 *          description: Internal server error
 */

// La fonction permet de chercher un utilisateur.
module.exports.findOneUserById = function (req, res) {
    req.log.info("Chercher un utilisateur")
    UserService.findOneUserById(req.params.id, null, function (err, value) {
        // 
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

/**
 * @swagger
 * /findOneUserById/{id}:
 *  get:
 *    summary: Find a user by ID
 *    description: Retrieve a user's information by their unique ID.
 *    tags:
 *      - User
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The user ID
 *    responses:
 *       200:
 *          description: User found and returned successfully.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *       404:
 *          description: User not found.
 *       405:
 *          description: Invalid request, such as incorrect ID format.
 *       500:
 *          description: Internal server error.
 */

module.exports.findOneUser = function (req, res) {
    var fields = req.query.fields
    if (fields && !Array.isArray(fields))
        fields = [fields]
    req.log.info("Chercher un utilisateur")
    UserService.findOneUser(fields, req.query.value, null, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

/**
 * @swagger
 * /findOneUser:
 *  get:
 *    summary: Find a user by specific fields
 *    description: Retrieve a user's information by querying specific fields such as username or email
 *    tags:
 *      - User
 *    parameters:
 *      - in: query
 *        name: fields
 *        required: true
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *        description: The fields to search by (e.g., username, email)
 *        example: ["username", "email"]
 *      - in: query
 *        name: value
 *        required: true
 *        schema:
 *          type: string
 *        description: The value to search for in the specified fields
 *    responses:
 *       200:
 *          description: User found and returned
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *       404:
 *          description: User not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  msg:
 *                    type: string
 *                    example: "Utilisateur non trouvé."
 *                  type_error:
 *                    type: string
 *                    example: "no-found"
 *       405:
 *          description: Invalid query
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/responses/ValidationError'
 *       500:
 *          description: Internal server error
 */


module.exports.findManyUsers = function (req, res) {
    let page = req.query.page;
    let limit = req.query.limit;
    let search = req.query.q
    req.log.info("Chercher des utilisateurs")
    UserService.findManyUsers(search, page, limit, null, (err, value) => {
        if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

/**
 * @swagger
 * /findManyUsers:
 *  get:
 *    summary: Find multiple users
 *    description: Retrieve a list of users based on search criteria, with pagination options.
 *    tags:
 *      - User
 *    parameters:
 *      - in: query
 *        name: q
 *        schema:
 *          type: string
 *        description: Search query to filter users by a certain keyword (e.g., username, email).
 *        example: john_doe
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        description: Page number for pagination (starts from 1).
 *        example: 1
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: Number of users to return per page.
 *        example: 10
 *    responses:
 *       200:
 *          description: A list of users was retrieved successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/User'
 *       405:
 *          description: Invalid query parameters.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/responses/ValidationError'
 *       500:
 *          description: Internal server error.
 */

// La fonction permet de chercher plusieurs utilisateurs.
module.exports.findManyUsersById = function (req, res) {
    var arg = req.query.id
    if (arg && !Array.isArray(arg))
        arg = [arg]
    req.log.info("Chercher plusieurs utilisateurs")
    UserService.findManyUsersById(arg, null, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

/**
 * @swagger
 * /findManyUsersById{id}:
 *  get:
 *    summary: Find multiple users by their IDs
 *    description: Retrieve a list of users by providing an array of user IDs.
 *    tags:
 *      - User
 *    parameters:
 *      - in: query
 *        name: id
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *        description: Array of user IDs to search for.
 *        example: ["userId1", "userId2", "userId3"]
 *    responses:
 *       200:
 *          description: Users found and returned successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/User'
 *       404:
 *          description: Users not found.
 *       405:
 *          description: Invalid request, such as incorrect ID format.
 *       500:
 *          description: Internal server error.
 */

module.exports.updateOneUser = function (req, res) {
    const userId = req.params.id;
    const userData = req.body;
    req.log.info("Modifier un utilisateur")
    UserService.updateOneUser(userId, userData, null, (err, value) => {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "validator") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && (err.type_error == "no-valid" || err.type_error == "validator" || err.type_error == "duplicate")) {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    })
};

/**
 * @swagger
 * /updateOneUser:
 *  put:
 *    summary: Update a user's details
 *    description: Update a user's information by their unique ID.
 *    tags:
 *      - User
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: The user ID
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *    responses:
 *       200:
 *          description: User updated successfully.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *       404:
 *          description: User not found.
 *       405:
 *          description: Error in the request body.
 *       500:
 *          description: Internal server error.
 */


module.exports.updatePassword = function (req, res) {
    const email = req.body.email
    const newPassword = req.body.newPassword;
    req.log.info("Modifier un mot de passe")
    UserService.findOneAndUpdate({ email: email }, { password: newPassword }, null, (err, value) => {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "validator") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && (err.type_error == "no-valid" || err.type_error == "validator" || err.type_error == "duplicate")) {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    })
}

/**
 * @swagger
 * /updatePassword:
 *  put:
 *    summary: Update a user's password
 *    description: Update the password of a user based on their email.
 *    tags:
 *      - User
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                    example: user@example.com
 *                  newPassword:
 *                    type: string
 *                    example: NewPass123
 *    responses:
 *       200:
 *          description: Password updated successfully.
 *       404:
 *          description: User not found.
 *       405:
 *          description: Validation error or invalid request.
 *       500:
 *          description: Internal server error.
 */


module.exports.findOneAndUpdate = function (req, res) {
    const updateData = req.body; // Par exemple { password: "NewPass123" }
    // console.log(updateData)
    req.log.info("Mise à jour des informations d'un utilisateur");

    UserService.findOneAndUpdate({ _id: req.user._id }, updateData, null, (err, value) => {
        if (err && err.type_error === "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && (err.type_error === "no-valid" || err.type_error === "validator" || err.type_error === "duplicate")) {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

/**
 * @swagger
 * /findOneAndUpdate:
 *  put:
 *    summary: Update authenticated user's details
 *    description: Update the information of the currently authenticated user.
 *    tags:
 *      - User
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *    responses:
 *       200:
 *          description: User updated successfully.
 *       404:
 *          description: User not found.
 *       405:
 *          description: Validation error or invalid request.
 *       500:
 *          description: Internal server error.
 */


// module.exports.updateManyUsers = function (req, res) {
//     let usersId = req.query.id; // Récupère les IDs des utilisateurs à mettre à jour depuis le corps de la requête
//     const updateData = req.body; // Récupère les données mises à jour depuis le corps de la requête
//     if (usersId && !Array.isArray(usersId)) {
//         usersId = [usersId]
//     }
//     req.log.info("Modifier plusieurs utilisateurs")
//     UserService.updateManyUsers(usersId, updateData, null, (err, value) => {
//         if (err && err.type_error == "no-found") {
//             res.statusCode = 404;
//             res.send(err);
//         } else if (err && err.type_error == "no-valid") {
//             res.statusCode = 405;
//             res.send(err);
//         } else if (err && (err.type_error == "validator" || err.type_error == "duplicate")) {
//             res.statusCode = 405;
//             res.send(err);
//         } else {
//             res.statusCode = 200;
//             res.send(value);
//         }
//     });
// };

// La fonction permet de supprimer un utilisateur.
module.exports.deleteOneUser = function (req, res) {
    req.log.info("Supprimer un utilisateur")
    UserService.deleteOneUser(req.params.id, null, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

/**
 * @swagger
 * /deleteOneUser:
 *  delete:
 *    summary: Delete a user
 *    description: Delete a specific user by their unique ID.
 *    tags:
 *      - User
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: The user ID to delete.
 *    responses:
 *       200:
 *          description: User deleted successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Utilisateur supprimé avec succès."
 *       404:
 *          description: User not found.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-found"
 *                  message:
 *                    type: string
 *                    example: "Utilisateur non trouvé."
 *       405:
 *          description: Invalid request (invalid user ID or other validation errors).
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/responses/ValidationError'
 *       500:
 *          description: Internal server error (database or server issue).
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Erreur serveur interne."
 */


// La fonction permet de supprimer plusieurs utilisateurs.
module.exports.deleteManyUsers = function (req, res) {
    //  console.log(arg)
    var arg = req.query.id
    if (arg && !Array.isArray(arg))
        arg = [arg]
    req.log.info("Supprimer plusieurs utilisateurs")
    //  console.log(arg)
    UserService.deleteManyUsers(arg, null, function (err, value) {
        //    console.log(err)
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

/**
 * @swagger
 * /deleteManyUsers:
 *  delete:
 *    summary: Delete multiple users by their IDs
 *    description: Delete multiple users by providing an array of user IDs.
 *    tags:
 *      - User
 *    parameters:
 *      - in: query
 *        name: id
 *        required: true
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *        description: The array of user IDs to delete.
 *        example: ["userId1", "userId2", "userId3"]
 *    responses:
 *       200:
 *          description: Users deleted successfully.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Utilisateurs supprimés avec succès."
 *       404:
 *          description: One or more users not found.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-found"
 *                  message:
 *                    type: string
 *                    example: "Un ou plusieurs utilisateurs non trouvés."
 *       405:
 *          description: Invalid request (invalid user IDs or other validation errors).
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/responses/ValidationError'
 *       500:
 *          description: Internal server error (database or server issue).
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Erreur serveur interne."
 */


