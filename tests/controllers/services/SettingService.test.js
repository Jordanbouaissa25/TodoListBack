const SettingService = require("../../../services/SettingService");
const UserService = require("../../../services/UserService")
const chai = require("chai");
let expect = chai.expect;
const _ = require("lodash");
var id_setting_valid = "";
var tab_id_settings = [];
var settings = [];

var tab_id_users = []
let users = [
    {
        firstcity: "Détenteur du setting 1",
        lastcity: "Iencli",
        usercity: "ouil",
        email: "iencli@gmail.com",
        password: "hello"
    },
    {
        firstcity: "Détenteur du setting 2",
        lastcity: "Loup",
        usercity: "allo",
        email: "aryatte@gmail.com",
        password: "hello"
    },
    {
        firstcity: "Détenteur du setting 3",
        lastcity: "mnm",
        usercity: "ayooooo",
        email: "tchao@gmail.com",
        password: "hello"
    },
    {
        firstcity: "Détenteur du setting 4",
        lastcity: "djo",
        usercity: "edupont",
        email: "edupont@gmail.com",
        password: "hello"
    }
];

function rdm_user(tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length - 1))]
    return rdm_id
}



describe("addOneSetting", () => {
    it("Création des utilisateurs fictif", (done) => {
        UserService.addManyUsers(users, null, function (err, value) {
            // console.log(err)
            tab_id_users = _.map(value, "_id")
            done()
        })
    })
    it("Setting correct. - S", (done) => {
        // console.log(tab_id_users)
        var setting = {
            setting_temperature: "°C",
            setting_wind: "km/h",
            user_id: tab_id_users[0]._id
        };
        SettingService.addOneSetting(setting, null, function (err, value) {
            // console.log(err, value)
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            id_setting_valid = value._id;
            settings.push(value);
            done()
        });
    });

    it("Setting incorrect. (Sans setting_wind) - E", () => {
        var setting_no_valid = {
            setting_temperature: "°Z",
            user_id: rdm_user(tab_id_users)
        };
        SettingService.addOneSetting(setting_no_valid, null, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
            expect(err).to.haveOwnProperty("fields");
            expect(err["fields"]).to.haveOwnProperty("setting_wind");
            expect(err["fields"]["setting_wind"]).to.equal(
                "Path `setting_wind` is required."
            );
        });
    });
});

describe("addManysettings", () => {
    it("settings à ajouter, non valide. - E", (done) => {
        var settings_tab_error = [
            {
                setting_temperature: "°Cksjd",
                setting_wind: "kdsokdm/h",
                city: "dlkjjs",
                user_id: rdm_user(tab_id_users)
            },
            {
                setting_temperature: "°Cdskj",
                setting_wind: "kxkockm/h",
                city: "Montbélcskl,siard",
                user_id: rdm_user(tab_id_users)
            },
        ];

        SettingService.addManySettings(settings_tab_error, function (err, value) {
            done();
        });
    });

    it("Settings à ajouter, valide. - S", (done) => {
        var settings_tab = [
            {
                setting_temperature: "°C",
                setting_wind: "km/h",
                city: "Hurghada",
                user_id: rdm_user(tab_id_users)
            },
            {
                setting_temperature: "°F",
                setting_wind: "mi/h",
                city: "Bali",
                user_id: rdm_user(tab_id_users)
            },
        ];

        SettingService.addManySettings(settings_tab, function (err, value) {
            tab_id_settings = _.map(value, "_id");
            settings = [...value, ...settings];
            expect(value).lengthOf(2);
            done();
        });
    });
});

describe("findOneSetting", () => {
    it("Chercher un Setting par les champs sélectionné. - S", (done) => {
        SettingService.findOneSetting(["setting_temperature"], settings[0].setting_temperature, null, function (err, value) {
            // console.log(err, value)
            expect(value).to.haveOwnProperty('setting_temperature');
            done();
        });
    });

    it("Chercher un Setting avec un champ non autorisé. - E", (done) => {
        SettingService.findOneSetting(["setting_temperature", "setting_wind"], settings[0].city, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error');
            done();
        });
    });

    it("Chercher un Setting sans tableau de champ. - E", (done) => {
        SettingService.findOneSetting("city", settings[0].city, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error');
            done();
        });
    });

    it("Chercher un Setting inexistant. - E", (done) => {
        SettingService.findOneSetting(["city"], "non-existent-city", null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error');
            done();
        });
    });
});

describe("findOneSettingById", () => {
    it("Chercher un setting existant correct. - S", (done) => {
        SettingService.findOneSettingById(tab_id_users[0], null, function (err, value) {
            // console.log(err, value)
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("setting_temperature");
            done();
        });
    });


    it("Chercher un Setting non-existant correct. - E", (done) => {
        SettingService.findOneSettingById("100", null, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.equal("no-valid");
            done();
        });
    });
});

describe("findManysettings", () => {
    it("Retourne 2 settings. - S", (done) => {
        SettingService.findManySettings(null, 1, 2, null, function (err, value) {
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
        SettingService.findManySettings(null, "invalid", 2, null, function (err, value) {
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            expect(value).to.be.undefined;
            done();
        });
    });
});

describe("findManysettingsById", () => {
    it("Chercher des settings existants correct. - S", (done) => {
        SettingService.findManySettingsById(tab_id_settings, null, function (err, value) {
            expect(value).lengthOf(2);
            done();
        });
    });
});

describe("updateOneSetting", () => {
    it("Modifier un Setting correct. - S", (done) => {
        SettingService.updateOneSetting(
            id_setting_valid,
            { setting_wind: "km/h", setting_temperature: "°C" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.a("object");
                expect(value).to.haveOwnProperty("_id");
                expect(value).to.haveOwnProperty("setting_temperature");
                //  expect(value).to.haveOwnProperty("content");
                expect(value["setting_wind"]).to.be.equal("km/h");
                expect(value["setting_temperature"]).to.be.equal("°C");
                done();
            }
        );
    });

    it("Modifier un Setting avec id incorrect. - E", (done) => {
        SettingService.updateOneSetting(
            "invalid_id",
            { city: "Updated city", setting_temperature: "Updated setting_temperature" },
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-valid");
                done();
            }
        );
    });

    it("Modifier un Setting avec des champs requis vides. - E", (done) => {
        SettingService.updateOneSetting(
            id_setting_valid,
            { setting_wind: "", setting_temperature: "°C" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
                expect(err).to.haveOwnProperty("fields");
                expect(err["fields"]).to.haveOwnProperty("setting_wind");

                done();
            }
        );
    });
});

describe("updateManysettings", () => {
    it("Modifier plusieurs settings correctement. - S", (done) => {
        SettingService.updateManySettings(
            tab_id_settings,
            { setting_wind: "km/h", setting_temperature: "°F" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.haveOwnProperty("modifiedCount");
                expect(value).to.haveOwnProperty("matchedCount");
                expect(value["matchedCount"]).to.be.equal(tab_id_settings.length);
                expect(value["modifiedCount"]).to.be.equal(tab_id_settings.length);
                done();
            }
        );
    });

    it("Modifier plusieurs settings avec id incorrect. - E", (done) => {
        SettingService.updateManySettings(
            ["invalid_id"],
            { setting_temperature: "Bulk Updated setting_temperature" },
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-valid");
                done();
            }
        );
    });

    it("Modifier plusieurs settings avec des champs requis vides. - E", (done) => {
        SettingService.updateManySettings(
            tab_id_settings,
            { setting_wind: "", setting_temperature: "°C" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
                expect(err).to.haveOwnProperty("fields");
                expect(err["fields"]).to.haveOwnProperty("setting_wind");

                done();
            }
        );
    });
});

describe("deleteOneSetting", () => {
    it("Supprimer un Setting correct. - S", (done) => {
        SettingService.deleteOneSetting(id_setting_valid, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("setting_wind");
            expect(value).to.haveOwnProperty("setting_temperature");
            done();
        });
    });

    it("Supprimer un Setting avec id incorrect. - E", (done) => {
        SettingService.deleteOneSetting("invalid_id", function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });

    it("Supprimer un Setting avec un id inexistant. - E", (done) => {
        SettingService.deleteOneSetting(
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

describe("deleteManysettings", () => {
    it("Supprimer plusieurs settings avec id incorrect. - E", (done) => {
        SettingService.deleteManySettings(["invalid_id"], function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });

    it("Supprimer plusieurs settings correctement. - S", (done) => {
        SettingService.deleteManySettings(tab_id_settings, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("deletedCount");
            expect(value["deletedCount"]).is.equal(tab_id_settings.length);
            done();
        });
    });


    it("Supression des utilisateurs fictif", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
            done()
        })
    })
});


