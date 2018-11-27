var 
    mongoose = require('mongoose'),
    //MessageModel = require('./MessageModel'),
    //MessageSchema = mongoose.model('Message').schema,
    Schema = mongoose.Schema;


var CounterSchema   = new Schema({
    name: {
      type: String,
      required: true,
      index: true,
      unique: true
    },
    value: Number,
});

module.exports = mongoose.model('Counter', CounterSchema);
