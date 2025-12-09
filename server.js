const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const Config = require("./config");
const Logger = require('./utils/logger').pino
// // const swaggerJsdoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');


// Création de notre application express.js
const app = express();

// Démarrage de la database
require("./utils/database");

/* Ajoute de module de login */
const passport = require('./utils/passport')
/* Passport init */

var session = require('express-session')

app.use(session({
  secret: Config.secret_cookie,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.use(passport.initialize())
app.use(passport.session())

// Declaration des controller pour utilisateur
const UserController = require("./controllers/UserController");
const SettingController = require('./controllers/SettingController')
const TaskController = require('./controllers/TaskController')

const DatabaseMiddleware = require('./middlewares/database')
const LoggerMiddleware = require('./middlewares/logger')

// Déclaration des middlewares à express
app.use(bodyParser.json(), LoggerMiddleware.addLogger);

// Configuration Swagger
// const swaggerOptions = require(`./swagger.json`);
// const swaggerDocs = swaggerJsdoc(swaggerOptions);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// /* --------------- Création des routes ------------ */

// Création du endpoint pour connecter un utilisateur
app.post('/login', DatabaseMiddleware.checkConnexion, UserController.loginUser)

// Création de endpoint /user pour l'ajout d'un utilisateur
app.post("/register", DatabaseMiddleware.checkConnexion, UserController.addOneUser);

//Création de endpoint /users pour l'ajout de plusieurs utilisateurs
app.post("/users", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.addManyUsers);

// Création du endpoint /user pour la récupération d'un utilisateur par ID
app.get("/user/:id", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findOneUserById);

// Création du endpoint /users pour la récupération d'un utilisateur
app.get("/user", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findOneUser)

// Création du endpoint /user pour chercher des utilisateurs par ID
app.get("/users", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findManyUsersById);

// Création du endpoint /users pour chercher des utilisateurs 
app.get("/users_by_filters", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findManyUsers);

// Création du endpoint /user pour la modification d'un utilisateur
app.put("/user/:id", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.updateOneUser);

// Modification de l'email quand l'utilisateur est connecté
app.put("/user", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findOneAndUpdate);

// Modification du mot de passe utilisateur déconnecté
app.put("/userResPassword", DatabaseMiddleware.checkConnexion, UserController.updatePassword);

// Création du endpoint /users pour la modification de plusieurs utilisateurs
// app.put("/users", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.updateManyUsers);

// Création du endpoint /user pour la supression d'un utilisateur
app.delete("/user/:id", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.deleteOneUser);

// Création du endpoint /users pour la supression de plusieurs utilisateurs
app.delete("/users", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.deleteManyUsers);

// Création du endpoint /logout pour déconnecter un utilisateur
app.post('/logout', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.logoutUser)

// Démarrage de notre serveur le port choisi


// Création du endpoint pour connecter un utilisateur
// app.post('/login', DatabaseMiddleware.checkConnexion, SettingController.loginUser)

// Création de l'endpoint /setting pour l'ajout d'une setting
app.post("/setting", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), SettingController.addOneSetting);

// Création de l'endpoint /settings pour l'ajout de plusieurs settings
app.post("/settings", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), SettingController.addManySettings);

// Création de l'endpoint /setting/:id pour la récupération d'un setting par ID
app.get("/setting/:id", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), SettingController.findOneSettingById);

// Création de l'endpoint /setting pour la récupération d'un setting
app.get("/setting", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), SettingController.findOneSetting);

// Création de l'endpoint /settings pour la récupération de plusieurs settings par ID
app.get("/settings", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), SettingController.findManySettingsById);

// Création de l'endpoint /settings_by_filters pour chercher des settings
app.get("/settings_by_filters", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), SettingController.findManySettings);

// Création de l'endpoint /setting/:id pour la modification d'un setting
app.put("/setting/:id", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), SettingController.updateOneSetting);

// Création de l'endpoint /settings pour la modification de plusieurs settings
app.put("/settings", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), SettingController.updateManySettings);

// Création de l'endpoint /setting/:id pour la suppression d'un setting
app.delete("/setting/:id", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), SettingController.deleteOneSetting);

// Création de l'endpoint /settings pour la suppression de plusieurs settings
app.delete("/settings", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), SettingController.deleteManySettings);

// Création du endpoint pour créer une tâche
app.post('/tasks', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), TaskController.createTask);

// Création du endpoint pour chercher une tâche par ID
app.get('/tasks/:id', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), TaskController.findTaskById);

// Création du endpoint pour récupérer les tâches d'un utilisateur
app.get('/users/:userId/tasks', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), TaskController.findUserTasks);

// Création du endpoint pour mettre à jour une tâche
app.put('/tasks/:id', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), TaskController.updateTask);

// Création du endpoint pour supprimer une tâche
app.delete('/tasks/:id', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), TaskController.deleteTask);

// Démarrage de notre serveur sur le port choisi
app.listen(Config.port, () => {
  Logger.info(`Serveur démarré dans le port ${Config.port}.`)
});

module.exports = app