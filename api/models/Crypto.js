/**
 * Crypto.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const bigNumber = require('bignumber.js');
module.exports = {

  tableName: 'cryptos',

  attributes: {

    address: {
      type: 'string'
    },

    currency: {
      type: 'string'
    },

    statusId: {
      type: 'INTEGER',
      defaultsTo: 2
    },

    user: {
      columnName: 'userId',
      model: 'user',
      defaultsTo: '0'
    },

    transactions: {
      collection: 'transaction',
      via: 'crypto'
    },

    toJSON: function () {
      var obj = this.toObject();
      if('address' in obj && sails.config.TFT){
        let usdRaised = new bigNumber(sails.config.TFT.totalUsdRaised);

        if(usdRaised.gte('1100000'))
          obj.address = '[ PRE-ICO CLOSED ]';
      }
      return obj;
    }
  }
};

