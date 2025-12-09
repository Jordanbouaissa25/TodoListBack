const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require('../../server');
let should = chai.should();
const UserService = require("../../services/UserService")
var userConnect = {}

chai.use(chaiHttp);

let user = null
var users = []
let token = ""
chai.use(chaiHttp)

describe("Task Controller Tests", () => {

    describe("Gestion api.", () => {
        it("Création d'utilisateur fictif", (done) => {
            UserService.addOneUser(user, null, function (err, value) {
                console.log(err,value)
                userConnect = { ...value }
                //  console.log(value)
                done()
            })
        })
    })

        describe("POST - /login", () => {
    it("Connexion utilisateur - S", (done) => {
        console.log(users)
        chai.request(server).post('/login').send({
            username: "jordanbouaissa257@gmail.com",
            password: "1234567890",
        }).end((err, res) => {
            console.log(err, res.body)
            res.should.have.status(200)
            token = res.body.token
            done()
        })
    })
    it("Connexion utilisateur - Identifiant incorrect - E", (done) => {
        chai.request(server).post('/login').send({
            username: "sksfksl@gmail.com",
            password: "123456789"
        }).end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Connexion utilisateur - Mot de passe incorrect - E", (done) => {
        chai.request(server).post('/login').send({
            username: "jordanbouaissa25@gmail.com",
            password: "password_incorrect"
        }).end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
})

    // // Créer une tâche
    // describe("POST - /tasks", () => {
    //     it("Créer une tâche correcte - S", (done) => {
    //         // console.log(users)
    //         chai.request(server)
    //             .post('/tasks')
    //             .auth(token, { type: "bearer" })
    //             .send({
    //                 title: "Nouvelle tâche",
    //                 description: "Description de la tâche",
    //             })
    //             .end((err, res) => {
    //                 console.log(err,res.body)
    //                 expect(res).to.have.status(201);
    //                 users = res.body._id;
    //                 done();
    //             });
    //     });

    //     it("Créer une tâche sans title - E", (done) => {
    //         chai.request(server)
    //             .post('/tasks')
    //             .auth(token, { type: "bearer" })
    //             .send({
    //                 title: "",
    //                 description: "Description sans title",
    //             })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(405);
    //                 done();
    //             });
    //     });

    //     it("Créer une tâche avec duplicate key - E", (done) => {
    //         chai.request(server)
    //             .post('/tasks')
    //             .auth(token, { type: "bearer" })
    //             .send({
    //                 title: "Nouvelle tâche",
    //                 description: "Duplicate",
    //                 userId: userId
    //             })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(405);
    //                 done();
    //             });
    //     });
    // });

    // // Chercher une tâche
    // describe("GET - /tasks/:id", () => {
    //     it("Chercher une tâche existante - S", (done) => {
    //         chai.request(server)
    //             .get(`/tasks/${taskId}`)
    //             .auth(token, { type: "bearer" })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(200);
    //                 done();
    //             });
    //     });

    //     it("Chercher une tâche avec ID invalide - E", (done) => {
    //         chai.request(server)
    //             .get('/tasks/123')
    //             .auth(token, { type: "bearer" })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(405);
    //                 done();
    //             });
    //     });

    //     it("Chercher une tâche inexistante - E", (done) => {
    //         chai.request(server)
    //             .get('/tasks/64a5f2bcd123456789abc999')
    //             .auth(token, { type: "bearer" })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(404);
    //                 done();
    //             });
    //     });
    // });

    // // Récupérer les tâches d'un utilisateur
    // describe("GET - /users/:userId/tasks", () => {
    //     it("Récupérer les tâches d'un utilisateur existant - S", (done) => {
    //         chai.request(server)
    //             .get(`/users/${userId}/tasks`)
    //             .auth(token, { type: "bearer" })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(200);
    //                 done();
    //             });
    //     });

    //     it("Récupérer les tâches avec ID utilisateur invalide - E", (done) => {
    //         chai.request(server)
    //             .get('/users/123/tasks')
    //             .auth(token, { type: "bearer" })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(405);
    //                 done();
    //             });
    //     });
    // });

    // // Modifier une tâche
    // describe("PUT - /tasks/:id", () => {
    //     it("Modifier une tâche existante - S", (done) => {
    //         chai.request(server)
    //             .put(`/tasks/${taskId}`)
    //             .auth(token, { type: "bearer" })
    //             .send({ title: "Tâche modifiée" })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(200);
    //                 done();
    //             });
    //     });

    //     it("Modifier une tâche inexistante - E", (done) => {
    //         chai.request(server)
    //             .put('/tasks/64a5f2bcd123456789abc999')
    //             .auth(token, { type: "bearer" })
    //             .send({ title: "Impossible" })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(404);
    //                 done();
    //             });
    //     });

    //     it("Modifier une tâche avec ID invalide - E", (done) => {
    //         chai.request(server)
    //             .put('/tasks/123')
    //             .auth(token, { type: "bearer" })
    //             .send({ title: "Impossible" })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(405);
    //                 done();
    //             });
    //     });
    // });

    // // Supprimer une tâche
    // describe("DELETE - /tasks/:id", () => {
    //     it("Supprimer une tâche existante - S", (done) => {
    //         chai.request(server)
    //             .delete(`/tasks/${taskId}`)
    //             .auth(token, { type: "bearer" })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(200);
    //                 done();
    //             });
    //     });

    //     it("Supprimer une tâche inexistante - E", (done) => {
    //         chai.request(server)
    //             .delete('/tasks/64a5f2bcd123456789abc999')
    //             .auth(token, { type: "bearer" })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(404);
    //                 done();
    //             });
    //     });

    //     it("Supprimer une tâche avec ID invalide - E", (done) => {
    //         chai.request(server)
    //             .delete('/tasks/123')
    //             .auth(token, { type: "bearer" })
    //             .end((err, res) => {
    //                 expect(res).to.have.status(405);
    //                 done();
    //             });
    //     });
    // });

});
