const UserService = require("../../services/UserService");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require('./../../server');
let should = chai.should();
const _ = require('lodash');

let token = "";
let userConnect = {};
let tab_id_users = [];
let tasks = [];

let user = {
    firstName: "Task Owner",
    lastName: "User",
    username: "task_user_test",
    email: "taskuser@gmail.com",
    password: "123456789"
};

function rdm_user(tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length - 1))]
    return rdm_id;
}

chai.use(chaiHttp);

/* ------------------------------
   CREATION USER FICTIF
-------------------------------- */
describe("Initialisation - Utilisateur fictif", () => {
    it("Création d'utilisateur fictif", (done) => {
        UserService.addOneUser(user, null, function (err, value) {
            userConnect = { ...value };
            tab_id_users.push(value._id);
            done();
        });
    });
});

/* ------------------------------
   LOGIN
-------------------------------- */
describe("POST - /login", () => {
    it("Connexion utilisateur - S", (done) => {
        chai.request(server).post('/login')
            .send({
                username: "taskuser@gmail.com",
                password: "123456789"
            })
            .end((err, res) => {
                res.should.have.status(200);
                token = res.body.token;
                done();
            });
    });
});

/* ------------------------------
   POST /tasks (addOneTask)
-------------------------------- */
describe("POST - /tasks", () => {

    it("Ajouter une task valide - S", (done) => {
        const t = {
            user_id: userConnect._id,
            title: "Ma première task",
            description: "Description test",
            priority: "Moyenne"
        };

        chai.request(server).post('/tasks')
            .auth(token, { type: "bearer" })
            .send(t)
            .end((err, res) => {
                expect(res).to.have.status(201);
                tasks.push(res.body);
                done();
            });
    });

    it("Ajouter une task incorrecte (sans title) - E", (done) => {
        chai.request(server).post('/tasks')
            .auth(token, { type: "bearer" })
            .send({
                user_id: userConnect._id,
                description: "No title"
            })
            .end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
    });

    it("Ajouter une task incorrecte (champ vide) - E", (done) => {
        chai.request(server).post('/tasks')
            .auth(token, { type: "bearer" })
            .send({
                user_id: userConnect._id,
                title: ""
            })
            .end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
    });

});

/* ------------------------------
   POST /tasks/many (addManyTasks)
-------------------------------- */
describe("POST - /tasks/many", () => {

    it("Ajouter plusieurs tasks - S", (done) => {
        const many = [
            { user_id: userConnect._id, title: "Task 1", description: "D1" },
            { user_id: userConnect._id, title: "Task 2", description: "D2" }
        ];

        chai.request(server).post('/tasks/many')
            .auth(token, { type: "bearer" })
            .send(many)
            .end((err, res) => {
                expect(res).to.have.status(201);
                tasks = [...tasks, ...res.body];
                done();
            });
    });

    it("Ajouter plusieurs tasks incorrectes (title manquant) - E", (done) => {
        const incorrect = [
            { user_id: userConnect._id },
            { user_id: userConnect._id }
        ];

        chai.request(server).post('/tasks/many')
            .auth(token, { type: "bearer" })
            .send(incorrect)
            .end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
    });

});

/* ------------------------------
   GET /tasks/user/:user_id
-------------------------------- */
describe("GET - /tasks/user/:user_id", () => {

    it("Récupérer les tasks d'un user - S", (done) => {
        chai.request(server).get(`/tasks/user/${userConnect._id}`)
            .auth(token, { type: "bearer" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it("Récupérer tasks avec user_id invalide - E", (done) => {
        chai.request(server).get(`/tasks/user/123`)
            .auth(token, { type: "bearer" })
            .end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
    });

});

/* ------------------------------
   GET /tasks/:id
-------------------------------- */
describe("GET - /tasks/:id", () => {

    it("Récupérer une task valide - S", (done) => {
        chai.request(server).get(`/tasks/${tasks[0]._id}`)
            .auth(token, { type: "bearer" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('_id');
                done();
            });
    });

    it("Récupérer une task avec id invalide - E", (done) => {
        chai.request(server).get(`/tasks/123`)
            .auth(token, { type: "bearer" })
            .end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
    });

    it("Récupérer une task inexistante - E", (done) => {
        chai.request(server).get(`/tasks/60d72b2f9b1d8b002f123456`)
            .auth(token, { type: "bearer" })
            .end((err, res) => {
                expect(res).to.have.status(404);
                done();
            });
    });

});

/* ------------------------------
   PUT /tasks/:id
-------------------------------- */
describe("PUT - /tasks/:id", () => {

    it("Modifier une task valide - S", (done) => {
        chai.request(server).put(`/tasks/${tasks[0]._id}`)
            .auth(token, { type: "bearer" })
            .send({
                title: "Task modifiée"
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it("Modifier une task avec id invalide - E", (done) => {
        chai.request(server).put(`/tasks/123`)
            .auth(token, { type: "bearer" })
            .send({ title: "Modification" })
            .end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
    });

    it("Modifier une task inexistante - E", (done) => {
        chai.request(server).put(`/tasks/60c72b2f4f1a4c3d88d9a1d9`)
            .auth(token, { type: "bearer" })
            .send({ title: "Doesn't exist" })
            .end((err, res) => {
                expect(res).to.have.status(404);
                done();
            });
    });

    it("Modifier une task avec champ vide - E", (done) => {
        chai.request(server).put(`/tasks/${tasks[0]._id}`)
            .auth(token, { type: "bearer" })
            .send({ title: "" })
            .end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
    });

});

/* ------------------------------
   DELETE /tasks/:id
-------------------------------- */
describe("DELETE - /tasks/:id", () => {

    it("Supprimer une task valide - S", (done) => {
        chai.request(server).delete(`/tasks/${tasks[0]._id}`)
            .auth(token, { type: "bearer" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it("Supprimer une task inexistante - E", (done) => {
        chai.request(server).delete(`/tasks/60d72b2f9b1d8b002f123456`)
            .auth(token, { type: "bearer" })
            .end((err, res) => {
                expect(res).to.have.status(404);
                done();
            });
    });

    it("Supprimer une task avec id invalide - E", (done) => {
        chai.request(server).delete(`/tasks/123`)
            .auth(token, { type: "bearer" })
            .end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
    });

});

/* ------------------------------
   DELETE /tasks (deleteMany)
-------------------------------- */
describe("DELETE - /tasks", () => {

    it("Supprimer plusieurs tasks - S", (done) => {
        chai.request(server).delete('/tasks')
            .auth(token, { type: "bearer" })
            .query({ id: _.map(tasks, "_id") })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it("Supprimer plusieurs tasks incorrect (id invalide) - E", (done) => {
        chai.request(server).delete('/tasks')
            .auth(token, { type: "bearer" })
            .query({ id: ["123", "456"] })
            .end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
    });

});

/* ------------------------------
   SUPPRESSION USER FICTIF
-------------------------------- */
describe("Finalisation - Suppression utilisateur fictif", () => {
    it("Supprimer utilisateur fictif", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function () {
            done();
        });
    });
});
