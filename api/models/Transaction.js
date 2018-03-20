/**
 * Transaction.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const allowedCurrencies = ['BTC', 'ETH', 'WAVES', 'LTC', 'LTCT'];

module.exports = {

  tableName: 'transactions',

  allowedCurrencies: allowedCurrencies,

  attributes: {

    cpTxnId: {
      type: 'string'
    },

    amount: {
      type: 'string'
    },

    amountf: {
      type: 'string'
    },

    btcRate: {
      type: 'string'
    },

    usdRate: {
      type: 'string'
    },

    toUSD: {
      type: 'string'
    },

    tfts: {
      type: 'string'
    },

    tftBonus: {
      type: 'string'
    },

    cpStatus: {
      type: 'integer'
    },

    cpStatusText: {
      type: 'string'
    },

    txnType: {
      type: 'string'
    },

    currency: {
      type: 'string',
      'enum': allowedCurrencies
    },

    inEth: {
      type: 'string'
    },

    forceEarned: {
      type: 'string'
    },

    forceBonus: {
      type: 'string'
    },

    statusId: {
      type: 'INTEGER',
      defaultsTo: 2
    },

    user: {
      columnName: 'userId',
      model: 'user'
    },

    crypto: {
      columnName: 'cryptoId',
      model: 'crypto'
    },

    toJSON: function () {
      var obj = this.toObject();
      if('tfts' in obj)
        obj.tftTotal = CpService.sumBigNumbers([obj.tfts, obj.tftBonus]);
      return obj;
    }
  },

  afterCreate: function (record, cb) {
    Triforce.findOne(1)
      .then(_tft=>{
        _tft.totalPurchased = CpService.sumBigNumbers([_tft.totalPurchased, record.tfts, record.tftBonus]);
        _tft.totalUsdRaised = CpService.sumBigNumbers([_tft.totalUsdRaised, record.toUSD]);
        _tft.save();
		sails.sockets.blast('totalContributors', { totalContributors: 1 });
		sails.sockets.blast('totalRaisedUsd', { totalRaisedUsd: _tft.totalUsdRaised });
		sails.sockets.blast('supplyUsed', { supplyUsed: _tft.totalPurchased });
        cb();
      })
      .catch(()=>cb());
  }
};

