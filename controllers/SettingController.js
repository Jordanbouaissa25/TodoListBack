const SettingService = require('../services/SettingService');
const LoggerHttp = require('../utils/logger').http

// La fonction permet d'ajouter un Setting.
module.exports.addOneSetting = function (req, res) {
    req.log.info("Création d'un Setting");
    SettingService.addOneSetting(req.body, null, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "validator") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "duplicate") {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 201;
            res.send(value);
        }
    });
};

/**
 * @swagger
 * /addOneSetting:
 *  post:
 *    summary: Add a Setting
 *    description: Adds a new Setting to the system.
 *    tags:
 *      - Settings
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                      description: Name of the Setting
 *                      example: "exampleSetting"
 *                    value:
 *                      type: string
 *                      description: Value of the Setting
 *                      example: "exampleValue"
 *    responses:
 *       201:
 *          description: Setting successfully created
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                    description: ID of the created Setting
 *                    example: "12345"
 *                  name:
 *                    type: string
 *                    description: Name of the Setting
 *                    example: "exampleSetting"
 *                  value:
 *                    type: string
 *                    description: Value of the Setting
 *                    example: "exampleValue"
 *       404:
 *          description: Setting not found
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
 *                    example: "Setting not found"
 *       405:
 *          description: Validation error or duplicate
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "validator"
 *                  message:
 *                    type: string
 *                    example: "Validation error or duplicate Setting"
 *       500:
 *          description: Internal server error
 */


// La fonction permet d'ajouter plusieurs Settings.
module.exports.addManySettings = function (req, res) {
    req.log.info("Création de plusieurs Settings");
    SettingService.addManySettings(req.body, function (err, value) {
        if (err) {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 201;
            res.send(value);
        }
    });
};

/**
 * @swagger
 * /addManySettings:
 *  post:
 *    summary: Add multiple Settings
 *    description: Adds multiple Settings to the system in a single request.
 *    tags:
 *      - Settings
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                        description: Name of the Setting
 *                        example: "exampleSetting"
 *                      value:
 *                        type: string
 *                        description: Value of the Setting
 *                        example: "exampleValue"
 *                  minItems: 1
 *    responses:
 *       201:
 *          description: Settings successfully created
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                      description: ID of the created Setting
 *                      example: "12345"
 *                    name:
 *                      type: string
 *                      description: Name of the Setting
 *                      example: "exampleSetting"
 *                    value:
 *                      type: string
 *                      description: Value of the Setting
 *                      example: "exampleValue"
 *       405:
 *          description: Validation error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "validator"
 *                  message:
 *                    type: string
 *                    example: "Validation error"
 *       500:
 *          description: Internal server error
 */

// La fonction permet de chercher un Setting par ID.
module.exports.findOneSettingById = function (req, res) {
    req.log.info("Chercher un Setting");
    var opts = { populate: req.query.populate }
    SettingService.findOneSettingById(req.params.id, opts, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

/**
 * @swagger
 * /findOneSettingById/{id}:
 *  get:
 *    summary: Find a Setting by ID
 *    description: Fetches a Setting by its unique ID.
 *    tags:
 *      - Settings
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: Unique ID of the Setting
 *        schema:
 *          type: string
 *      - in: query
 *        name: populate
 *        required: false
 *        description: Specify if related data should be populated
 *        schema:
 *          type: boolean
 *    responses:
 *       200:
 *          description: Setting found successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                    description: ID of the found Setting
 *                    example: "12345"
 *                  name:
 *                    type: string
 *                    description: Name of the Setting
 *                    example: "exampleSetting"
 *                  value:
 *                    type: string
 *                    description: Value of the Setting
 *                    example: "exampleValue"
 *       404:
 *          description: Setting not found
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
 *                    example: "Setting not found"
 *       405:
 *          description: Invalid request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-valid"
 *                  message:
 *                    type: string
 *                    example: "Invalid request"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de chercher un Setting.
module.exports.findOneSetting = function (req, res) {
    var fields = req.query.fields;
    if (fields && !Array.isArray(fields)) {
        fields = [fields];
    }
    var opts = { populate: req.query.populate }
    req.log.info("Chercher un Setting");
    SettingService.findOneSetting(fields, req.query.value, opts, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

/**
 * @swagger
 * /findOneSetting:
 *  get:
 *    summary: Find a Setting by value
 *    description: Fetches a Setting based on provided fields and value.
 *    tags:
 *      - Settings
 *    parameters:
 *      - in: query
 *        name: fields
 *        required: false
 *        description: Fields to search for
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *      - in: query
 *        name: value
 *        required: true
 *        description: Value to search for within the specified fields
 *        schema:
 *          type: string
 *      - in: query
 *        name: populate
 *        required: false
 *        description: Specify if related data should be populated
 *        schema:
 *          type: boolean
 *    responses:
 *       200:
 *          description: Setting found successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                    description: ID of the found Setting
 *                    example: "12345"
 *                  name:
 *                    type: string
 *                    description: Name of the Setting
 *                    example: "exampleSetting"
 *                  value:
 *                    type: string
 *                    description: Value of the Setting
 *                    example: "exampleValue"
 *       404:
 *          description: Setting not found
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
 *                    example: "Setting not found"
 *       405:
 *          description: Invalid request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-valid"
 *                  message:
 *                    type: string
 *                    example: "Invalid request"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de chercher plusieurs Settings.
module.exports.findManySettings = function (req, res) {
    let page = req.query.page;
    let limit = req.query.limit;
    let search = req.query.q;
    var opts = { populate: req.query.populate }
    req.log.info("Chercher des Settings");
    SettingService.findManySettings(search, page, limit, opts, (err, value) => {
        if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

/**
 * @swagger
 * /findManySettings:
 *  get:
 *    summary: Find multiple Settings
 *    description: Fetches multiple Settings based on specified filters.
 *    tags:
 *      - Settings
 *    parameters:
 *      - in: query
 *        name: fields
 *        required: false
 *        description: Fields to filter the Settings
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *      - in: query
 *        name: value
 *        required: false
 *        description: Value to filter the Settings
 *        schema:
 *          type: string
 *      - in: query
 *        name: populate
 *        required: false
 *        description: Specify if related data should be populated
 *        schema:
 *          type: boolean
 *    responses:
 *       200:
 *          description: Settings successfully retrieved
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                      description: ID of the Setting
 *                      example: "12345"
 *                    name:
 *                      type: string
 *                      description: Name of the Setting
 *                      example: "exampleSetting"
 *                    value:
 *                      type: string
 *                      description: Value of the Setting
 *                      example: "exampleValue"
 *       404:
 *          description: No Settings found
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
 *                    example: "No Settings found"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de chercher plusieurs Settings par ID.
module.exports.findManySettingsById = function (req, res) {
    var arg = req.query.id;
    if (arg && !Array.isArray(arg)) {
        arg = [arg];
    }
    var opts = { populate: req.query.populate }
    req.log.info("Chercher plusieurs Settings");
    SettingService.findManySettingsById(arg, opts, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

/**
 * @swagger
 * /findManySettingsById:
 *  get:
 *    summary: Find multiple Settings by IDs
 *    description: Fetches multiple Settings based on a list of provided IDs.
 *    tags:
 *      - Settings
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: string
 *                description: Array of Setting IDs to retrieve
 *                example: ["12345", "67890"]
 *    responses:
 *       200:
 *          description: Settings successfully retrieved
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                      description: ID of the Setting
 *                      example: "12345"
 *                    name:
 *                      type: string
 *                      description: Name of the Setting
 *                      example: "exampleSetting"
 *                    value:
 *                      type: string
 *                      description: Value of the Setting
 *                      example: "exampleValue"
 *       404:
 *          description: One or more Settings not found
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
 *                    example: "One or more Settings not found"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de supprimer un Setting.
module.exports.deleteOneSetting = function (req, res) {
    req.log.info("Supprimer un Setting");
    SettingService.deleteOneSetting(req.params.id, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

/**
 * @swagger
 * /deleteOneSetting:
 *  delete:
 *    summary: Delete a Setting
 *    description: Deletes a single Setting by its ID.
 *    tags:
 *      - Settings
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: ID of the Setting to be deleted
 *        schema:
 *          type: string
 *          example: "12345"
 *    responses:
 *       200:
 *          description: Setting successfully deleted
 *       404:
 *          description: Setting not found
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
 *                    example: "Setting not found"
 *       405:
 *          description: Invalid Setting ID
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-valid"
 *                  message:
 *                    type: string
 *                    example: "Invalid Setting ID"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de supprimer plusieurs Settings.
module.exports.deleteManySettings = function (req, res) {
    var arg = req.query.id;
    if (arg && !Array.isArray(arg)) {
        arg = [arg];
    }
    req.log.info("Supprimer plusieurs Settings");
    SettingService.deleteManySettings(arg, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

/**
 * @swagger
 * /deleteManySettings:
 *  delete:
 *    summary: Delete multiple Settings
 *    description: Deletes multiple Settings by their IDs.
 *    tags:
 *      - Settings
 *    parameters:
 *      - in: query
 *        name: id
 *        required: true
 *        description: List of Setting IDs to be deleted
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *          example: ["12345", "67890"]
 *    responses:
 *       200:
 *          description: Settings successfully deleted
 *       404:
 *          description: One or more Settings not found
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
 *                    example: "One or more Settings not found"
 *       405:
 *          description: Invalid Setting IDs
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-valid"
 *                  message:
 *                    type: string
 *                    example: "Invalid Setting IDs"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de modifier un Setting.
module.exports.updateOneSetting = function (req, res) {
    const SettingId = req.params.id;
    const SettingData = req.body;
    req.log.info("Modifier un Setting");
    SettingService.updateOneSetting(SettingId, SettingData, (err, value) => {
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
    });
};

/**
 * @swagger
 * /updateOneSetting:
 *  put:
 *    summary: Update a Setting
 *    description: Updates a single Setting by its ID.
 *    tags:
 *      - Settings
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: ID of the Setting to be updated
 *        schema:
 *          type: string
 *          example: "12345"
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    description: New name for the Setting
 *                    example: "updatedSetting"
 *                  value:
 *                    type: string
 *                    description: New value for the Setting
 *                    example: "updatedValue"
 *    responses:
 *       200:
 *          description: Setting successfully updated
 *       404:
 *          description: Setting not found
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
 *                    example: "Setting not found"
 *       405:
 *          description: Validation error or duplicate Setting
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "validator"
 *                  message:
 *                    type: string
 *                    example: "Validation error or duplicate Setting"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de modifier plusieurs Settings.
module.exports.updateManySettings = function (req, res) {
    let SettingsId = req.query.id;
    const updateData = req.body;
    if (SettingsId && !Array.isArray(SettingsId)) {
        SettingsId = [SettingsId];
    }
    req.log.info("Modifier plusieurs Settings");
    SettingService.updateManySettings(SettingsId, updateData, (err, value) => {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && (err.type_error == "validator" || err.type_error == "duplicate")) {
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
 * /updateManySettings:
 *  put:
 *    summary: Update multiple Settings
 *    description: Updates multiple Settings by their IDs.
 *    tags:
 *      - Settings
 *    parameters:
 *      - in: query
 *        name: id
 *        required: true
 *        description: List of Setting IDs to be updated
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *          example: ["12345", "67890"]
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    description: New name for the Settings
 *                    example: "updatedSetting"
 *                  value:
 *                    type: string
 *                    description: New value for the Settings
 *                    example: "updatedValue"
 *    responses:
 *       200:
 *          description: Settings successfully updated
 *       404:
 *          description: One or more Settings not found
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
 *                    example: "One or more Settings not found"
 *       405:
 *          description: Validation error or duplicate Settings
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "validator"
 *                  message:
 *                    type: string
 *                    example: "Validation error or duplicate Settings"
 *       500:
 *          description: Internal server error
 */

