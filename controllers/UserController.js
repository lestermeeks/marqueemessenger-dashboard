
var mongoose     = require('mongoose');
var DeviceModel = mongoose.model('Device');
var UserModel = mongoose.model('User');
var MessageSetModel = mongoose.model('MessageSet');
var CounterModel = mongoose.model('Counter');

var UserController = {};

UserController.init = function( callback ) {
  var newUser = new UserModel(
    {
      name: 'Test User Model Name',
      devices: [
        { name: 'Test Device Model Name 1' },
        { name: 'Test Device Model Name 2' }
      ]
    }
  );

  newUser.save(function(err, user) {
      callback(err, user);
  });
};

UserController.FindNextCounter = function(counter_name, callback)
{
  CounterModel
    .findOne({name: counter_name})
    .exec(function(err,counterModel){
      if(counterModel)
      {
        counterModel.value+=1;
        
      }
      else{
        counterModel = new CounterModel({name: counter_name, value: 0});

      }
      
      counterModel.save(callback);      
    });
}

UserController.NewUser = function(auth_profile, callback)
{
  UserController.FindNextCounter('user_id', function(err,counterIncModel){
    console.log(`NewUser save Counter: ${err}, ${JSON.stringify(counterIncModel)}`);
    var newUser = new UserModel(
      {
        id: counterIncModel.value,
        auth_id: auth_profile.user_id,
        name: auth_profile.nickname,
        location: `${auth_profile.nickname}'s Place`
      }
    );

    if(auth_profile.emails)
      newUser.email = auth_profile.emails[0].value;

    //console.log(`NewUser then Counter: ${JSON.stringify(newUser)}`);
    newUser.save(function(err,userModel){
      console.log(`NewUser save userModel: ${err}, ${JSON.stringify(userModel)}`);
      callback(err,userModel);
    });
  });
};

UserController.ListUsers = function (callback) {
  UserModel
  .find({})
  .exec(function (err, users) {
      callback(err, users);
  });
};

UserController.ListDevices = function (callback){
  DeviceModel
  .find({})
  .populate('owner')
  .populate('message_set')
  .exec(function (err, devices) {
      callback(err, devices);
  });
};


//this could auto create?
UserController.LoadUserByAuthProfile = function ( auth_profile, callback){
  UserModel
  .findOne({auth_id: auth_profile.user_id})
  .populate('devices')
  .populate('message_sets')
  .exec(function (err, user) {
    console.log(`UserContoller.LoadUserByAuthId: ${err}, ${user?user.id:null}`);

    if(user==null){
      UserController.NewUser(auth_profile, callback);
    }
    else
    {
      callback(err, user); 
    }

     
  });
};

UserController.LoadUserById = function ( id, callback){
  UserModel
  .findOne({id: id})
  .populate('devices')
  .populate('message_sets')
  .exec(function (err, user) {
    console.log(`UserContoller.LoadUserById: ${err}, ${user?user.id:null}`);

    //if(user==null){
    //  UserController.NewUser(auth_id, callback);
    //}
    //else
    //{
      callback(err, user); 
    //}

     
  });
};


UserController.UpdateLocation = function ( id, location, callback){
  UserModel
  .findOne({id: id})
  .exec(function (err, user) {
    console.log(`UserContoller.UpdateLocation: ${err}, ${user?user.id:null}`);

    if(user==null)
    {
      user.location = location;
      user.save(callback);
    }
    else
    {
      callback(err, user); 
    }
  });
};

UserController.DeviceInit = function( device_id, callback ) {
  var newDevice = new DeviceModel(
    {
      id: device_id
      //messages: [
      //  { value: 'Welcome to|||{{DEVICE.LOCATION}}' },
      //  { value: 'Coinbase|||Bitcoin ${{COINBASE.BTC}}   Ethereum ${{COINBASE.ETH}}' },
      //  { value: '{{QOTD.AUTHOR}}|||{{QOTD.QUOTE}}' },
      //  { value: 'Powered By|||www.marqueemessenger.com' },
      //  { value: 'GOLDEN TEE FORE! COMPLETE!!' }, //full size single bold
      //  { value: '- PRESENTING -|||GOLDEN TEE FORE! COMPLETE from Incredible Technologies!' },
      //  { value: 'GT 4 COMPLETE!|||Twenty-nine 18 hole courses to chose from!' },
      //  { value: 'All 29 Courses|||Do you have what it takes to master all 29 courses?' },
      //  { value: 'Play your favorite|||Mystic Hills     Suerte Del Sol     Crimson Rock     Pine Meadow     Bay Side     Rattlesnake     Maple Acres     Castleshire     Buckhorn     Blue Horizon' },
      //  { value: 'Play The Cycle!|||Crawdad Swamp     Kings Canyon     Kiwi Springs     Bluestone     Kings Canyon (am)     Bluestone (am)     Heartland Creek     Tropical Falls     Eagles Peak' },
      //  { value: 'Play Them All!|||Swords Pointe     Cedar Meadows     Shadow Swamp     Blue Horizon (am)     Eagles Peak (am)     Ridgewood     Painted Gorge     Oak Hollow     Sapphire Springs     Balmoral Greens' },
      //  { value: 'GT 4 COMPLETE!|||Test your skill on Twenty-Nine spectacular 3D courses!' },
      //  { value: 'THANK YOU FOR PLAYING GOLDEN TEE FORE! COMPLETE!!' }, //this one is full size bold
      //  { value: 'Check Out LIVE!|||If you Like GT Complete.  You will LOVE the revolutionary rew GOLDEN TEE LIVE game!' },
      //  { value: 'www.goldentee.com|||Visit GoldenTee.com for a location near you!'}
      //]
    }
  );
    newDevice.save(function(err, user) {
      callback(err, user);
  });
};

UserController.LoadDeviceById = function( device_id, callback ) {
  DeviceModel
  .findOne({id: device_id})
  .populate('owner')
  .exec(function (err, device) {
    console.log(`UserContoller.LoadDeviceById: ${err}, ${device?device.id:null}`);
    if(device == null)
      UserController.DeviceInit(device_id, callback);
    else
      callback(err, device);
  });
};

UserController.UpdateMessageSetForDevice = function( device_id, message_set_id, callback){
  console.log(`UserController.UpdateMessageSetForDevice - device_id:${device_id} set_id:${message_set_id}`);
  UserController.LoadDeviceById(device_id, function(err, deviceModel){
    deviceModel.message_set = message_set_id;
    deviceModel.save(callback);
  });
};

UserController.MessageSet = function( message_set_id, callback ) {
  MessageSetModel
  .findOne({_id: message_set_id})
  .exec(function (err, messageSet) {
    console.log(`UserContoller.MessageSet: ${err},${messageSet}`);
    callback(err, messageSet);
  });
};

UserController.CreateMessageSet = function (user_id, message_set_title, callback){
  console.log(`UserController.CreateMessageSet - user_id:${user_id} message_set_title:${message_set_title}`);
  UserController.LoadUserById(user_id, function(err, userModel){

    if(userModel)
    {
      var newMessageSet = new MessageSetModel(
        {
          title: message_set_title,
          messages: [
            { value: 'Welcome to|||{{DEVICE.LOCATION}}' },
            { value: 'Powered By|||www.marqueemessenger.com' },
            { value: 'GOLDEN TEE FORE! COMPLETE!!' }, //full size single bold
            { value: '- PRESENTING -|||GOLDEN TEE FORE! COMPLETE from Incredible Technologies!' },
            { value: 'GT 4 COMPLETE!|||Twenty-nine 18 hole courses to chose from!' },
            { value: 'All 29 Courses|||Do you have what it takes to master all 29 courses?' },
            { value: 'Play your favorite|||Mystic Hills     Suerte Del Sol     Crimson Rock     Pine Meadow     Bay Side     Rattlesnake     Maple Acres     Castleshire     Buckhorn     Blue Horizon' },
            { value: 'Play The Cycle!|||Crawdad Swamp     Kings Canyon     Kiwi Springs     Bluestone     Kings Canyon (am)     Bluestone (am)     Heartland Creek     Tropical Falls     Eagles Peak' },
            { value: 'Play Them All!|||Swords Pointe     Cedar Meadows     Shadow Swamp     Blue Horizon (am)     Eagles Peak (am)     Ridgewood     Painted Gorge     Oak Hollow     Sapphire Springs     Balmoral Greens' },
            { value: 'GT 4 COMPLETE!|||Test your skill on Twenty-Nine spectacular 3D courses!' },
            { value: 'THANK YOU FOR PLAYING GOLDEN TEE FORE! COMPLETE!!' }, //this one is full size bold
            { value: 'Check Out LIVE!|||If you Like GT Complete.  You will LOVE the revolutionary rew GOLDEN TEE LIVE game!' },
            { value: 'www.goldentee.com|||Visit GoldenTee.com for a location near you!'},
            { value: '{{QOTD.AUTHOR}}|||{{QOTD.QUOTE}}' }
          ]
        }
      );

      newMessageSet.title = message_set_title;

      console.log(`newMessageSet BEFORE: ${JSON.stringify(newMessageSet)}`);
      newMessageSet.save(function(err, savedMS){
        console.log(`newMessageSet AFTER: ${JSON.stringify(savedMS)}`);
        if(savedMS)
        {
          userModel.message_sets.push(newMessageSet);
          userModel.save(function(err, savedUser){
            
            callback(err, savedMS);
          });
        }
        else
        {

          callback(err);
        }

      });
     
    } else {
      callback(err);
    }
  });
};

UserController.RemoveMessageSet = function ( user_id, message_set_id, callback){
  UserModel
  .findOne({id: user_id})
  .exec(function (err, user) {
    console.log(`RemoveMessageSet: Find User ${user_id} - ERR: ${err}`);
    if(!user){
      callback(err,user);
    }else{
      UserController.MessageSet(message_set_id, function(err, message_set){
        console.log(`RemoveDevice: Find Device ${message_set_id} - ERR: ${err}`);
        if(!message_set){
          callback(err,null);
        } else {

          //message_set.owner = null;
          //message_set.save();

          user.message_sets.pull(message_set);
          user.save(function(err, user) {
            console.log(`RemoveDevice: Save User ${user_id} - ERR: ${err} - User: ${JSON.stringify(user)}`);
            callback(err, user);
        });
        }
      });


    }
  });
};

UserController.ClaimDevice = function ( user_id, device_id, callback){
  
  console.log(`UserController.ClaimDevice - user_id:${user_id} device_id:${device_id}`);
  UserController.LoadUserById(user_id, function(err, userModel){
    if(!err) 
    {
        UserController.LoadDeviceById(device_id, function(err, deviceModel){
        if(deviceModel.owner)
        {
          callback('Device is already claimed.', null);
        }
        else
        {
          deviceModel.owner = userModel;
          deviceModel.save(function(err,savedDevice){
            console.log(`ClaimDevice Device - deviceModel:${savedDevice}`);

            userModel.devices.push(deviceModel);
            userModel.save(function(err,updatedUser){
              callback(err,updatedUser);
            });
          });
        }
      });
    
    } else {
      callback(err,userModel);
    }
  });
};

UserController.RemoveDevice = function ( user_id, device_id, callback){
  UserModel
  .findOne({id: user_id})
  .exec(function (err, user) {
    console.log(`RemoveDevice: Find User ${user_id} - ERR: ${err}`);
    if(!user){
      callback(err,user);
    }else{
      UserController.LoadDeviceById(device_id, function(err, device){
        console.log(`RemoveDevice: Find Device ${device_id} - ERR: ${err}`);
        if(!device){
          callback(err,null);
        } else {

          device.owner = null;
          device.save();

          user.devices.pull(device);
          user.save(function(err, user) {
            console.log(`RemoveDevice: Save User ${user_id} - ERR: ${err} - User: ${JSON.stringify(user)}`);
            callback(err, user);
        });
        }
      });


    }
  });
};

module.exports = UserController;