// app/models/timed_price_model.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    name: String,
    created: { type: Date, default: Date.now },
    value: Number,
});

module.exports = mongoose.model('TimedPriceModel', UserSchema);