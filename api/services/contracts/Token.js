const contractName = 'Token',
  fs = require('fs');

module.exports = {

  init: async function (opts) {
    let self = this;

    if (!opts){
      opts = {};
    }

    sails.log.verbose(`initializing ${contractName} contract`);

    opts = _.defaults(opts, {
      monitorEvents: true,
      forceInit: false
    });

    if (!opts.forceInit && _.isObject(sails.contract) && sails.contract[contractName]){
      sails.log.debug("returning contract from config");
      return sails.contract[contractName];
    }

    let web3 = await BlockchainService.connect();
    sails.log.verbose('connected to web3');

    let CrowdsaleObj = JSON.parse(fs.readFileSync(`${sails.getBasePath()}/contracts/${contractName}.json`, 'utf8'));

    let contract = web3.eth.contract(CrowdsaleObj.abi);
    let contractInstance = contract.at(sails.config.blockchain.contracts[contractName]);

    if (opts.monitorEvents){
      //self.registerEvents(contractInstance);
    }

    return contractInstance;
  },


  /**
  * Contract function to mint new FORCE and distributed to designated wallet address
  */
  mintTokens: async function (whitelistEthAddress,forceWei) {

    sails.log.info('BlockchainService.sendForceTokens called: ', whitelistEthAddress,forceWei);

    if (!_.isString(whitelistEthAddress)){
      return false;
    }

    whitelistEthAddress = whitelistEthAddress.trim();

    if (!whitelistEthAddress.length){
      return false;
    }

    // Make sure this whitelisted eth address exists
    let whitelistedUser = await User.findOne({whitelistEthAddress:whitelistEthAddress,statusId:Status.ACTIVE});

    // Invalid user account - do not mint tokens to user
    if(!whitelistedUser || (whitelistedUser.approvalStatus != "CLEARED" && whitelistedUser.approvalStatus != "APPROVED")){
      sails.log.debug("mintTokens whitelistedUser does not exist or not approved");
      return false;
    }

    // Make sure user has transactions pending to be paid
    let pendingTransactions = await IcoTransaction.findOne({beneficiary:whitelistEthAddress,statusId:1});

    if(!pendingTransactions){
      sails.log.error("mintTokens pendingTransactions none: user should not be getting any force but mintTokens was called.");
      return false;
    }
    
    // sign the transaction first
    const contract = await this.init();
    const web3 = sails.contract.web3;
    const functionByteCode = contract.mint.getData(whitelistEthAddress,forceWei);

    sails.log.debug("functionByteCode: ",functionByteCode);
   
    let Tx = require('ethereumjs-tx');
    let privateKey = new Buffer(sails.config.blockchain.privateKey, 'hex');
    let nonce = await web3.eth.getTransactionCount(sails.config.blockchain.owner, 'pending');
    let estimatedGas = '300000';
    let gasPrice = '3000000000';

    nonce = web3.toHex(nonce);

    let rawTx = {
      nonce: nonce,
      gasPrice: web3.toHex(gasPrice),
      gasLimit: web3.toHex(estimatedGas),
      to: contract.address,
      value: '0x00',
      data: functionByteCode,
      from: sails.config.blockchain.owner
    };

    sails.log.debug("rawTx: ",rawTx);

    let tx = new Tx(rawTx);
    tx.sign(privateKey);

    let serializedTx = tx.serialize();

    sails.log.debug("serializedTx: ",serializedTx);

    return false;

    //done signing. now send
    return await new Promise((resolve, reject) => {
      web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function (err, txnHash) {
        if (err) {
          sails.log.error('error while minting force tokens: ', err);
          return reject(err);
        }
        sails.log.info('successfully minted new force tokens : ', txnHash);
        return resolve(txnHash);
      });
    });
  },


};
