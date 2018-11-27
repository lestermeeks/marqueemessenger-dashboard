
var mongoose     = require('mongoose');
var DeviceModel = mongoose.model('Device');

DeviceController = {};



DeviceController.LoadDeviceById = function( device_id, callback ) {
  DeviceModel
  .findOne({id: device_id})
  .populate('message_set')
  .populate('owner')
  .exec(function (err, device) {
    //if(device == null)
    //    DeviceController.DeviceInit(device_id, callback);
    //else
      callback(err, device);
  });
};

module.exports = DeviceController;