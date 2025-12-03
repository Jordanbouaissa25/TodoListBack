const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    data_id: {
        type: Number,
        required: false
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: false,
    },
   
    description: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: false
    }
})


module.exports = todoSchema;