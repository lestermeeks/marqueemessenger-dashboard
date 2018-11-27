const express = require('express');
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const router = express.Router();

const UserController = require( '../controllers/UserController');

/* GET user profile. */
router.get('/', ensureLoggedIn, function(req, res, next) {
    console.log(`redirect logged user ${req.user.id}`);
    UserController.LoadUserByAuthProfile(req.user, function(error, userModel){
    //console.log()
        res.redirect(`/user/${userModel.id}`);
    });

});


router.get('/:user_id', ensureLoggedIn, function(req, res, next) {
    var user_id = req.params.user_id;
    console.log(`req user ${user_id} ?= logged user ${req.user.id}`);

    UserController.LoadUserById(0, function(err, atlasModel){
    
        UserController.LoadUserById(user_id, function(error, userModel){

            if( atlasModel.auth_id == req.user.id || userModel.auth_id == req.user.id)
            {

                if(user_id == 0)
                {
                    UserController.ListUsers( function(err, users){
                        UserController.ListDevices( function(err, devices){
                            res.render('admin', {
                                user: userModel,
                                devices: devices,
                                users: users
                            });
                        });
                    });


                }
                else
                {
                    res.render('user', {
                        auth: req.user,
                        user: userModel
                    });
                }
            }
            else
            {
                res.status(401);//.send('')
            }

        });
    });
});

// router.get('/:user_id/d/:device_id', ensureLoggedIn, function(req, res, next) {
//     var user_id = req.params.user_id;
//     var device_id = req.params.device_id;

//     UserController.LoadUserById( user_id, function(err, userModel){
//         //console.log(`device: ${userModel.auth_id}, ${req.user.id}`);
        
//         var deviceModel = undefined;
//         if(userModel && userModel.devices){
            
//             userModel.devices.forEach(current_device => {
//                 console.log(`current_device: ${current_device.id}`);
//                 if(current_device.id == device_id)
//                 {
//                     deviceModel = current_device;
//                 }
//             });
//         }



//         if(deviceModel)
//         {

//             UserController.LoadUserById(0, function(err, defaultUser){
//                 //console.log(`device: ${userModel.auth_id}, ${req.user.id}`);
//                 res.render('device', {
//                     base_url: `/user/${user_id}/d/${device_id}`,
//                     user_id: user_id,
//                     user: userModel,
//                     device: deviceModel,
//                     default_messages: defaultUser.message_sets
//                 });
//             });
//         }
//         else
//         {
//             console.log(`Device Not Owned By Requestor: ${user_id}, ${device_id}`);
//             res.status(401).send(`Device Not Owned By Requestor: ${user_id}, ${device_id}`);
//         }
//     });



// });


router.get('/:user_id/ms/:message_set_id', ensureLoggedIn, function(req, res, next) {
    var user_id = req.params.user_id;
    var message_set_id = req.params.message_set_id;


    UserController.LoadUserById( user_id, function(err, userModel){
        //console.log(`device: ${userModel.auth_id}, ${req.user.id}`);
        
        var msModel = undefined;
        if(userModel && userModel.message_sets){
            
            userModel.message_sets.forEach(current_ms => {
                console.log(`current_ms: ${current_ms.id}`);
                if(current_ms.id == message_set_id)
                {
                    msModel = current_ms;
                }
            });
        }

        if(msModel)
        {
            res.render('message_set', {
                base_url: `/user/${user_id}/ms/${message_set_id}`,
                user: userModel,
                message_set: msModel
              });
        }
        else
        {
            console.log(`MessageSet Not Owned By Requestor: ${user_id}, ${message_set_id}`);
            res.status(401).send(`MessageSet Not Owned By Requestor: ${user_id}, ${message_set_id}`);
        }
    });
});


  //process the post... for claiming a device id
router.post('/:user_id', ensureLoggedIn, function(req, res, next) {

    var user_id = req.params.user_id;
    var device_id = req.body.device_id;

    var action_id = req.body.button;

    UserController.LoadUserById(0, function(err, atlasModel){
        UserController.LoadUserById(user_id, function(error, userModel){
            if( atlasModel.auth_id == req.user.id || userModel.auth_id == req.user.id)

            {
                switch(action_id){
                    case 'claim_device':
                    UserController.ClaimDevice(user_id, device_id, function ( err, deviceModel ){
                        if(err)
                            res.send(err);
                        else
                            res.redirect('/user');
                    });
                    break;

                    case 'remove_device':
                    UserController.RemoveDevice(user_id, device_id, function ( err, deviceModel ){
                        if(err)
                            res.send(err);
                        else
                            res.redirect(`/user/${user_id}`);
                    });
                    break;

                    case 'create_message_set':
                    var message_set_title = req.body.message_set_title;
                    UserController.CreateMessageSet(user_id, message_set_title, function ( err, msModel ){
                        if(err)
                            res.send(err);
                        else
                            res.redirect(`/user/${user_id}`);
                    });
                    break;

                    case 'remove_message_set':
                    var message_set_id = req.body.message_set_id;
                    UserController.RemoveMessageSet(user_id, message_set_id, function ( err, msModel ){
                        if(err)
                            res.send(err);
                        else
                            res.redirect(`/user/${user_id}`);
                    });
                    break;



                    default:
                    console.log(`user ${user_id} unknown action_id ${action_id}`);
                    res.send(`user ${user_id} unknown action_id ${action_id}`);
                    break;
                }
            }
            else
            {
                res.status(401);//.send('')
            }
        });
    });
});

// router.post('/:user_id/d/:device_id', ensureLoggedIn, function(req, res, next){
//     var user_id = req.params.user_id;
//     var device_id = req.params.device_id;
//     var action_id = req.body.button;

//         switch(action_id){
//             case 'update_message_set':
//             var message_set_id = req.body.message_set_id;
//             UserController.UpdateMessageSetForDevice(user_id, device_id, message_set_id, function ( err, deviceModel ){
//                 console.log(`UpdateMessageSetForDevice: ${user_id} ${device_id} ${JSON.stringify(deviceModel)}`);
//                 if(err)
//                     res.send(err);
//                 else
//                     res.redirect(`/user/${user_id}/d/${device_id}`);
//             });
//             break;



//             default:
//             console.log(`user ${user_id} unknown action_id ${action_id}`);
//             res.send(`user ${user_id} unknown action_id ${action_id}`);
//             break;
//         }


// });

router.post('/:user_id/ms/:message_set_id', ensureLoggedIn, function(req, res, next){
    var user_id = req.params.user_id;
    var message_set_id = req.params.message_set_id;
    var action_id = req.body.button;

    //if( user_id == req.user.id )
    {

        switch(action_id){

            case 'remove_message':
            var message_idx = req.body.message_idx;
            if(message_idx != undefined)
            {
                UserController.MessageSet(message_set_id, function ( err, messageSetModel ){
                    if(err)
                    {
                        res.send(err);
                    }
                    else
                    {
                        messageSetModel.messages.splice(message_idx, 1);
                        messageSetModel.save(function ( err, messageSetModel ){
                            console.log(`message removed -> /user/${user_id}/ms/${message_set_id}`);
                            res.redirect(`/user/${user_id}/ms/${message_set_id}`);
                        });
                        
                    }
                });
            }
            break;

            
            case 'save_message':
            var message_idx = req.body.message_idx;
            var message_value = req.body.message_value;
            if(message_idx != undefined)
            {
                UserController.MessageSet(message_set_id, function ( err, messageSetModel ){
                    if(err)
                    {
                        res.send(err);
                    }
                    else
                    {
                        messageSetModel.messages[message_idx] = { value: message_value};
                        messageSetModel.save(function ( err, messageSetModel ){
                            console.log(`message saved -> /user/${user_id}/ms/${message_set_id}`);
                            res.redirect(`/user/${user_id}/ms/${message_set_id}`);
                        });
                        
                    }
                });
            }
            break;

            case 'add_message':
            var message = req.body.message;
            console.log(`add_message: ${message} to ${message_set_id}`);
            UserController.MessageSet(message_set_id, function ( err, messageSetModel ){
                if(err)
                {
                    res.send(err);
                }
                else
                {

                    messageSetModel.messages.push({ value: message });
                    messageSetModel.save(function ( err, savedMessageSet ){
                        res.redirect(`/user/${user_id}/ms/${message_set_id}`);
                    });
                }
            });
            break;

            case 'update_title':
            var title_value = req.body.title_value;
            console.log(`update_title: ${title_value} to ${message_set_id}`);
            UserController.MessageSet(message_set_id, function ( err, messageSetModel ){
                if(err)
                {
                    res.send(err);
                }
                else
                {

                    messageSetModel.title = title_value;
                    messageSetModel.save(function ( err, savedMessageSet ){
                        res.redirect(`/user/${user_id}/ms/${message_set_id}`);
                    });
                }
            });
            break;

            case 'update_desc':
            var desc_value = req.body.desc_value;
            console.log(`update_desc: ${desc_value} to ${message_set_id}`);
            UserController.MessageSet(message_set_id, function ( err, messageSetModel ){
                if(err)
                {
                    res.send(err);
                }
                else
                {

                    messageSetModel.description = desc_value;
                    messageSetModel.save(function ( err, savedMessageSet ){
                        res.redirect(`/user/${user_id}/ms/${message_set_id}`);
                    });
                }
            });
            break;

            default:
            console.log(`user ${user_id} unknown action_id ${action_id}`);
            res.send(`user ${user_id} unknown action_id ${action_id}`);
            break;
        }

    }
    //else
    //{
    //    res.status(401);//.send('')
    //}
    //var goldenMessenger = req.app.get('goldenMessenger');
    //res.send(goldenMessenger.GetMessage(req.params.device_id));
});

module.exports = router;
