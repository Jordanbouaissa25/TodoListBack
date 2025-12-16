const UserService = require("../../../services/UserService");
const chai = require("chai");
let expect = chai.expect;
const _ = require("lodash");
var id_user_valid = "";
var tab_id_users = [];
var users = []

describe("addOneUser", () => {
    it("Utilisateur correct. - S", (done) => {
        var user = {
            email: "jordanbouaissa257@gmail.com",
            password: "09072001sdsds"
        };
        UserService.addOneUser(user, null, function (err, value) {
            // console.log("ok")
            // console.log(err, value)
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            id_user_valid = value._id;
            users.push(value)
            done()
        });
    });
    it("Utilisateur incorrect. (Sans email) - E", (done) => {
        var user_no_valid = {
            password: "123456789"
        };
        UserService.addOneUser(user_no_valid, null, function (err, value) {
            // console.log(err, value)
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
            expect(err).to.haveOwnProperty("fields");
            expect(err["fields"]).to.haveOwnProperty("email");
            expect(err["fields"]["email"]).to.equal(
                "Path `email` is required."
            );
            done()
        });
    });
    it("Utilisateur correct avec un mot de passe avec + de 8 charactères. - S", (done) => {
        var password_valid = {
            email: "testeur2@gmail.com",
            password: "123456789"
        };
        UserService.addOneUser(password_valid, null, function (err, value) {
            // console.log(err, value)
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            password_valid = value._id;
            users.push(value)
            done()
        })
    })
});

describe("addManyUsers", () => {
    it("Utilisateurs à ajouter, non valide. - E", (done) => {
        var users_tab_error = [
            {
                email: "edouard.dupont@gmail.com",
                password: "oka"
            },
            {
                email: "edouard.dupont@gmail.com",
                password: "ioj"
            },
            {
                email: "edouard.dupont@gmail.com",
                password: "oaj"
            },
            {
                email: "edouard.dupont@gmail.com",
                password: "jjd"
            },
        ];

        UserService.addManyUsers(users_tab_error, null, function (err, value) {
            // console.log(err, value)
            done();
        });
    });
    it("Utilisateurs à ajouter, valide. - S", (done) => {
        var users_tab = [
            {
                email: "edouard.dupo3@gmail.com",
                password: "oisdoqsd"
            },
            {
                email: "edouard.dupon@gmail.com",
                testing: true,
                password: "oizjdoiqzeji"
            },
            {
                email: "edouard.dup2@gmail.com",
                testing: true,
                password: "oiazjodilpmqzsks"
            },
        ];

        UserService.addManyUsers(users_tab, null, function (err, value) {
            // console.log(err, value)
            tab_id_users = _.map(value, "_id");
            users = [...value, ...users]
            expect(value).lengthOf(3);
            done();
        });
    });
});

    describe('loginWithApple', () => {
        it('Crée et connecte un nouvel utilisateur Apple', (done) => {
            const appleId = 'apple123';
            const email = 'appleuser@test.com';

            UserService.loginWithApple(appleId, email, null, (err, user) => {
                expect(err).to.be.null;
                expect(user).to.have.property('email', email);
                expect(user).to.have.property('token');
                done();
            });
        });

        it('Connecte un utilisateur Apple existant', (done) => {
            const appleId = 'apple123';
            const email = 'appleuser@test.com'; // déjà créé précédemment

            UserService.loginWithApple(appleId, email, null, (err, user) => {
                expect(err).to.be.null;
                expect(user).to.have.property('email', email);
                expect(user).to.have.property('token');
                done();
            });
        });

        it('Erreur si AppleId manquant', (done) => {
            UserService.loginWithApple(null, 'test@test.com', null, (err, user) => {
                expect(err).to.have.property('type_error', 'no-valid');
                done();
            });
        });
 });

describe("findOneUser", () => {
    it("Chercher un utilisateur par les champs sélectionné. -S", (done) => {
        UserService.findOneUser(["email"], users[0].email, null, function (err, value) {
            expect(value).to.haveOwnProperty('password')
            done()
        })
    })
    it("Chercher un utilisateur avec un champ non authorisé. -E", (done) => {
        UserService.findOneUser(["email", "password"], users[0].email, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error')

            done()
        })
    })
    it("Chercher un utilisateur sans tableau de champ. -E", (done) => {
        UserService.findOneUser("email", users[0].email, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error')
            done()
        })
    })
    it("Chercher un utilisateur inexistant. -E", (done) => {
        UserService.findOneUser(["email"], users[0].email, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error')
            done()
        })
    })
})

describe("findOneUserById", () => {
    it("Chercher un utilisateur existant correct. - S", (done) => {
        UserService.findOneUserById(id_user_valid, null, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("email");
            done();
        });
    });
    it("Chercher un utilisateur non-existant correct. - E", (done) => {
        UserService.findOneUserById("100", null, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.equal("no-valid");
            done();
        });
    });
});

describe("findManyUsers", () => {
    it("Retourne 3 utilisateurs sur les 9. -S", (done) => {
        UserService.findManyUsers(null, 1, 3, null, function (err, value) {
            // console.log(err, value)
            expect(value).to.haveOwnProperty("count")
            expect(value).to.haveOwnProperty("results")
            expect(value["count"]).to.be.equal(7)
            expect(value["results"]).lengthOf(3)
            expect(err).to.be.null
            done()
        })
    })
    it("Envoi chaîne de caractère sur page - E", (done) => {
        UserService.findManyUsers(null, "eerer", 3, null, function (err, value) {
            expect(err).to.haveOwnProperty("type_error")
            expect(err["type_error"]).to.be.equal("no-valid")
            expect(value).to.undefined
            done()

        })
    })
})

describe("findManyUsersById", () => {
    it("Chercher des utilisateurs existant correct. - S", (done) => {
        UserService.findManyUsersById(tab_id_users, null, function (err, value) {
            expect(value).lengthOf(3);
            done();
        });
    });
});

describe("updateOneUser", () => {
    it("Modifier un utilisateur correct. - S", (done) => {
        UserService.updateOneUser(
            id_user_valid,
            { email: "jordanbouaissa@gmail.com", password: "65165165" }, null,
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.a("object");
                expect(value).to.haveOwnProperty("_id");
                expect(value).to.haveOwnProperty("email");
                expect(value).to.haveOwnProperty("password");
                done();
            }
        );
    });
    it("Modifier un utilisateur avec id incorrect. - E", (done) => {
        UserService.updateOneUser(
            "1200",
            { email: "aurelien@gmail.com", password: "123456789" }, null,
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-valid");
                done();
            }
        );
    });
    it("Modifier un utilisateur avec des champs requis vide. - E", (done) => {
        UserService.updateOneUser(id_user_valid, { email: "", password: "123456789" }, null, function (err, value) {
            expect(value).to.be.undefined
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('email')
            expect(err['fields']['email']).to.equal('Path `email` is required.')
            done()
        })
    })
});

describe("findOneAndUpdate", () => {

    it("Modifier un mot de passe correctement. - S", (done) => {
        UserService.findOneAndUpdate(
            { email: "edouard.dupont@gmail.com" },
            { password: "NewPassword123" },
            null,
            function (err, value) {
                // console.log(err, value)
                expect(err).to.be.null;
                expect(value).to.be.an("object");
                expect(value).to.haveOwnProperty('email');
                expect(value.email).to.equal("edouard.dupont@gmail.com");
                done();
            }
        );
    });

    it("Modifier un mot de passe avec un champ vide. - E", (done) => {
        UserService.findOneAndUpdate(
            { email: "edouard.dupont@gmail.com" },
            { password: "" },
            null,
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.haveOwnProperty('msg');
                expect(err).to.haveOwnProperty('type_error');
                expect(err['type_error']).to.be.equal('validator');
                expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1);
                expect(err).to.haveOwnProperty('fields');
                expect(err['fields']).to.haveOwnProperty('password');
                done();
            }
        );
    });

    it("Modifier un mot de passe avec des caractères invalides. - E", (done) => {
        UserService.findOneAndUpdate(
            { email: "edouard.dupont@gmail.com" },
            { password: "Invalid@Pass" },
            null,
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.equal("no-valid");
                expect(err['msg']).to.equal("Le mot de passe contient des caractères spéciaux non autorisés.");
                done();
            }
        );
    });

    it("Modifier un mot de passe avec moins de 8 caractères. - E", (done) => {
        UserService.findOneAndUpdate(
            { email: "edouard.dupont@gmail.com" },
            { password: "wjjh" },
            null,
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.haveOwnProperty('msg');
                expect(err).to.haveOwnProperty('type_error');
                expect(err['type_error']).to.be.equal('no-valid');
                // expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1);
                // expect(err).to.haveOwnProperty('fields');
                // expect(err['fields']).to.haveOwnProperty('password');
                done();
            }
        );
    });

    it("Essayer de modifier un utilisateur non existant. - E", (done) => {
        UserService.findOneAndUpdate(
            { email: "nonexistentuser@gmail.com" },
            { password: "ValidPass123" },
            null,
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.equal("no-found");
                expect(err['msg']).to.equal("Utilisateur non trouvé.");
                done();
            }
        );
    });

    it("Modifier un mot de passe sans critère de recherche. - E", (done) => {
        UserService.findOneAndUpdate(
            null,
            { password: "ValidPass123" },
            null,
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.equal("no-valid");
                expect(err['msg']).to.equal("Critères de recherche invalides.");
                done();
            }
        );
    });

    it("Modifier un mot de passe sans données de mise à jour. - E", (done) => {
        UserService.findOneAndUpdate(
            { email: "edouard.dupont@gmail.com" },
            null,
            null,
            function (err, value) {
                expect(value).to.be.undefined;
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.equal("no-valid");
                expect(err['msg']).to.equal("Données de mise à jour invalides.");
                done();
            }
        );
    });
});

describe("updatePassword", () => {
    it("Modifier un mot de passe sans email valide. - E", (done) => {
        UserService.findOneAndUpdate(null, "ValidPass123", null, function (err, value) {
            // console.log(err, value)
            expect(value).to.be.undefined;
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.equal("no-valid");
            // expect(err['msg']).to.equal("L'email est requis et doit être une chaîne de caractères.");
            done();
        });
    });

    it("Modifier un mot de passe sans mot de passe valide. - E", (done) => {
        UserService.findOneAndUpdate("edouard.dupont@gmail.com", null, null, function (err, value) {
            expect(value).to.be.undefined;
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.equal("no-valid");
            // expect(err['msg']).to.equal("Le mot de passe est requis et doit être une chaîne de caractères.");
            done();
        });
    });

    // Utilisateur connecté
    it("Modifier un mot de passe correctement. - S", (done) => {
        UserService.findOneAndUpdate(
            { email: "edouard.dupont@gmail.com" },
            { password: "NewPassword123" },
            null,
            function (err, value) {
                expect(err).to.be.null;
                expect(value).to.be.an("object");
                expect(value).to.haveOwnProperty('email');
                expect(value.email).to.equal("edouard.dupont@gmail.com");
                done();
            }
        );
    });

    it("Modifier un mot de passe avec des caractères invalides. - E", (done) => {
        UserService.findOneAndUpdate(
            { email: "edouard.dupont@gmail.com" },
            { password: "Invalid]Pass" },
            null,
            function (err, value) {
                expect(value).to.be.undefined;
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.equal("no-valid");
                expect(err['msg']).to.equal("Le mot de passe contient des caractères spéciaux non autorisés.");
                done();
            }
        );
    });

    it("Modifier un mot de passe avec moins de 8 caractères. - E", (done) => {
        UserService.findOneAndUpdate(
            { email: "edouard.dupont@gmail.com" },
            { password: "wjjh" },
            null,
            function (err, value) {
                expect(value).to.be.undefined;
                expect(err).to.haveOwnProperty('msg');
                expect(err).to.haveOwnProperty('type_error');
                expect(err['type_error']).to.be.equal('no-valid');
                done();
            }
        );
    });

    it("Essayer de modifier un utilisateur non existant. - E", (done) => {
        UserService.findOneAndUpdate(
            { email: "nonexistentuser@gmail.com" },
            { password: "ValidPass123" },
            null,
            function (err, value) {
                expect(value).to.be.undefined;
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.equal("no-found");
                expect(err['msg']).to.equal("Utilisateur non trouvé.");
                done();
            }
        );
    });

});


// describe("updateManyUsers", () => {
//     it("Modifier plusieurs utilisateurs correctement. - S", (done) => {
//         UserService.updateManyUsers(
//             tab_id_users,
//             { email: "kslkfjslfs@gmail.com", password: "" }, null,
//             function (err, value) {
//                 console.log(err, value)
//                 expect(value).to.haveOwnProperty("modifiedCount");
//                 expect(value).to.haveOwnProperty("matchedCount");
//                 expect(value["matchedCount"]).to.be.equal(tab_id_users.length);
//                 expect(value["modifiedCount"]).to.be.equal(tab_id_users.length);
//                 done();
//             }
//         );
//     });
//     it("Modifier plusieurs utilisateurs avec id incorrect. - E", (done) => {
//         UserService.updateManyUsers(
//             "1200",
//             { email: "john@mail.com", password: "26516541659" }, null,
//             function (err, value) {
//                 expect(err).to.be.a("object");
//                 expect(err).to.haveOwnProperty("msg");
//                 expect(err).to.haveOwnProperty("type_error");
//                 expect(err["type_error"]).to.be.equal("no-valid");
//                 done();
//             }
//         );
//     });
//     it("Modifier plusieurs utilisateurs avec des champs requis vide. - E", (done) => {
//         UserService.updateManyUsers(
//             tab_id_users,
//             { email: "", password: "slkfjqsoklf" }, null,
//             function (err, value) {
//                 expect(value).to.be.undefined;
//                 expect(err).to.haveOwnProperty("msg");
//                 expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
//                 expect(err).to.haveOwnProperty("fields");
//                 expect(err["fields"]).to.haveOwnProperty("email");
//                 expect(err["fields"]["email"]).to.equal(
//                     "Path `email` is required."
//                 );
//                 done();
//             }
//         );
//     });
// });

describe("deleteOneUser", () => {
    it("Supprimer un utilisateur correct. - S", (done) => {
        UserService.deleteOneUser(id_user_valid, null, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("email");
            expect(value).to.haveOwnProperty("password");
            done();
        });
    });
    it("Supprimer un utilisateur avec id incorrect. - E", (done) => {
        UserService.deleteOneUser("1200", null, function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });
    it("Supprimer un utilisateur avec un id inexistant. - E", (done) => {
        UserService.deleteOneUser(
            "665f18739d3e172be5daf092", null,
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

describe("deleteManyUsers", () => {
    it("Supprimer plusieurs utilisateurs avec id incorrect. - E", (done) => {
        UserService.deleteManyUsers("1200", null, function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });
    it("Supprimer plusieurs utilisateurs avec id mauvais format. - E", (done) => {
        UserService.deleteManyUsers(["1200", "1212"], null, function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });
    it("Supprimer plusieurs utilisateurs correctement. - S", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("deletedCount");
            expect(value["deletedCount"]).is.equal(tab_id_users.length);
            done();
        });
    });
});