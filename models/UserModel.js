
var 
    mongoose     = require('mongoose'),
    //DeviceModel = require('./DeviceModel'),
    //DeviceSchema = mongoose.model('DeviceModel').schema,
    Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    id: {
        type: Number,
        required: true,
        index: true,
        unique: true
    },
    auth_id: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    name: String,
    email: String,
    location: String,
    devices:  [{ type: Schema.Types.ObjectId, ref: 'Device' }],
    message_sets: [{ type: Schema.Types.ObjectId, ref: 'MessageSet'}]
});

module.exports = mongoose.model('User', UserSchema);