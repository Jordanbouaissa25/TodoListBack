const UserService = require("../../services/UserService")
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require('./../../server');
let should = chai.should();
const _ = require('lodash');
const { destination } = require("pino");
var userConnect = {}
var todos = [];
let token = ""

let user =
{
    firstName: "Détenteur du todo 1",
    lastName: "Iencli",
    username: "ouil",
    email: "iencli@gmail.com",
    password: "123456789"
}



chai.use(chaiHttp)

describe("Gestion api.", () => {
    it("Création d'utilisateur fictif", (done) => {
        UserService.addOneUser(user, null, function (err, value) {
            userConnect = { ...value }
            //  console.log(value)
            done()
        })
    })
})

// TEST CONTROLLER - Connecter un utilisateur (tous les roles)
describe("POST - /login", () => {
    it("Connexion utilisateur - S", (done) => {
        chai.request(server).post('/login').send({
            username: "iencli@gmail.com",
            password: "123456789"
        }).end((err, res) => {
            // console.log(err, res.body)
            res.should.have.status(200)
            token = res.body.token
            done()
        })
    })
})

describe("POST - /todo", () => {
    it("Ajouter un todo. - S", (done) => {
        chai.request(server).post('/todo').query({ city: "Besançon" }).auth(token, { type: "bearer" }).end((err, res) => {
            // console.log(err, res)
            expect(res).to.have.status(201);
            todos.push(res.body);
            done();
        });
    });
    it("Ajouter un todo incorrect. (Sans humidity) - E", (done) => {
        chai.request(server).post('/todo').query({ humidity: "" }).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un todo incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/todo').query({ city: "" }).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

describe("GET - /todo", () => {
    it("Chercher un todo valide. - S", (done) => {
        chai.request(server).get('/todo').query({ fields: ["humidity"], value: todos[0].humidity }).auth(token, { type: "bearer" }).end((err, res) => {
            // console.log(err, res)
            res.should.have.status(200);
            done();
        });
    });
    it("Chercher un todo avec un champ non autorisé. - E", (done) => {
        chai.request(server).get('/todo').query({ fields: ["nonexistentField"], value: todos[0].city }).auth(token, { type: "bearer" }).end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
    it("Chercher un todo sans aucune query. - E", (done) => {
        chai.request(server).get('/todo').auth(token, { type: "bearer" }).end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
    it("Chercher un todo inexistant. - E", (done) => {
        chai.request(server).get('/todo').query({ fields: ["city"], value: "Todo inexistant" }).auth(token, { type: "bearer" }).end((err, res) => {
            // console.log(res)
            res.should.have.status(404);
            done();
        });
    });
});

describe("GET - /todo/:id", () => {
    it("Chercher un todo valide. - S", (done) => {
        chai.request(server).get(`/todo/${todos[0]._id}`).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('_id', todos[0]._id);
            done();
        });
    });
    it("Chercher un todo non valide. - E", (done) => {
        const invalidtodoId = '123';
        chai.request(server).get(`/todo/${invalidtodoId}`).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
    it("Chercher un todo non trouvé. - E", (done) => {
        const nonExistenttodoId = '60d72b2f9b1d8b002f123456';
        chai.request(server).get(`/todo/${nonExistenttodoId}`).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(404);
            done();
        });
    });
});

describe("GET - /todos", () => {
    it("Chercher plusieurs todos valide. -S", (done) => {
        chai.request(server).get('/todos_by_filters')
            .query({ q: "Invalid-id", page: 1, limit: 10 })
            .auth(token, { type: "bearer" }).end((err, res) => {
                // console.log(err, res)
                res.should.have.status(200)
                done();
            })
    })
    it("Chercher plusieurs todos avec une query vide. -S", (done) => {
        chai.request(server).get('/todos_by_filters')
            .auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(200)
                expect(res.body.results).to.be.an('array')
                // expect(res.body.count).to.be.equal(44)
                done()
            })
    })
    it("Chercher plusieurs todos avec une chaîne de caractère dans page. -E", (done) => {
        chai.request(server).get('/todos_by_filters').query({ page: 'une phrase', limit: 2 })
            .auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})

describe("PUT - /todo/:id", () => {
    it("Modifier un todo valide. - S", (done) => {
        chai.request(server).put(`/todo/${todos[0]._id}`).auth(token, { type: "bearer" }).send({
            city: "New city"
        }).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it("Modifier un todo avec un id invalide. - E", (done) => {
        chai.request(server).put(`/todo/123456789`).auth(token, { type: "bearer" }).send({
            temp: 50
        }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
    it("Modifier un todo inexistant. - E", (done) => {
        chai.request(server).put(`/todo/60c72b2f4f1a4c3d88d9a1d9`).auth(token, { type: "bearer" }).send({
            wind: "Non inexistant"
        }).end((err, res) => {
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Modifier un todo avec un champ vide. - E", (done) => {
        chai.request(server).put(`/todo/${todos[0]._id}`).auth(token, { type: "bearer" }).send({
            humidity: ""
        }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
});


describe("PUT - /todos", () => {
    it("Modifier plusieurs todos. - S", (done) => {
        chai.request(server).put('/todos').query({ id: _.map(todos, '_id') }).auth(token, { type: "bearer" }).send({
            temp: 30, wind: "km/h"
        })
            .end((err, res) => {
                // console.log(res)
                res.should.have.status(200)
                done()
            })
    })
    it("Modifier plusieurs todos avec ID ivalide. -E", (done) => {
        chai.request(server).put('/todos').query({ id: ["1234", "616546"] }).auth(token, { type: "bearer" }).send({
            temp: 30
        }, {
            wind: "km/h"
        })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier des todos inexistants. -E", (done) => {
        chai.request(server).put('/todos').auth(token, { type: "bearer" }).query({ id: ["6679773379a3a34adc0f05bf"] }).send({
            wind: "mi/h"
        })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Modifier des todos avec un champ vide. -E", (done) => {
        chai.request(server).put('/todos').auth(token, { type: "bearer" }).query({ id: _.map(todos, '_id') }).send({
            humidity: 50,
            wind: ""
        })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier des todos avec un id existant. -E", (done) => {
        chai.request(server).put('/todos').auth(token, { type: "bearer" }).query({ _id: _.map(todos, '_id') }).send({
            wind: "jskls"
        },
        )
            .end((err, res) => {
                // console.log(res.body)
                res.should.have.status(405)
                done()
            })
    })
})

describe("DELETE - /todo/:id", () => {
    it("Supprimer un todo valide. - S", (done) => {
        chai.request(server).delete(`/todo/${todos[0]._id}`).auth(token, { type: "bearer" }).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it("Supprimer un todo avec un id inexistant. - E", (done) => {
        chai.request(server).delete(`/todo/60d72b2f9b1d8b002f123456`).auth(token, { type: "bearer" }).end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
    it("Supprimer un todo avec un id invalide. - E", (done) => {
        chai.request(server).delete('/todo/123').auth(token, { type: "bearer" }).end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
});


describe("DELETE - /todos", () => {
    it("Supprimer plusieurs todos. - S", (done) => {
        chai.request(server).delete('/todos').query({ id: _.map(todos, '_id') })
            .auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("Supprimer plusieurs todos incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/todos/665f18739d3e172be5daf092&665f18739d3e172be5daf093')
            .auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Supprimer plusieurs todos incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/todos').query({ id: ['123', '456'] })
            .auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })

    it("Supression des utilisateurs fictif", (done) => {
        UserService.deleteManyUsers(user, null, function (err, value) {
            done()
        })
    })
})
