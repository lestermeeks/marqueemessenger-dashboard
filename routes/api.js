const express = require('express');
const app = express();
const router = express.Router();
//const mongoose = require("mongoose");
//const User = mongoose.model("UserModel");
//var User = require("../controllers/UserController.js");
//const authCheck = require('../utils/jwt-auth')
const DeviceController = require( '../controllers/DeviceController');
const UserController = require( '../controllers/UserController');

function _getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/* GET home page. */
router.get('/', function(req, res, next) {


    res.send({
        title: 'GoldenTee Messages Api',
        version: 1,
        endpoints: [
            '/',
            '/device/:device_id/message',
        ]
    });
});

/* GET home page. */
router.get('/device/:device_id/message/:message_id', function(req, res, next) {
    var goldenMessenger = req.app.get('goldenMessenger');
    res.send(goldenMessenger.GetMessage(req.params.device_id, req.params.message_id));
});

router.get('/device/:device_id/message', function(req, res, next){
    var goldenMessenger = req.app.get('goldenMessenger');
    var device_id = req.params.device_id;
    var message_id = 0;

    DeviceController.LoadDeviceById( device_id, function(err, device){

        if(err){
            res.send(`ERROR|||${err}`);
        } else if (!device){
            res.send(`ERROR|||Device Not Found: (${device_id})`);
        } else if(!device.message_set){
            res.send(`ERROR|||No Message Set Selected For Device: (${device_id})`);
        } else if(!device.message_set.messages.length){
            res.send(`ERROR|||Empty Message Set Selected For Device: (${device_id})`);
        } else if(device.message_set && device.message_set.messages.length){
            
            //if(!message_id)
            //    message_id = _getRandomInt(device.message_set.messages.length);

            device.message_set.api_count++;
            device.message_set.last_shown++;
            if(device.message_set.last_shown >= device.message_set.messages.length)
                device.message_set.last_shown = 0;

            var sourceMessage = device.message_set.messages[device.message_set.last_shown].value;
            var targetMessage = goldenMessenger.ProcessReplacements(sourceMessage, device.owner, device);

            device.message_set.save();
            
            //console.log(`message sent index:${device.message_set.last_shown}`);
            res.send(targetMessage);
            
        }

        if(device){
            device.last_seen = new Date();
            device.api_count++;
            device.save();
        }
    });
});

module.exports = router;