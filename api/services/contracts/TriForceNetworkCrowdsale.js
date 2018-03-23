const contractName = 'TriForceNetworkCrowdsale',
  bigNumber = require('bignumber.js'),
  moment = require('moment'),
  fs = require('fs');
bigNumber.config({ EXPONENTIAL_AT: [-7, 2000] });

module.exports = {

  init: async function(opts) {
    let self = this;
    if(!opts) opts = {};
    sails.log.verbose(`initializing ${contractName} contract`);

    opts = _.defaults(opts, {
      monitorEvents: true,
      forceInit: false
    });

    if(!opts.forceInit && _.isObject(sails.contract) && sails.contract[contractName])
      return sails.contract[contractName];

    let web3 = await BlockchainService.connect();
    sails.log.verbose('connected to web3');

    let CrowdsaleObj = JSON.parse(fs.readFileSync(`${sails.getBasePath()}/contracts/${contractName}.json`, 'utf8'));

    let contract = web3.eth.contract(CrowdsaleObj.abi);
    let contractInstance = contract.at(sails.config.blockchain.contracts[contractName]);  
    if(opts.monitorEvents)
      self.registerEvents(contractInstance);

    return contractInstance;
  },

  processOldEvents: async function (contract) {
    sails.log.verbose('checking past events for' + contractName);

    let launchTime = moment(sails.config.blockchain.icoLaunch);
    let closingTime = moment(sails.config.blockchain.icoClose);
    if(!moment().isBetween(launchTime, closingTime)){
      sails.log.verbose('ico not launched yet. cancelling events processing');
      return;
    }

    const self = this;
    let web3 = await BlockchainService.connect();

    if(!contract)
      contract = await self.init();

    let opt = await Triforce.findOne({id:1, select: ['txnOpts']});
    let processedBlock = 0,
      toBlock = processedBlock + 50;
    try {
      if(!_.isObject(opt.txnOpts))
        opt.txnOpts = {};


      processedBlock = opt.txnOpts.processedBlock;
      if(!processedBlock) processedBlock = 0;
    }
    catch (e){
      await Triforce.update({id: 1},{txnOpts: {processedBlock: 0}});
    }

    sails.log.verbose('processed block: ', processedBlock);
    toBlock = _.parseInt(processedBlock) + 50;
    const latestBlock = await web3.eth.getBlock('latest');
    if(toBlock > latestBlock.number){
      toBlock = parseInt(latestBlock.number);
    }

    const events = await contract.getPastEvents('TokenPurchase',{
      fromBlock: processedBlock,
      toBlock: processedBlock+50  // processing 50 blocks at a time
    });

    if(_.isArray(events) && events.length){
      for(let ev of events) {
        sails.log(ev.transactionHash);
        await BlockchainService.saveTransaction(ev);
      }
    }

    opt.txnOpts.processedBlock = toBlock;
    await Triforce.update({id: 1},{txnOpts: opt.txnOpts});

  },

  registerEvents : function(contract) {
    sails.log.verbose('monitoring events for ' + contractName);

    contract.OwnershipTransferred(null, null, (err, event)=> {
      sails.log('IMPORTANT:: OwnershipTransferred event triggered');

      EmailService.sendEmail({
        fromEmail: 'support',
        fromName: 'Support',
        toEmail: sails.config.contacts.team,
        toName: `FORCE Team`,
        subject: 'IMPORTANT:: Ownership transfer event',
        body:
          `Someone just transferred ownership of contract. Event captured for ${contractName}. Please make sure its some one from our team.<br>
          EVENT DATA: <pre>${JSON.stringify(event)}</pre>`
      });
      if (err || !event) {
        sails.log.error(new Date(), err || 'No data received for OwnershipTransferred event');
      }

    });

    /*let processingTxn = null;
    contract.events.TokenPurchase((err, event)=> {
      sails.log('TokenPurchase event triggered');
      if(err || !event) {
        sails.log.error(new Date(), err || 'No data received for eventPurchase event');
        return;
      }

      processingTxn !== event.transactionHash &&
      BlockchainService.saveTransaction(event)
        .then(_txn=>{sails.log('transaction:', _txn);processingTxn=null;})
        .catch((err)=>{
          sails.log.error(err);
          processingTxn=null;
        });
      processingTxn=event.transactionHash;
    })*/
  },

  getContractSummary: async function () {
    const self = this,
    web3 = await BlockchainService.connect(),
    BN = require('bn.js');

    let crowdsale = await self.init();
      bonusPercent = CpService.subtractBigNumbers(await self.getCurrentBonusFactor(), 100, true),
      weiRaised = await crowdsale.weiRaised(),
      ethRaised = web3.fromWei(new BN(weiRaised)).toString(),
      goal = await crowdsale.goal(),
      goalEth = web3.fromWei(new BN(goal)).toString(),
      forceDistributedWei = await crowdsale.totalSupply(), //TODO:: verify if totalSupply is actually force distributed
      forceDistributed = web3.fromWei(new BN(forceDistributedWei)).toString();

    forceDistributed = new bigNumber(forceDistributed).add('2262381.4402954476').toString();

    let usdRaised = 'na';// await CpService.coinToUSD('ETH', ethRaised);
      usdRaised = usdRaised.toString();

    const queryPromise = sails.bluebird.promisify(IcoTransaction.query);
    let totalContributors = await queryPromise('SELECT count( DISTINCT(beneficiary) ) as totalContributors FROM ico_transactions');
    totalContributors = totalContributors[0].totalContributors;

    totalContributors = parseInt(totalContributors) + 131;

    return await sails.bluebird.props({
      rate:  crowdsale.rate(),
      startTime:  crowdsale.startTime(),
      endTime:  crowdsale.endTime(),
      goal,
      goalEth,
      weiRaised,
      ethRaised,
      usdRaised,
      forceDistributedWei,
      forceDistributed,
      bonusFactor: self.getCurrentBonusFactor(),
      bonusPercent,
      totalContributors,

      icoAddress: sails.config.blockchain.contracts.TriForceNetworkCrowdsale
    });
  },

  getCurrentBonusFactor: async function() {
    let contract = await this.init();
    return await contract.bonusFactor();
  }

};
