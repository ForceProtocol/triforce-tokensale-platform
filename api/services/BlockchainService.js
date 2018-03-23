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
/*

    const FilterSubprovider = require(BlockchainService.getBasePath() + '/node_modules/web3-provider-engine/subproviders/filters.js');
    const ZeroClientProvider = require(BlockchainService.getBasePath() + '/node_modules/web3-provider-engine/zero.js');

    let engine = new ZeroClientProvider({
      rpcUrl: conf.url,
      signTransaction: (rawTx, cb) => {sails.log('signing: ',rawTx);return cb(null, ethSigner.sign(rawTx, conf.privateKey))},
      getAccounts: (cb) => cb(null, [conf.account]),
    });
    let web3 = new Web3(engine);


    web3.eth.defaultAccount = conf.account;

    engine.addProvider(new FilterSubprovider());

    sails.contract = {web3};


// network connectivity error
    engine.on('error', function(err){
      // report connectivity errors
      console.error(err.stack)
    });
  */


    return web3;
  },

  contracts: contracts,

  getProvider: function () {
    return new Web3.providers.HttpProvider(sails.config.blockchain.connection.ws);
  },

  initCrowdsaleContract: async () => {
    if(_.isObject(sails.contract) && sails.contract.crowdsaleContract) return sails.contract.crowdsaleContract;

    const self = BlockchainService;
    let web3 = await self.connect();
    sails.log('connected to web3');
    let CrowdsaleObj = JSON.parse(fs.readFileSync(self.getBasePath() + '/contracts/TriForceNetworkCrowdsale.json', 'utf8'));
    sails.log('got json');

    let contract =  new web3.eth.Contract(CrowdsaleObj.abi, '0x8b2043FCe78bF09A87b9a149EE3DDcc1fA5D408D');

    contract.events.TokenPurchase((err, event)=> {
      sails.log('TokenPurchase event triggered');
      if(err || !event) {
        sails.log.error(new Date(), err || 'No data received for eventPurchase event');
        return;
      }

      sails.log.info('hurray!! someone purchased our token', event);
      self.saveTransaction(event).catch(sails.log.error);
    });
/*
    contract.events.allEvents( function(error, event){ error && sails.log.error('all events error: ', error);sails.log('event', event); })
      .on('data', function(event){
        sails.log('received event data', event); // same results as the optional callback above
      })
      .on('changed', function(event){
        sails.log('event changed', event);
        // remove event from local database
      })
      .on('error', sails.log.error);*/

    contract.getPastEvents('allEvents', function(error, event){ error && sails.log.error('event error:', error);sails.log('event', event); });

    sails.contract.crowdsaleContract = contract;

    return contract;
  },

  getContractSummary: async function () {
    const self = BlockchainService;

    let crowdsale = await self.initCrowdsaleContract();

    return await sails.bluebird.props({
      rate:  crowdsale.methods.rate().call(),
      startTime:  new Promise((resolve, reject)=> {
          crowdsale.methods.startTime().call(function (er,supply) {
            if(er) return reject(er);
            resolve(supply);
          });
        }),
      endTime:  new Promise((resolve, reject)=> {
        crowdsale.methods.endTime().call(function (er,supply) {
          if(er) return reject(er);
          resolve(supply);
        });
      }),
      goal: new Promise((resolve, reject)=> {
        crowdsale.methods.goal().call(function (er,supply) {
          if(er) return reject(er);
          resolve(supply);
        });
      }),
      weiRaised: new Promise((resolve, reject)=> {
        crowdsale.methods.weiRaised().call(function (er,supply) {
          if(er) return reject(er);
          resolve(supply);
        });
      })
    });
  },

  getBasePath: function () {
    let path = require('path');
    let arr = __dirname.split(path.sep);
    arr.pop(); //go back one directory
    arr.pop(); //go back one directory
    return path.normalize(arr.join('/'));
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
