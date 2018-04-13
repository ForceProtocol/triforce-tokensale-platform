/**
 * Triforce.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    totalSupply: {
      type: 'string',
      defaultsTo: '500000000'
    },

    preIcoSupply: {
      type: 'string',
      defaultsTo: '8000000'
    },

    totalPurchased: {
      type: 'string',
      defaultsTo: '0'
    },

    tftRate: {
      type: 'string',
      defaultsTo: '0.20'
    },

    totalUsdRaised: {
      type: 'string',
      defaultsTo: '0'
    },

    preIcoBonus: {
      type: 'string',
      defaultsTo: '60'
    },

    icoActive: {
      type: 'boolean',
      defaultsTo: false
    },

    icoType: {
      type: 'string',
      defaultsTo: 'pre'
    },

	onlineUsers: {
		type: 'string',
		defaultsTo: '0'
	},
    txnOpts: {
      type: 'json',
      defaultsTo: {}
    }

  },

  afterUpdate: function (record, cb) {
    if(!_.isArray(record))record = [record];
    if(record.length) sails.config.TFT = record[0];
    cb();
  }
};

