'use strict';
var promise = require('bluebird');

module.exports = GoldenMessenger;

const KNOWN_REPLACEMENTS =[
    {slug: '{{QOTD.AUTHOR}}', value: 'Quote Of The Day'},
    {slug: '{{QOTD.QUOTE}}', value: 'Quote Of The Day'},
    {slug: '{{COINBASE.BTC}}', value: '10000.00'},
    {slug: '{{COINBASE.ETH}}', value: '1000.00'}
];

/**
 * WooCommerce REST API wrapper
 *
 * @param {Object} opt
 */
function GoldenMessenger(opt) {
    if (!(this instanceof GoldenMessenger)) {
      return new GoldenMessenger(opt);
    }

    if(!opt)
        opt = {};

    this.MSG_QOTD_AUTHOR_IDX = 0;
    this.MSG_QOTD_QUOTE_IDX = 1;
    this.MSG_COINBASE_BTC_IDX = 2;
    this.MSG_COINBASE_ETH_IDX = 3;
}




GoldenMessenger.prototype.SetMessage = function(msgId, msg)
{
    console.log('SetGlobalMessage: ' + msgId + ' ' + msg);
    if(msgId < KNOWN_REPLACEMENTS.length)
        KNOWN_REPLACEMENTS[msgId].value = msg;
}



GoldenMessenger.prototype.ProcessReplacements = function(sourceString, userModel, deviceModel) {
    var retval = sourceString;

    if(userModel){
        //if(retval.contains())
        retval = retval.replace('{{USER.LOCATION}}', userModel.location);
    }

    if(deviceModel)
    {
        retval = retval.replace('{{DEVICE.NAME}}', deviceModel.name);
        retval = retval.replace('{{DEVICE.LOCATION}}', deviceModel.location);
    }
    // body...
    for (var i = 0, len = KNOWN_REPLACEMENTS.length; i < len; i++) {
      retval = retval.replace(KNOWN_REPLACEMENTS[i].slug, KNOWN_REPLACEMENTS[i].value);
    }

    return retval;
};





promise.promisifyAll(GoldenMessenger.prototype);
