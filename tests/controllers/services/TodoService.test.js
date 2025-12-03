const TodoService = require("../../services/TodoService");
const UserService = require("../../services/UserService")
const chai = require("chai");
let expect = chai.expect;
const _ = require("lodash");
var id_todo_valid = "";
var tab_id_todos = [];
var todos = [];

var tab_id_users = []
let users = [
    {
        firstName: "Détenteur du todo 1",
        lastName: "Iencli",
        username: "ouil",
        email: "iencli@gmail.com",
        password: "hello"
    },
    {
        firstName: "Détenteur du todo 2",
        lastName: "Loup",
        username: "allo",
        email: "aryatte@gmail.com",
        password: "hello"
    },
    {
        firstName: "Détenteur du todo 3",
        lastName: "mnm",
        username: "ayooooo",
        email: "tchao@gmail.com",
        password: "hello"
    },
    {
        firstName: "Détenteur du todo 4",
        lastName: "djo",
        username: "edupont",
        email: "edupont@gmail.com",
        password: "hello"
    }
];

function rdm_user(tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length - 1))]
    return rdm_id
}



describe("addOneTodo", () => {
    it("Création des utilisateurs fictif", (done) => {
        UserService.addManyUsers(users, null, function (err, value) {
            tab_id_users = _.map(value, "_id")
            done()
        })
    })
    it("Todo correct. - S", (done) => {
        TodoService.addOneTodo("Paris", tab_id_users[0], null, function (err, value) {
            // console.log(err, value)
            expect(err).to.be.null;
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            id_todo_valid = value._id
            done();
        });
    });
    it("Todo incorrect. (Avec une city inexistante) - E", (done) => {
        TodoService.addOneTodo("dflivjlfvjdl", tab_id_users[0], null, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-found')
            done()
        });
    });
    // it("Todo incorrect. (Ville déjà existante) - E", (done) => {
    //     TodoService.addOneTodo("Paris", tab_id_users[0], null, function (err, value) {
    //         console.log(err, value)
    //         expect(err).to.haveOwnProperty("msg");
    //         expect(err).to.haveOwnProperty('type_error')
    //         expect(err['type_error']).to.be.equal('duplicate')
    //         done();
    //     });
    // });
});

describe("addManyTodos", () => {
    const mockCities = ["Paris", "InvalidCity"]; // Example cities
    const user_id = tab_id_users[0]; // Mock user_id

    it("Ajouter des données météorologiques valides - S", (done) => {
        TodoService.addManyTodos(mockCities.slice(0, 1), user_id, {}, function (err, value) {
            if (err) {
                done(err); // Fail the test if an unexpected error occurs
            } else {
                tab_id_todos = _.map(value, "_id");
                todos = [...value, ...todos];
                expect(value).to.be.an("array").that.has.lengthOf(1); // Adjust the expected length according to your mock data
                done();
            }
        });
    });

    it("Gérer correctement les données de ville non correct - E", (done) => {
        TodoService.addManyTodos(mockCities.slice(1), user_id, {}, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty('type_error');
            expect(err['type_error']).to.be.equal('multi');
            expect(err.errors).to.be.an("array").that.has.lengthOf(1);
            expect(err.errors[0]).to.haveOwnProperty('msg');
            expect(err.errors[0].type_error).to.be.oneOf(['no-found', 'no-valid']);
            done();
        });
    });

    it("Gérer les villes non valid - E", (done) => {
        TodoService.addManyTodos(mockCities, user_id, {}, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty('type_error');
            expect(err['type_error']).to.be.equal('multi');
            expect(err.errors).to.be.an("array").that.has.lengthOf(1); // Adjust based on mockCities
            done();
        });
    });
});


describe("findOneTodoById", () => {
    it("Chercher un todo existant correct. - S", (done) => {
        TodoService.findOneTodoById(id_todo_valid, null, function (err, value) {
            // console.log(err, value)
            expect(err).to.be.null;
            expect(value).to.be.an('object');
            expect(value).to.have.property('_id'),
                expect(value).to.have.property('humidity');
            done();
        });
    });

    it("Chercher un Todo avec ObjectId non valide. - E", (done) => {
        TodoService.findOneTodoById("invalidObjectId", null, function (err, value) {
            // console.log(err, value)
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.equal("no-valid");
            expect(value).to.be.undefined;
            done();
        });
    });

    it("Chercher un Todo non-existant correct. - E", (done) => {
        TodoService.findOneTodoById("64cbf7b3f392b6d70ec5b6f2", null, function (err, value) {
            // console.log(err, value)
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.equal("no-found");
            done();
        });
    });
});


describe("findOneTodo", () => {
    it("Cherche un todo existant avec des champs valides. - S", (done) => {
        TodoService.findOneTodo(["city"], "Paris", null, (err, value) => {
            expect(err).to.be.null;
            expect(value).to.be.an("object");
            expect(value).to.have.property("city", "Paris");
            expect(value).to.have.property("humidity");
            done();
        });
    });

    it("Cherche un todo avec des champs non autorisés. - E", (done) => {
        TodoService.findOneTodo(["invalidField"], "Paris", null, (err, value) => {
            expect(err).to.have.property("msg")
            expect(err).to.have.property("type_error", "no-valid");
            done();
        });
    });

    it("Cherche un todo avec une valeur vide. - E", (done) => {
        TodoService.findOneTodo(["city"], "", null, (err, value) => {
            expect(err).to.have.property("msg")
            expect(err).to.have.property("type_error", "no-valid");
            done();
        });
    });

    it("Cherche un todo avec des champs et valeurs valides mais inexistants. - E", (done) => {
        TodoService.findOneTodo(["city"], "Inexistante", null, (err, value) => {
            expect(err).to.have.property("msg", "Todo non trouvé.");
            expect(err).to.have.property("type_error", "no-found");
            done();
        });
    });
})

describe("findManyTodos", () => {
    it("Retourne 2 todos. - S", (done) => {
        TodoService.findManyTodos(null, 1, 2, null, function (err, value) {
            //console.log(err, value)
            expect(value).to.haveOwnProperty("count");
            expect(value).to.haveOwnProperty("results");
            //      expect(value["name"]).to.be.equal(2);
            expect(value["results"]).lengthOf(2);
            expect(err).to.be.null;
            done();
        });
    });

    it("Envoi chaîne de caractère sur page - E", (done) => {
        TodoService.findManyTodos(null, "invalid", 2, null, function (err, value) {
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            expect(value).to.be.undefined;
            done();
        });
    });
});

describe("updateOneTodo", () => {
    it("Modifier un Todo correct. - S", (done) => {
        TodoService.updateOneTodo(
            id_todo_valid,
            { city: "Updated city", wind: "Updated wind" },
            function (err, value) {
                // console.log(value)
                expect(value).to.be.a("object");
                expect(value).to.haveOwnProperty("_id");
                expect(value).to.haveOwnProperty("city");
                //  expect(value).to.haveOwnProperty("content");
                expect(value["city"]).to.be.equal("Updated city");
                expect(value["wind"]).to.be.equal("Updated wind");
                done();
            }
        );
    });

    it("Modifier un Todo avec id incorrect. - E", (done) => {
        TodoService.updateOneTodo(
            "invalid_id",
            { city: "Updated city", wind: "Updated wind" },
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-valid");
                done();
            }
        );
    });

    it("Modifier un Todo avec des champs requis vides. - E", (done) => {
        TodoService.updateOneTodo(
            id_todo_valid,
            { city: "", wind: "kdfjdl" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
                expect(err).to.haveOwnProperty("fields");
                expect(err["fields"]).to.haveOwnProperty("city");
                done();
            }
        );
    });
});

describe("updateManytodos", () => {
    it("Modifier plusieurs todos correctement. - S", (done) => {
        TodoService.updateManyTodos(
            tab_id_todos,
            { wind: "Bulk Updated wind" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.haveOwnProperty("modifiedCount");
                expect(value).to.haveOwnProperty("matchedCount");
                expect(value["matchedCount"]).to.be.equal(tab_id_todos.length);
                expect(value["modifiedCount"]).to.be.equal(tab_id_todos.length);
                done();
            }
        );
    });

    it("Modifier plusieurs todos avec id incorrect. - E", (done) => {
        TodoService.updateManyTodos(
            ["invalid_id"],
            { temp: "Bulk Updated temp" },
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-valid");
                done();
            }
        );
    });

    it("Modifier plusieurs todos avec des champs requis vides. - E", (done) => {
        TodoService.updateManyTodos(
            tab_id_todos,
            { humidity: "", wind: "Bulk Updated wind" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
                expect(err).to.haveOwnProperty("fields");
                expect(err["fields"]).to.haveOwnProperty("humidity");

                done();
            }
        );
    });
});

describe("deleteOneTodo", () => {
    it("Supprimer un Todo correct. - S", (done) => {
        TodoService.deleteOneTodo(id_todo_valid, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("city");
            expect(value).to.haveOwnProperty("temp");
            done();
        });
    });

    it("Supprimer un Todo avec id incorrect. - E", (done) => {
        TodoService.deleteOneTodo("invalid_id", function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });

    it("Supprimer un Todo avec un id inexistant. - E", (done) => {
        TodoService.deleteOneTodo(
            "665f18739d3e172be5daf092",
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-found");
                done();
            }
        );
    });
});

describe("deleteManytodos", () => {
    it("Supprimer plusieurs todos avec id incorrect. - E", (done) => {
        TodoService.deleteManyTodos(["invalid_id"], function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });

    it("Supprimer plusieurs todos correctement. - S", (done) => {
        TodoService.deleteManyTodos(tab_id_todos, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("deletedCount");
            expect(value["deletedCount"]).is.equal(tab_id_todos.length);
            done();
        });
    });


    it("Supression des utilisateurs fictif", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
            done()
        })
    })
})