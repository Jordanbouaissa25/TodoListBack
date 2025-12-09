const TaskService = require("../../../services/TaskService");
const chai = require("chai");
let expect = chai.expect;
const _ = require("lodash");
var taskIdValid = "";
var userIdValid = "650f18739d3e172be5daf000"; // Remplacer par un ObjectId valide pour test réel
var tasks = [];

describe("createTask", () => {
    it("Créer une tâche correcte. - S", (done) => {
        var task = {
            user_id: userIdValid,
            title: "Ma première tâche",
            description: "Description de la tâche",
        };
        TaskService.createTask(task, null, function (err, value) {
            expect(err).to.be.null;
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            taskIdValid = value._id;
            tasks.push(value);
            done();
        });
    });

    it("Créer une tâche sans title. - E", (done) => {
        var task = {
            user_id: userIdValid,
            description: "Description sans titre",
        };
        TaskService.createTask(task, null, function (err, value) {
            expect(value).to.be.undefined;
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
            expect(err).to.haveOwnProperty("fields");
            expect(err.fields).to.haveOwnProperty("title");
            done();
        });
    });

    it("Créer une tâche avec duplicate key. - E", (done) => {
        var task = {
            user_id: userIdValid,
            title: "Ma première tâche", // Même titre pour provoquer duplicate si index unique
            description: "Duplicate test",
            status: "pending"
        };
        TaskService.createTask(task, null, function (err, value) {
            if (err) {
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error").to.equal("duplicate");
            }
            done();
        });
    });
});

describe("findTaskById", () => {
    it("Chercher une tâche existante. - S", (done) => {
        TaskService.findTaskById(taskIdValid, null, function (err, value) {
            expect(err).to.be.null;
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("title");
            done();
        });
    });

    it("Chercher une tâche avec ID invalide. - E", (done) => {
        TaskService.findTaskById("123", null, function (err, value) {
            expect(value).to.be.undefined;
            expect(err).to.haveOwnProperty("type_error").to.equal("no-valid");
            done();
        });
    });

    it("Chercher une tâche inexistante. - E", (done) => {
        TaskService.findTaskById("650f18739d3e172be5daf999", null, function (err, value) {
            expect(value).to.be.undefined;
            expect(err).to.haveOwnProperty("type_error").to.equal("no-found");
            done();
        });
    });
});

describe("findUserTasks", () => {
    it("Récupérer les tâches d'un utilisateur existant. - S", (done) => {
        TaskService.findUserTasks(userIdValid, null, function (err, value) {
            expect(err).to.be.null;
            expect(value).to.be.an("array");
            done();
        });
    });

    it("Récupérer les tâches avec ID utilisateur invalide. - E", (done) => {
        TaskService.findUserTasks("123", null, function (err, value) {
            expect(value).to.be.undefined;
            expect(err).to.haveOwnProperty("type_error").to.equal("no-valid");
            done();
        });
    });
});

describe("updateTask", () => {
    it("Modifier une tâche existante. - S", (done) => {
        TaskService.updateTask(taskIdValid, { title: "Ma première tâche" }, null, function (err, value) {
            // console.log(err, value);
            expect(err).to.be.null;
            expect(value).to.haveOwnProperty("_id");
            expect(value.title).to.equal("Ma première tâche");
            done();
        });
    });

    it("Modifier une tâche inexistante. - E", (done) => {
        TaskService.updateTask("650f18739d3e172be5daf999", { title: "Tâche de Jordan" }, null, function (err, value) {
            expect(value).to.be.undefined;
            expect(err).to.haveOwnProperty("type_error").to.equal("no-found");
            done();
        });
    });

    it("Modifier une tâche avec ID invalide. - E", (done) => {
        TaskService.updateTask("123", { status: "done" }, null, function (err, value) {
            expect(value).to.be.undefined;
            expect(err).to.haveOwnProperty("type_error").to.equal("no-valid");
            done();
        });
    });
});

describe("deleteTask", () => {
    it("Supprimer une tâche existante. - S", (done) => {
        TaskService.deleteTask(taskIdValid, null, function (err, value) {
            expect(err).to.be.null;
            expect(value).to.haveOwnProperty("_id");
            done();
        });
    });

    it("Supprimer une tâche inexistante. - E", (done) => {
        TaskService.deleteTask("650f18739d3e172be5daf999", null, function (err, value) {
            expect(value).to.be.undefined;
            expect(err).to.haveOwnProperty("type_error").to.equal("no-found");
            done();
        });
    });

    it("Supprimer une tâche avec ID invalide. - E", (done) => {
        TaskService.deleteTask("123", null, function (err, value) {
            expect(value).to.be.undefined;
            expect(err).to.haveOwnProperty("type_error").to.equal("no-valid");
            done();
        });
    });
});
