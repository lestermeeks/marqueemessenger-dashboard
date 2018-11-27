//MessageModel.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageSchema   = new Schema({
    value: String,
    priority: Number,
    count: Number,
    //device: { type: Schema.Types.ObjectId, ref: 'DeviceSchema'}
});

var DeviceSchema   = new Schema({
    name: String,
    last_message: Number,
    messages: [{ type: Schema.Types.ObjectId, ref: 'MessageSchema' }]
});

var UserSchema   = new Schema({
    name: String,
    devices:  [{ type: Schema.Types.ObjectId, ref: 'DeviceSchema' }]
});


var MessageModel = mongoose.model('MessageModel', MessageSchema);
var DeviceModel = mongoose.model('DeviceModel', DeviceSchema);
var UserModel = mongoose.model('UserModel', UserSchema);

module.exports = router;
export { UserModel, DeviceModel, MessageModel }