const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  user_id: { 
    type: Schema.Types.ObjectId,
      required: true
     },
  title: {
     type: String,
      required: true
     },
  description: {
     type: String,
     required: false
    },
  completed: {
     type: Boolean,
      default: false
     },
  created_at: {
     type: Date,
      default: Date.now
     }
});

module.exports = taskSchema;