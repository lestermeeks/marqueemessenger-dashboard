var 
    mongoose        = require('mongoose'),
    MessageSchema   = mongoose.model('Message').schema,
    Schema          = mongoose.Schema;

var MessageSetSchema = new Schema({
    title: String,
    description: String,
    api_count:  { type:Number, default: 0},
    last_shown:  { type:Number, default: -1},
    messages: [MessageSchema]
});

module.exports = mongoose.model('MessageSet', MessageSetSchema);