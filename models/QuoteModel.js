// app/models/timed_price_model.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var QuoteSchema   = new Schema({
    author: String,
    created: { type: Date, default: Date.now },
    value: String,
});

module.exports = mongoose.model('QuoteModel', QuoteSchema);