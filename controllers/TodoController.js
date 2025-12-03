const TodoService = require('../services/TodoService');


// La fonction permet d'ajouter un Todo.
module.exports.addOneTodo = function (req, res) {
    req.log.info("Création d'un Todo");
    TodoService.addOneTodo(req.query.city, req.user._id, null, function (err, value) {

        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
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
 * /addOneTodo:
 *  post:
 *    summary: Add a Todo entry
 *    description: Adds a new todo entry for a specified city.
 *    tags:
 *      - Todo
 *    parameters:
 *      - in: query
 *        name: city
 *        required: true
 *        description: City for which the todo data is added
 *        schema:
 *          type: string
 *          example: "Paris"
 *    responses:
 *       201:
 *          description: Todo successfully created
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  city:
 *                    type: string
 *                    description: Name of the city
 *                    example: "Paris"
 *                  todo:
 *                    type: string
 *                    description: Todo information
 *                    example: "Sunny, 25°C"
 *       404:
 *          description: City not found
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
 *                    example: "City not found"
 *       405:
 *          description: Validation error or duplicate entry
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "duplicate"
 *                  message:
 *                    type: string
 *                    example: "Duplicate todo entry for this city"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de chercher un Todo par ID.
module.exports.findOneTodoById = function (req, res) {
    req.log.info("Chercher un Todo");
    var opts = { populate: req.query.populate }
    TodoService.findOneTodoById(req.params.id, opts, function (err, value) {
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
 * /findOneTodoById/{id}:
 *  get:
 *    summary: Find a Todo entry by ID
 *    description: Retrieves todo information for a specific entry by its ID.
 *    tags:
 *      - Todo
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: ID of the todo entry to retrieve
 *        schema:
 *          type: string
 *          example: "605c5f48b2f4f1001f3eaf20"
 *      - in: query
 *        name: populate
 *        required: false
 *        description: Populate related data if needed
 *        schema:
 *          type: boolean
 *    responses:
 *       200:
 *          description: Todo entry successfully retrieved
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  city:
 *                    type: string
 *                    description: City name
 *                    example: "Paris"
 *                  todo:
 *                    type: string
 *                    description: Todo details
 *                    example: "Sunny, 25°C"
 *       404:
 *          description: Todo entry not found
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
 *                    example: "Todo entry not found"
 *       405:
 *          description: Invalid todo ID
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
 *                    example: "Invalid todo ID"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de chercher un Todo.
module.exports.findOneTodo = function (req, res) {
    var fields = req.query.fields;
    if (fields && !Array.isArray(fields)) {
        fields = [fields];
    }
    var opts = { populate: req.query.populate }
    req.log.info("Chercher un Todo");
    TodoService.findOneTodo(fields, req.query.value, opts, function (err, value) {
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
 * /findOneTodo:
 *  get:
 *    summary: Find a Todo entry
 *    description: Retrieves a todo entry based on specified fields and value.
 *    tags:
 *      - Todo
 *    parameters:
 *      - in: query
 *        name: fields
 *        description: Fields to include in the search
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *        example: ["city", "todo"]
 *      - in: query
 *        name: value
 *        required: true
 *        description: Value to search for in the specified fields
 *        schema:
 *          type: string
 *          example: "Paris"
 *      - in: query
 *        name: populate
 *        description: Populate related data if needed
 *        schema:
 *          type: boolean
 *    responses:
 *       200:
 *          description: Todo entry successfully retrieved
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  city:
 *                    type: string
 *                    description: Name of the city
 *                    example: "Paris"
 *                  todo:
 *                    type: string
 *                    description: Todo details
 *                    example: "Sunny, 25°C"
 *       404:
 *          description: Todo entry not found
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
 *                    example: "Todo entry not found"
 *       405:
 *          description: Invalid search criteria
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
 *                    example: "Invalid search criteria"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de chercher plusieurs Todos.
module.exports.findManyTodos = function (req, res) {
    let page = req.query.page;
    let limit = req.query.limit;
    let search = req.query.q;
    var opts = { populate: req.query.populate }
    req.log.info("Chercher des Todos");
    TodoService.findManyTodos(search, page, limit, opts, (err, value) => {
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
 * /findManyTodos:
 *  get:
 *    summary: Find multiple Todo entries
 *    description: Retrieves multiple todo entries based on search parameters with pagination.
 *    tags:
 *      - Todo
 *    parameters:
 *      - in: query
 *        name: q
 *        description: Search query for todo entries
 *        schema:
 *          type: string
 *        example: "Paris"
 *      - in: query
 *        name: page
 *        description: Page number for pagination
 *        schema:
 *          type: integer
 *          example: 1
 *      - in: query
 *        name: limit
 *        description: Number of entries per page
 *        schema:
 *          type: integer
 *          example: 10
 *      - in: query
 *        name: populate
 *        description: Populate related data if needed
 *        schema:
 *          type: boolean
 *    responses:
 *       200:
 *          description: Todo entries successfully retrieved
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    city:
 *                      type: string
 *                      description: Name of the city
 *                      example: "Paris"
 *                    todo:
 *                      type: string
 *                      description: Todo details
 *                      example: "Sunny, 25°C"
 *       405:
 *          description: Invalid query parameters
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
 *                    example: "Invalid query parameters"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de supprimer un Todo.
module.exports.deleteOneTodo = function (req, res) {
    req.log.info("Supprimer un Todo");
    TodoService.deleteOneTodo(req.params.id, function (err, value) {
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
 * /deleteOneTodo:
 *  delete:
 *    summary: Delete a Todo entry
 *    description: Deletes a specific todo entry by its ID.
 *    tags:
 *      - Todo
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: ID of the todo entry to delete
 *        schema:
 *          type: string
 *          example: "605c5f48b2f4f1001f3eaf20"
 *    responses:
 *       200:
 *          description: Todo entry successfully deleted
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Todo entry deleted successfully"
 *       404:
 *          description: Todo entry not found
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
 *                    example: "Todo entry not found"
 *       405:
 *          description: Invalid todo entry ID
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
 *                    example: "Invalid todo entry ID"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de supprimer plusieurs Todos.
module.exports.deleteManyTodos = function (req, res) {
    var arg = req.query.id;
    if (arg && !Array.isArray(arg)) {
        arg = [arg];
    }
    req.log.info("Supprimer plusieurs Todos");
    TodoService.deleteManyTodos(arg, function (err, value) {
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
 * /deleteManyTodos:
 *  delete:
 *    summary: Delete multiple Todo entries
 *    description: Deletes multiple todo entries specified by their IDs.
 *    tags:
 *      - Todo
 *    parameters:
 *      - in: query
 *        name: id
 *        description: IDs of the todo entries to delete
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *        example: ["605c5f48b2f4f1001f3eaf20", "605c5f48b2f4f1001f3eaf21"]
 *    responses:
 *       200:
 *          description: Todo entries successfully deleted
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Todo entries deleted successfully"
 *       404:
 *          description: Some todo entries not found
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
 *                    example: "Some todo entries not found"
 *       405:
 *          description: Invalid todo entry IDs
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
 *                    example: "Invalid todo entry IDs"
 *       500:
 *          description: Internal server error
 */


// La fonction permet de modifier un Todo.
module.exports.updateOneTodo = function (req, res) {
    const TodoId = req.params.id;
    const TodoData = req.body;
    req.log.info("Modifier un Todo");
    TodoService.updateOneTodo(TodoId, TodoData, (err, value) => {
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
 * /updateOneTodo:
 *  put:
 *    summary: Update a Todo entry
 *    description: Updates a specific todo entry by its ID.
 *    tags:
 *      - Todo
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: ID of the todo entry to update
 *        schema:
 *          type: string
 *          example: "605c5f48b2f4f1001f3eaf20"
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                    city:
 *                      type: string
 *                      description: Name of the city
 *                      example: "Paris"
 *                    todo:
 *                      type: string
 *                      description: Updated todo details
 *                      example: "Cloudy, 20°C"
 *    responses:
 *       200:
 *          description: Todo entry successfully updated
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  city:
 *                    type: string
 *                    description: Name of the city
 *                    example: "Paris"
 *                  todo:
 *                    type: string
 *                    description: Updated todo details
 *                    example: "Cloudy, 20°C"
 *       404:
 *          description: Todo entry not found
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
 *                    example: "Todo entry not found"
 *       405:
 *          description: Validation error or invalid data
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


// La fonction permet de modifier plusieurs Todos.
module.exports.updateManyTodos = function (req, res) {
    let TodosId = req.query.id;
    const updateData = req.body;
    if (TodosId && !Array.isArray(TodosId)) {
        TodosId = [TodosId];
    }
    req.log.info("Modifier plusieurs Todos");
    TodoService.updateManyTodos(TodosId, updateData, (err, value) => {
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
 * /updateManyTodos:
 *  put:
 *    summary: Update multiple Todo entries
 *    description: Updates multiple todo entries specified by their IDs.
 *    tags:
 *      - Todo
 *    parameters:
 *      - in: query
 *        name: id
 *        description: IDs of the todo entries to update
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *        example: ["605c5f48b2f4f1001f3eaf20", "605c5f48b2f4f1001f3eaf21"]
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                    city:
 *                      type: string
 *                      description: Name of the city
 *                      example: "Paris"
 *                    todo:
 *                      type: string
 *                      description: Updated todo details
 *                      example: "Partly cloudy, 22°C"
 *    responses:
 *       200:
 *          description: Todo entries successfully updated
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Todo entries updated successfully"
 *       404:
 *          description: Some todo entries not found
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
 *                    example: "Some todo entries not found"
 *       405:
 *          description: Validation error or invalid data
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

