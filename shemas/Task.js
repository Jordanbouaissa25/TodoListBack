const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const taskSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['Urgente', 'Moyenne', 'Basse'],
      default: 'Moyenne'
    }
  },
  { timestamps: true }
);

module.exports = taskSchema;