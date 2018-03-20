const contractName = 'WhiteList',
  fs = require('fs');

module.exports = {

  init: async function (opts) {
    let self = this;
    if (!opts) opts = {};
    sails.log.verbose(`initializing ${contractName} contract`);

    opts = _.defaults(opts, {
      monitorEvents: true,
      forceInit: false
    });

    if (!opts.forceInit && _.isObject(sails.contract) && sails.contract[contractName])
      return sails.contract[contractName];

    let web3 = await BlockchainService.connect();
    sails.log.verbose('connected to web3');

    let CrowdsaleObj = JSON.parse(fs.readFileSync(`${sails.getBasePath()}/contracts/${contractName}.json`, 'utf8'));

    let contract = web3.eth.contract(CrowdsaleObj.abi);
    let contractInstance = contract.at(sails.config.blockchain.contracts[contractName]);

    if (opts.monitorEvents)
      self.registerEvents(contractInstance);

    return contractInstance;
  },

  registerEvents: function (contract) {
    let ownerShipTransferred = contract.OwnershipTransferred(null, null, (err, event) => {
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
  },

  isWhiteListed: async function (addr) {
    sails.log.verbose('isWhiteListed called with param: ', addr);
    const contract = await this.init();
    sails.log.verbose('checking if address is whitelisted', addr);
    return await new Promise((resolve, reject) => {
      contract.isWhiteListed(addr, function(er, rsp) {
        if (rsp) {
          sails.log.verbose('whitelist check result: ', rsp);
          resolve(rsp);
        }
        if (er) {
          sails.log.verbose('error while doing whitelist check: ', er);
          resolve(false);
        }
      })
    });

  },

  addWhiteListed: async function (addr) {
    // return false;
    sails.log.info('addWhiteListed called with param: ', addr);
    if(!_.isString(addr))return false;
    addr = addr.trim();
    if(!addr.length) return false;
    const alreadyListed = await this.isWhiteListed(addr);
    if(alreadyListed){
      sails.log.info('already in whitelist: ', addr);
      return true;
    }
    else {
      sails.log.info('not whitelisted, adding now: ', addr);
    }

    // sign the transaction first
    const contract = await this.init(),
      web3 = sails.contract.web3,
      transfer = contract.addWhiteListed(addr),
      encodedABI = transfer.encodeABI();


    let Tx = require('ethereumjs-tx');
    let privateKey = new Buffer(sails.config.blockchain.privateKey, 'hex');

    let nonce = await web3.eth.getTransactionCount(sails.config.blockchain.owner, 'pending');

    // let gasPrice = await web3.eth.getGasPrice();
    //
    //
    // let estimatedGas = await web3.eth.estimateGas({
    //   // from: sails.config.blockchain.owner,
    //   to: contract.options.address,
    //   data: encodedABI
    // });

    let estimatedGas = '300000';
    let gasPrice = '3000000000';

    nonce = web3.toHex(nonce);

    let rawTx = {
      nonce: nonce,
      gasPrice: web3.toHex(gasPrice),
      gasLimit: web3.toHex(estimatedGas),
      to: contract.options.address,
      value: '0x00',
      data: encodedABI,
      from: sails.config.blockchain.owner
    };

    let tx = new Tx(rawTx);
    tx.sign(privateKey);

    let serializedTx = tx.serialize();

    //done signing. now send
    return await new Promise((resolve, reject) => {
      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, txnHash) {
        if(err) {
          sails.log.error('error while adding whitelist address: ', err);
          return reject(err);
        }
        sails.log.info('successfully sent txn to whitelist. tx hash is : ', txnHash);
        return resolve(txnHash);
      });
    });
  },

  removeWhiteListed: async function(addr) {

    if(!addr) return false;

    const isListed = await this.isWhiteListed(addr);
    if(!isListed)return true; // if not listed then returning true so that requester knows address is not listed

    // sign the transaction first
    const contract = await this.init(),
      web3 = sails.contract.web3,
      transfer = contract.removeWhiteListed(addr),
      encodedABI = transfer.encodeABI();


    let Tx = require('ethereumjs-tx');
    let privateKey = new Buffer(sails.config.blockchain.privateKey, 'hex');

    let nonce = await web3.eth.getTransactionCount(addr);
    let rawTx = {
      nonce: nonce+1,
      gasPrice: '0x09184e72a000',
      gasLimit: '0x21000',
      // to: sails.config.blockchain.contracts.WhiteList,
      data: encodedABI
    };

    var tx = new Tx(rawTx);
    tx.sign(privateKey);

    var serializedTx = tx.serialize();

    //done signing. now send
    return await new Promise((resolve, reject) => {
      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .then((txn) => {
          txn.on('receipt', console.log)
            .on('transactionHash', hash => {
              resolve(true);
              console.log('hash');
              console.log(hash);
            }) 
            .on('confirmation', (confirmationNumber, receipt) => {
              console.log('confirmation: ' + confirmationNumber);
              resolve(true);
            })
            .on('error', function (error) {
              sails.log.error(error);
              reject(err);
            });
        })
        .catch(err => {
          sails.log.error(err);
          reject(err);
        })
    });
  }
};
