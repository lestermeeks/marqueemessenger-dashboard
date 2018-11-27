var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageSchema   = new Schema({
    _id: false,
      value: String,
      priority: Number,
      count: Number,
      //device: { type: Schema.Types.ObjectId, ref: 'DeviceSchema'}
  });

module.exports = mongoose.model('Message', MessageSchema);