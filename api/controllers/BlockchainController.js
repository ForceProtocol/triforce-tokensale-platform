
module.exports = {


  //region WhiteListing: add/remove/check

  addWhiteListed: (req, res)=> {
    const addr = req.param('address');
    if(!addr || !_.isString(addr) || !addr.length)
      return res.badRequest('Please provide a valid ETH address to proceed');

    BlockchainService.contracts.WhiteList.addWhiteListed(addr)
      .then(res.ok)
      .catch(err=> rUtil.errorResponse(err, res));
  },
  removeWhiteListed: (req, res)=> {
    const addr = req.param('address');
    if(!addr || !_.isString(addr) || !addr.length)
      return res.badRequest('Please provide a valid ETH address to proceed');

    BlockchainService.contracts.WhiteList.removeWhiteListed(addr)
      .then(res.ok)
      .catch(err=> rUtil.errorResponse(err, res));
  },
  isWhiteListed: (req, res)=> {
    let addr = req.param('address');

    const processReq = async ()=>{
        if(!addr){
          sails.log.debug("checking whitelist bs");
          const user = await User.findOne({id: req.token.user.id, select:['whitelistEthAddress']});
          if(_.isObject(user) && user.whitelistEthAddress)
            addr = user.whitelistEthAddress;
        }
        if(!addr || !_.isString(addr) || !addr.length)return false;
          //throw new CustomError('Please provide a valid ETH address to proceed',{status: 400});

      return await BlockchainService.contracts.WhiteList.isWhiteListed(addr);

    }

    processReq()
      .then(res.ok)
      .catch(err=> res.ok(false));
  },

  //endregion

  getIcoSummary: (req, res)=> {
    BlockchainService.contracts.TriForceNetworkCrowdsale.getContractSummary()
      .then(res.ok)
      .catch(err=> rUtil.errorResponse(err, res));
  },

  getUserTransactions: (req, res)=> {

    const processReq = async ()=> {
      const web3 = await BlockchainService.connect(),
        BN = require('bn.js');
      // let r1txns = CpService.getUserTransactions(req.token.user.id);

      const user = await User.findOne({id: req.token.user.id, select: ['whitelistEthAddress', 'id']});

      // if(!user || !user.etherAddress)
      //   throw new CustomError('Could not find any ETH address associated to your account', {status: 400});

      let txns_r1rec = await Transaction.find({statusId: Status.LIVE, limit: 1000, user: user.id, sort: 'createdAt DESC'});

      let txns = !user || !user.whitelistEthAddress ? [] : await IcoTransaction.find({
        where: {beneficiary: user.whitelistEthAddress},
        sort: 'createdAt DESC',
        limit: 1000
      });
      
      let estimatedTFTs = web3.fromWei(new BN(CpService.sumBigNumbers(txns.map(_txn=>_txn.forceEarned)))).toString();
      let r1estTFTs = CpService.sumBigNumbers(txns_r1rec.map(_txn=>_txn.forceEarned));

      let totalTFTs = _.clone(estimatedTFTs);


      let r1txns = {
        transactions: txns_r1rec,
        estimatedTFTs: r1estTFTs
      };

      let r2txns = {
        transactions: txns,
        estimatedTFTs
      };

      if(_.isObject(r1txns) && r1txns.estimatedTFTs){
        if(_.isString(estimatedTFTs) && estimatedTFTs.length < 2){
          estimatedTFTs = parseInt(estimatedTFTs);
        }


        if(!estimatedTFTs)
          totalTFTs = _.clone(r1estTFTs);
        else
          totalTFTs = CpService.sumBigNumbers([r1estTFTs, estimatedTFTs]);
      }
      return {r1txns, r2txns, totalTFTs};
    };

    processReq()
      .then(res.ok)
      .catch(err=> rUtil.errorResponse(err, res));
  }
};
