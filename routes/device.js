const express = require('express');
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const router = express.Router();

const UserController = require( '../controllers/UserController');

router.get('/:device_id', ensureLoggedIn, function(req, res, next) {
    var auth_id = req.user.id;
    var device_id = req.params.device_id;
    UserController.LoadUserById(0, function(err, atlasUser){
        UserController.LoadDeviceById( device_id, function(err, deviceModel){
            // console.log(`device: ${userModel.auth_id}, ${req.user.id}`);
            if(deviceModel)
            {
                if(atlasUser.auth_id == auth_id || (deviceModel.owner && deviceModel.owner.auth_id == auth_id))
                {
                    if(deviceModel.owner){
                        UserController.LoadUserById(deviceModel.owner.id, function(err, userModel){
                            // console.log(`device: ${userModel.auth_id}, ${req.user.id}`);
                            res.render('device', {
                                base_url: `/device/${device_id}`,
                                user: userModel,
                                device: deviceModel,
                                default_messages: atlasUser.message_sets
                            });
                        });
                    } else {
                        // 
                        res.render('device', {
                            base_url: `/device/${device_id}`,
                            user: null,
                            device: deviceModel,
                            default_messages: atlasUser.message_sets
                        });
                    }
                }
                else
                {
                    console.log(`Device Not Owned By Requestor: ${user_id}, ${device_id}`);
                    res.status(401).send(`Device Not Owned By Requestor: ${user_id}, ${device_id}`);
                }
            }
            else
            {
                console.log(`Device Not Found: ${user_id}, ${device_id}`);
                res.status(401).send(`Device Not Found: ${user_id}, ${device_id}`);
            }
        });
    });
});

router.post('/:device_id', ensureLoggedIn, function(req, res, next){
    var auth_id = req.user.id;
    var device_id = req.params.device_id;
    var action_id = req.body.button;

    UserController.LoadUserById(0, function(err, atlasUser){
        UserController.LoadDeviceById( device_id, function(err, deviceModel){
            //console.log(`device: ${userModel.auth_id}, ${req.user.id}`);
            if(deviceModel)
            {
                if(atlasUser.auth_id == auth_id || (deviceModel.owner && deviceModel.owner.auth_id == auth_id))
                {
                    switch(action_id){
                        case 'update_device':
                        var message_set_id = req.body.message_set_id;
                        var location_value = req.body.location_value;
                        var name_value = req.body.name_value;

                        if(message_set_id == 'null')
                            deviceModel.message_set = null;
                        else
                            deviceModel.message_set = message_set_id;
                        deviceModel.location = location_value;
                        deviceModel.name = name_value;
                        deviceModel.save(function (err, deviceMode){
                            if(err)
                                res.send(err);
                            else
                                res.redirect(`/device/${device_id}`);
                        });
                        break;

                        default:
                        console.log(`device_id ${device_id} unknown action_id ${action_id}`);
                        res.send(`device_id ${device_id} unknown action_id ${action_id}`);
                        break;
                    }
                }
                else
                {
                    console.log(`Device Not Owned By Requestor: ${user_id}, ${device_id}`);
                    res.status(401).send(`Device Not Owned By Requestor: ${user_id}, ${device_id}`);
                }
            }
            else
            {
                console.log(`Device Not Found: ${user_id}, ${device_id}`);
                res.status(401).send(`Device Not Found: ${user_id}, ${device_id}`);
            }
        });
    });
});

module.exports = router;