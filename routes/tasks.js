const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  task: {
    type: String,
    require: true
  },
  term: {
    type: String,
    require: true
  },
  date: {
    type: String,
    require: true
  },
});

module.exports = mongoose.model('task', taskSchema);