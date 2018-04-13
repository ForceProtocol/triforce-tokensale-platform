/**
 * CryptoPrice.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: {
      type: 'string'
    },

    currency: {
      type: 'string'
    },

    rate_btc: {
      type: 'string'
    },

    is_fiat: {
      type: 'boolean'
    },

    rateAt: {
      type: 'datetime'
    }
  }
};

