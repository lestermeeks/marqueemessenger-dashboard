var 
    mongoose = require('mongoose'),
    //MessageModel = require('./MessageModel'),
    //MessageSchema = mongoose.model('Message').schema,
    Schema = mongoose.Schema;


var DeviceSchema   = new Schema({
    id: {
      type: String,
      required: true,
      index: true,
      unique: true
    },
    name: String,
    api_count: { type:Number, default: 0},
    first_seen: { type: Date, default: Date.now },
    last_seen: { type: Date, default: Date.now },
    location: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    message_set: { type: Schema.Types.ObjectId, ref: 'MessageSet' },
});

module.exports = mongoose.model('Device', DeviceSchema);
