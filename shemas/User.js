const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Définition du schéma de l'utilisateur
const userSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true, // Assure que chaque email est unique dans la base de données
        index: true
    },
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String
    },
    token: String
});

module.exports = userSchema;