const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Définition du schéma des paramètres pour la ToDo List
const settingSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Référence au modèle User
    },
    theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light"
    },
    language: {
        type: String,
        enum: ["fr", "en"],
        default: "fr"
    },
    todo_sort: {
        type: String,
        enum: ["date", "priority", "title"],
        default: "date"
    },
    show_completed: {
        type: Boolean,
        default: true
    },
    notifications: {
        enabled: {
            type: Boolean,
            default: true
        },
        reminder_minutes: {
            type: Number,
            default: 30
        }
    },
    items_per_page: {
        type: Number,
        default: 10
    }
});

module.exports = settingSchema;

