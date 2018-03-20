/**
 * IcoTransaction.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

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
        obj.forceBoughtFrmtd = web3.utils.fromWei(new BN(obj.forceBought)).toString();
      }
      if('forceEarned' in obj){
        obj.forceEarnedFrmtd = web3.utils.fromWei(new BN(obj.forceEarned)).toString();
      }

      if('weiContribution' in obj){
        obj.ethContribution = web3.utils.fromWei(new BN(obj.weiContribution)).toString();
      }


      return obj;
    }
  },

  afterCreate: function (record, cb) {
    const processReq = async ()=> {
      const summary = await BlockchainService.contracts.TriForceNetworkCrowdsale.getContractSummary();
      sails.sockets.blast('ico/summary', summary);
      sails.log('summary sent on socket', summary);

      let user = await User.findOne({whitelistEthAddress: record.beneficiary, select: ['id', 'socketId']});
      if(!user || !user.socketId) return;

      const socketId = user.socketId;
      if (_.includes(sails.sockets.rooms(), socketId)){
        sails.sockets.broadcast(socketId, 'ico/user/txn', record);
      }
    };

    processReq()
      .then(()=> cb())
      .catch(err=> cb());
  }
};

