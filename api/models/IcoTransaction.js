/**
 * IcoTransaction.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
 const bigNumber = require('bignumber.js');

module.exports = {
  tableName: 'ico_transactions',
  attributes: {

    purchaser: {
      type: 'string'  // eth address
    },
    beneficiary: {
      type: 'string'  // eth address
    },
    weiContribution: {
      type: 'string'  // big number
    },
    // this is total force including bonus
    forceEarned: {
      type: 'string'  // big number
    },
    // total bonus given for this transaction
    forceBonus: {
      type: 'string'
    },
    blockNumber: {
      type: 'integer'  // blockchain block number
    },

    transactionHash: {
      type: 'string',
      unique: true
    },

    statusId: {
      type: 'integer',
      defaultsTo: 1
    },

    logId: {  // event log id
      type: 'string'
    },

    user: {
      columnName: 'userId',
      model: 'user'
    },

    toJSON: function () {
      let obj = this.toObject();
      let web3 = sails.contract.web3,
        BN = require('bn.js');

      if('forceEarned' in obj && 'forceBonus' in obj){
        obj.forceBought = CpService.subtractBigNumbers(obj.forceEarned, obj.forceBonus, true);
        obj.forceBoughtFrmtd = web3.fromWei(new BN(obj.forceBought)).toString();
      }
      if('forceEarned' in obj){
        obj.forceEarnedFrmtd = web3.fromWei(new BN(obj.forceEarned)).toString();
      }

      if('weiContribution' in obj){
        obj.ethContribution = web3.fromWei(new BN(obj.weiContribution)).toString();
      }


      return obj;
    }
  },

  afterCreate: async (record, cb) => {
    try{
      let forceEarned = new bigNumber(record.forceEarned);
      let forceBonus = new bigNumber(record.forceBonus);
      let totalForce = forceEarned.plus(forceBonus).dividedBy('1000000000000000000').toString();
      let summary = {transactionHash:record.transactionHash,totalForce:totalForce,logId:record.logId};
      sails.sockets.blast('ico/summary', summary);
      cb();
    }catch(err){
      sails.log.debug("IcoTransaction.afterCreate err: ",err);
      cb();
    }
  }

};

