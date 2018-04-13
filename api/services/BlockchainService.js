const Web3 = require('web3'),
  bigNumber = require('bignumber.js'),
  fs = require('fs'),
  ethSigner = require('ethjs-signer');

const conf = sails.config.blockchain;

const contracts = require('./contracts');

module.exports = {

  /**
   * connects to blockchain and returns web3 instance
   * @returns {Promise<Web3>}
   */
  connect: async () => {
    if(_.isObject(sails.contract) && sails.contract.web3) return sails.contract.web3;

    let web3 = new Web3(BlockchainService.getProvider());
    sails.contract = {web3};

    return web3;
  },

  contracts: contracts,

  getProvider: function () {
    return new Web3.providers.HttpProvider(sails.config.blockchain.connection.ws);
  },

  saveTransaction: async (purchaseEvent)=> {
    // sails.log('saving txn from hash: ', purchaseEvent.transactionHash);
    const user = await User.findOne({whitelistEthAddress: purchaseEvent.beneficiary, select: ['id']});

    let forceBonus = await BlockchainService.calculateForceBonus(purchaseEvent.returnValues.amount);

    const existingTxn = await IcoTransaction.count({
      transactionHash: purchaseEvent.transactionHash
    });

    if(existingTxn)return existingTxn;

    return await IcoTransaction.create ({
      purchaser: purchaseEvent.returnValues.purchased,
      beneficiary: purchaseEvent.returnValues.beneficiary,
      weiContribution: purchaseEvent.returnValues.value,
      forceEarned: purchaseEvent.returnValues.amount,
      forceBonus,
      blockNumber: purchaseEvent.blockNumber,
      transactionHash: purchaseEvent.transactionHash,
      statusId: Status.LIVE,
      logId: purchaseEvent.id,
      user: user ? user.id : null
    });

  },

  /**
   * this method takes total force tokens issued, checks the current bonus factor and calculates how much bonus is given for this txn
   * @param totalTokensWithBonus
   * @returns {Promise<string>} - returns bonus tokens given with this txn
   */
  calculateForceBonus: async (totalTokensWithBonus)=>{
    try {
      let bonusFactor = await BlockchainService.contracts.TriForceNetworkCrowdsale.getCurrentBonusFactor();

      if (bonusFactor) bonusFactor = _.parseInt(bonusFactor);
      if (_.isNaN(bonusFactor)) return 0;

      totalTokensWithBonus = new bigNumber(totalTokensWithBonus);
      let bought = (totalTokensWithBonus.div(bonusFactor)).mul(100);

      return CpService.subtractBigNumbers(totalTokensWithBonus, bought, true);
    }
    catch(ex){
      return '0';
    }
  }

};
