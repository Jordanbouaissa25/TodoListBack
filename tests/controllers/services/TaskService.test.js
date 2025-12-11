const TaskService = require("../../../services/TaskService");
const UserService = require("../../../services/UserService");
const chai = require("chai");
let expect = chai.expect;
const _ = require("lodash");

let tab_id_users = [];
let tab_id_tasks = [];
let valid_task_id = "";

let users = [
    {
        firstcity: "User 1",
        lastcity: "Test",
        usercity: "u1",
        email: "user1@gmail.com",
        password: "hello"
    },
    {
        firstcity: "User 2",
        lastcity: "Test",
        usercity: "u2",
        email: "user2@gmail.com",
        password: "hello"
    }
];

function rdm_user(tab) {
    return tab[Math.floor(Math.random() * tab.length)];
}

/* -------------------------------------------------------------------------- */
/*                                ADD ONE TASK                                */
/* -------------------------------------------------------------------------- */

describe("addOneTask", () => {

    it("Création des utilisateurs fictifs - S", (done) => {
        UserService.addManyUsers(users, null, function (err, value) {
            tab_id_users = _.map(value, "_id");
            done();
        });
    });

    it("Création d’une tâche valide - S", (done) => {
        const task = {
            user_id: tab_id_users[0],
            title: "Ma première tâche",
            description: "Test de création",
            priority: "Urgente"
        };

        TaskService.addOneTask(task, null, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            valid_task_id = value._id;
            tab_id_tasks.push(value._id);
            done();
        });
    });

    it("Création impossible (titre manquant) - E", (done) => {
        const task_invalid = {
            user_id: tab_id_users[0]
        };

        TaskService.addOneTask(task_invalid, null, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err.fields).to.haveOwnProperty("title");
            done();
        });
    });

});

/* -------------------------------------------------------------------------- */
/*                               ADD MANY TASKS                               */
/* -------------------------------------------------------------------------- */

describe("addManyTasks", () => {

    it("Tâches invalides - E", (done) => {
        const invalid_tasks = [
            { user_id: tab_id_users[0], priority: "Basse" },
            { user_id: tab_id_users[1], title: "" }
        ];

        TaskService.addManyTasks(invalid_tasks, function (err, value) {
            expect(err).to.be.an("array");
            expect(err.length).to.be.equal(2);
            done();
        });
    });

    it("Tâches valides - S", (done) => {
        const valid_tasks = [
            {
                user_id: tab_id_users[0],
                title: "Task 1",
                priority: "Moyenne"
            },
            {
                user_id: tab_id_users[1],
                title: "Task 2",
                description: "Cool",
                priority: "Basse"
            }
        ];

        TaskService.addManyTasks(valid_tasks, function (err, value) {
            expect(value).lengthOf(2);
            tab_id_tasks.push(...value.map(t => t._id));
            done();
        });
    });

});

/* -------------------------------------------------------------------------- */
/*                          FIND TASKS BY USER (ALL)                          */
/* -------------------------------------------------------------------------- */

describe("findTasksByUser", () => {

    it("Chercher toutes les tâches d’un user valide - S", (done) => {
        TaskService.findTasksByUser(tab_id_users[0], null, function (err, value) {
            expect(value).to.be.an("array");
            expect(value.length).to.be.greaterThan(0);
            done();
        });
    });

    it("UserId invalide - E", (done) => {
        TaskService.findTasksByUser("invalid", null, function (err, value) {
            expect(err).to.haveOwnProperty("type_error");
            expect(err.type_error).to.equal("no-valid");
            done();
        });
    });

});

/* -------------------------------------------------------------------------- */
/*                               FIND ONE TASK                                */
/* -------------------------------------------------------------------------- */

describe("findOneTask", () => {

    it("Trouver une tâche valide - S", (done) => {
        TaskService.findOneTask(valid_task_id, null, function (err, value) {
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("title");
            done();
        });
    });

    it("Id invalide - E", (done) => {
        TaskService.findOneTask("invalid", null, function (err, value) {
            expect(err.type_error).to.equal("no-valid");
            done();
        });
    });

    it("Id inexistant - E", (done) => {
        TaskService.findOneTask("665f18739d3e172be5daf092", null, function (err, value) {
            expect(err.type_error).to.equal("no-found");
            done();
        });
    });

});

/* -------------------------------------------------------------------------- */
/*                               UPDATE ONE TASK                              */
/* -------------------------------------------------------------------------- */

describe("updateOneTask", () => {

    it("Modifier une tâche valide - S", (done) => {
        TaskService.updateOneTask(
            valid_task_id,
            { title: "Titre modifié", completed: true },
            function (err, value) {
                expect(value).to.haveOwnProperty("_id");
                expect(value.title).to.equal("Titre modifié");
                expect(value.completed).to.equal(true);
                done();
            }
        );
    });

    it("Modifier tâche avec ID invalide - E", (done) => {
        TaskService.updateOneTask(
            "invalid",
            { title: "Test" },
            function (err, value) {
                expect(err).to.haveOwnProperty("type_error");
                expect(err.type_error).to.equal("no-valid");
                done();
            }
        );
    });

    it("Champ title vide → erreur validator - E", (done) => {
        TaskService.updateOneTask(
            valid_task_id,
            { title: "" },
            function (err, value) {
                expect(err.fields).to.haveOwnProperty("title");
                done();
            }
        );
    });

});

/* -------------------------------------------------------------------------- */
/*                               DELETE ONE TASK                              */
/* -------------------------------------------------------------------------- */

describe("deleteOneTask", () => {

    it("Supprimer une tâche valide - S", (done) => {
        TaskService.deleteOneTask(valid_task_id, function (err, value) {
            expect(value).to.haveOwnProperty("_id");
            done();
        });
    });

    it("Supprimer tâche avec ID invalide - E", (done) => {
        TaskService.deleteOneTask("invalid", function (err, value) {
            expect(err.type_error).to.equal("no-valid");
            done();
        });
    });

});

/* -------------------------------------------------------------------------- */
/*                              DELETE MANY TASKS                              */
/* -------------------------------------------------------------------------- */

describe("deleteManyTasks", () => {

    it("Supprimer plusieurs tâches invalides - E", (done) => {
        TaskService.deleteManyTasks(["invalid"], function (err, value) {
            expect(err.type_error).to.equal("no-valid");
            done();
        });
    });

    it("Supprimer plusieurs tâches valides - S", (done) => {
        TaskService.deleteManyTasks(tab_id_tasks, function (err, value) {
            expect(value).to.haveOwnProperty("deletedCount");
            done();
        });
    });

});

/* -------------------------------------------------------------------------- */
/*                         DELETE USERS AT THE END                            */
/* -------------------------------------------------------------------------- */

describe("deleteUsers", () => {
    it("Supprimer les utilisateurs fictifs créés pour le test - S", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
            done();
        });
    });
});
