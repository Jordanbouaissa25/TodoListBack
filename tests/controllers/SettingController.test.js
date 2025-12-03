const UserService = require("../../services/UserService")
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require('./../../server');
let should = chai.should();
const _ = require('lodash');
const { destination } = require("pino");
var tab_id_users = []
var settings = [];
let token = ""
var userConnect = {}

let user = {
    firstName: "Détenteur du setting 1",
    lastName: "Iencli",
    username: "ouil",
    email: "iencli@gmail.com",
    password: "123456789"
}

function rdm_user(tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length - 1))]
    return rdm_id
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

describe("POST - /setting", () => {
    it("Ajouter un setting. - S", (done) => {
        var e = {
            // setting_wind: "km/h",
            // setting_temperature: "°C",
            user_id: rdm_user(tab_id_users)
        }
        chai.request(server).post('/setting').auth(token, { type: "bearer" }).send(e).end((err, res) => {
            expect(res).to.have.status(201);
            settings.push(res.body);
            done();
        });
    });
    it("Ajouter un setting incorrect. (Sans setting_wind) - E", (done) => {
        chai.request(server).post('/setting').auth(token, { type: "bearer" }).send({
            // setting_temperature: "°C",
            user_id: rdm_user(tab_id_users)
        }).end((err, res) => {
            // console.log(err, res.body)
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un setting incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/setting').auth(token, { type: "bearer" }).send({
            // setting_wind: "km/p",
            // setting_temperature: "",
        }).end((err, res) => {
            // console.log(res.body)
            expect(res).to.have.status(405)
            done()
        })
    })
})

describe("POST - /settings", () => {
    it("Ajouter des settings. -S", (done) => {
        chai.request(server).post('/settings').auth(token, { type: "bearer" }).send([{
            // setting_wind: "km/h",
            // setting_temperature: "°C",
            user_id: rdm_user(tab_id_users)
        },
        {
            // setting_wind: "mi/h",
            // setting_temperature: "°F",
            user_id: rdm_user(tab_id_users)
        }]).end((err, res) => {
            // console.log(res)
            settings = [...settings, ...res.body]
            expect(res).to.have.status(201)
            done()
        });
    })
    it("Ajouter des settings incorrect. (Sans setting_wind) - E", (done) => {
        chai.request(server).post('/settings').auth(token, { type: "bearer" }).send([{
            // setting_temperature: "°P",
        },
        {
            // setting_temperature: "°C",
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })



    it("Ajouter des settings incorrect. (sans setting_temperature) - E", (done) => {
        chai.request(server).post('/settings').auth(token, { type: "bearer" }).send([{
            // setting_wind: "kmpp/h",
            user_id: rdm_user(tab_id_users)
        },
        {
            // setting_wind: "kmijd/h",
            user_id: rdm_user(tab_id_users)
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })

    it("Ajouter des settings incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/settings').auth(token, { type: "bearer" }).send([{
            // setting_wind: "km/p",
            // setting_temperature: "",
            user_id: rdm_user(tab_id_users)
        }, {
            // setting_wind: "kmdsklf/h",
            // setting_temperature: "",
            user_id: rdm_user(tab_id_users)
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })

    describe("GET - /setting", () => {
        it("Chercher un setting valide. - S", (done) => {
            chai.request(server).get('/setting').query({ fields: ["setting_temperature"], value: settings[0].setting_temperature }).auth(token, { type: "bearer" }).end((err, res) => {
                // console.log(err, res)
                res.should.have.status(200);
                done();
            });
        });
        it("Chercher un setting avec un champ non autorisé. - E", (done) => {
            chai.request(server).get('/setting').query({ fields: ["nonexistentField"], value: settings[0].update_email }).auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(405);
                done();
            });
        });
        it("Chercher un setting sans aucune query. - E", (done) => {
            chai.request(server).get('/setting').auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(405);
                done();
            });
        });
        it("Chercher un setting inexistant. - E", (done) => {
            chai.request(server).get('/setting').query({ fields: ["setting_wind"], value: "Setting inexistant" }).auth(token, { type: "bearer" }).end((err, res) => {
                // console.log(res)
                res.should.have.status(404);
                done();
            });
        });
    });


    describe("GET - /setting/:id", () => {
        it("Chercher un setting valide. - S", (done) => {
            chai.request(server).get(`/setting/${userConnect._id}`).auth(token, { type: "bearer" }).end((err, res) => {
                // console.log(userConnect._id)
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('_id');
                done();
            });
        });
        it("Chercher un setting non valide. - E", (done) => {
            const invalidsettingId = '123';
            chai.request(server).get(`/setting/${invalidsettingId}`).auth(token, { type: "bearer" }).end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
        });
        it("Chercher un setting non trouvé. - E", (done) => {
            const nonExistentsettingId = '60d72b2f9b1d8b002f123456';
            chai.request(server).get(`/setting/${nonExistentsettingId}`).auth(token, { type: "bearer" }).end((err, res) => {
                expect(res).to.have.status(404);
                done();
            });
        });
    });


    describe("GET - /settings", () => {
        it("Chercher plusieurs settings valide. -S", (done) => {
            chai.request(server).get('/settings').query({ id: _.map(settings, "_id") }).auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(200)
                done()
            })
        })
        it("Chercher plusieurs settings avec un id invalide. -E", (done) => {
            chai.request(server).get('/settings').query({ id: ["123456789", "123598745"] })
                .auth(token, { type: "bearer" }).end((err, res) => {
                    res.should.have.status(405)
                    done()
                })
        })
        it("Chercher plusieurs settings avec un id valide mais inexistant. -E", (done) => {
            chai.request(server).get('/settings').query({ id: ["6679389b79a3a34adc0ef201", "6679388f79a3a34adc0ef200"] })
                .auth(token, { type: "bearer" }).end((err, res) => {
                    res.should.have.status(404)
                    done()
                })
        })
    })

    describe("GET - /settings", () => {
        it("Chercher plusieurs settings valide. -S", (done) => {
            chai.request(server).get('/settings_by_filters').query({ page: 1, limit: 2 }).auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(200)
                expect(res.body.results).to.be.an('array')
                done()
            })
        })
        it("Chercher plusieurs settings avec une query vide. -S", (done) => {
            chai.request(server).get('/settings_by_filters')
                .auth(token, { type: "bearer" }).end((err, res) => {
                    res.should.have.status(200)
                    expect(res.body.results).to.be.an('array')
                    // expect(res.body.count).to.be.equal(44)
                    done()
                })
        })
        it("Chercher plusieurs settings avec une chaîne de caractère dans page. -E", (done) => {
            chai.request(server).get('/settings_by_filters').query({ page: 'une phrase', limit: 2 })
                .auth(token, { type: "bearer" }).end((err, res) => {
                    res.should.have.status(405)
                    done()
                })
        })
    })

    describe("PUT - /setting/:id", () => {
        it("Modifier un setting valide. - S", (done) => {
            chai.request(server).put(`/setting/${settings[0]._id}`).send({
                // setting_temperature: "°C"
            }).auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(200);
                done();
            });
        });
        it("Modifier un setting avec un id invalide. - E", (done) => {
            chai.request(server).put(`/setting/123456789`).auth(token, { type: "bearer" }).send({
                // setting_temperature: "°C"
            }).end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
        });
        it("Modifier un setting inexistant. - E", (done) => {
            chai.request(server).put(`/setting/60c72b2f4f1a4c3d88d9a1d9`).auth(token, { type: "bearer" }).send({
                name: "Non inexistant"
            }).end((err, res) => {
                expect(res).to.have.status(404);
                done();
            });
        });
        it("Modifier un setting avec un champ vide. - E", (done) => {
            chai.request(server).put(`/setting/${settings[0]._id}`).auth(token, { type: "bearer" }).send({
                // setting_temperature: ""
            }).end((err, res) => {
                expect(res).to.have.status(405);
                done();
            });
        });
    });

    describe("PUT - /settings", () => {
        it("Modifier plusieurs settings. - S", (done) => {
            chai.request(server).put('/settings').query({ id: _.map(settings, '_id') }).auth(token, { type: "bearer" }).send({
                // setting_temperature: "°C", setting_wind: "km/h"
            })
                .end((err, res) => {
                    // console.log(res)
                    res.should.have.status(200)
                    done()
                })
        })
        it("Modifier plusieurs settings avec ID ivalide. -E", (done) => {
            chai.request(server).put('/settings').query({ id: ["1234", "616546"] }).auth(token, { type: "bearer" }).send({
                // setting_wind: "km/h"
            }, {
                // setting_wind: "mi/h"
            })
                .end((err, res) => {
                    res.should.have.status(405)
                    done()
                })
        })
        it("Modifier des settings inexistants. -E", (done) => {
            chai.request(server).put('/settings').query({ id: ["6679773379a3a34adc0f05bf"] }).auth(token, { type: "bearer" }).send({
                name: "°ppp"
            })
                .end((err, res) => {
                    res.should.have.status(404)
                    done()
                })
        })
        it("Modifier des settings avec un champ vide. -E", (done) => {
            chai.request(server).put('/settings').query({ id: _.map(settings, '_id') }).auth(token, { type: "bearer" }).send({
                // setting_temperature: "°F",
                // setting_wind: ""
            })
                .end((err, res) => {
                    res.should.have.status(405)
                    done()
                })
        })
        it("Modifier des settings avec un id existant. -E", (done) => {
            chai.request(server).put('/settings').query({ _id: _.map(settings, '_id') }).auth(token, { type: "bearer" }).send({
                // setting_temperature: settings[1].setting_temperature
            },
            )
                .end((err, res) => {
                    res.should.have.status(405)
                    done()
                })
        })
    })

    describe("DELETE - /setting/:id", () => {
        it("Supprimer un setting valide. - S", (done) => {
            chai.request(server).delete(`/setting/${settings[0]._id}`).auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(200);
                done();
            });
        });
        it("Supprimer un setting avec un id inexistant. - E", (done) => {
            chai.request(server).delete(`/setting/60d72b2f9b1d8b002f123456`).auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(404);
                done();
            });
        });
        it("Supprimer un setting avec un id invalide. - E", (done) => {
            chai.request(server).delete('/setting/123').auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(405);
                done();
            });
        });
    });
    describe("DELETE - /settings", () => {
        it("Supprimer plusieurs settings. - S", (done) => {
            chai.request(server).delete('/settings').query({ id: _.map(settings, '_id') })
                .auth(token, { type: "bearer" }).end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
        it("Supprimer plusieurs settings incorrects (avec un id inexistant). - E", (done) => {
            chai.request(server).delete('/settings/665f18739d3e172be5daf092&665f18739d3e172be5daf093')
                .auth(token, { type: "bearer" }).end((err, res) => {
                    res.should.have.status(404)
                    done()
                })
        })
        it("Supprimer plusieurs settings incorrects (avec un id invalide). - E", (done) => {
            chai.request(server).delete('/settings').query({ id: ['123', '456'] })
                .auth(token, { type: "bearer" }).end((err, res) => {
                    res.should.have.status(405)
                    done()
                })
        })

        it("Supression des utilisateurs fictif", (done) => {
            UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
                done()
            })
        })
    })
})
