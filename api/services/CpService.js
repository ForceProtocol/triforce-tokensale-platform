let bigNumber = require('bignumber.js');
bigNumber.config({ EXPONENTIAL_AT: [-7, 2000] });
const Coinpayments = require('coinpayments');

let btcToUsd, usdToBtc, ethToBtc, ltcToBtc, wavesToBtc, ltctToBtc;

module.exports = {

  /**
   * Checks if the given string is an address
   *
   * @method isAddress
   * @param {String} address the given HEX adress
   * @return {Boolean}
   */
  isAddress : function (address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      // check if it has the basic requirements of an address
      sails.log.debug("return false 1");
      return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
      // If it's all small caps or all all caps, return true
      return true;
    }
    sails.log.debug("return false 2");
    return false;
  },

  isAddressOLD : function (address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      // check if it has the basic requirements of an address
      return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
      // If it's all small caps or all all caps, return true
      return true;
    } else {
      // Otherwise check each case
      return CpService.isChecksumAddress(address);
    }
  },

  /**
   * Checks if the given string is a checksummed address
   *
   * @method isChecksumAddress
   * @param {String} address the given HEX adress
   * @return {Boolean}
   */
  isChecksumAddress : function (address) {
    // Check each case
    // address = address.replace('0x','');
    // var addressHash = sha3(address.toLowerCase());
    // for (var i = 0; i < 40; i++ ) {
    //   // the nth letter should be uppercase if the nth digit of casemap is 1
    //   if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
    //     return false;
    //   }
    // }
    return true;
  },

  IPN: function (txn) {
    if (!_.isObject(txn))
      return;

    const processReq = async () => {
      const _crypto = await Crypto.findOne({
        address: txn.address
      });

      let myTxn = await Transaction.findOne({cpTxnId: txn.txn_id});
      if (myTxn && myTxn.cpStatus == 2)return myTxn;

      if (myTxn) {
        myTxn.cpStatus = txn.status;
        myTxn.cpStatusText = txn.status_text;
        myTxn.save();

        return myTxn;
      }

      const btcRate = await CpService.getBtcRateFor(_crypto.currency),
        usdRate = await CpService.coinToUSD(_crypto.currency, 1),
        toUSD = await  CpService.coinToUSD(_crypto.currency, txn.amount),
        TFTs = CpService.estimatedTFTs(toUSD);

      return await Transaction.create({
        cpTxnId: txn.txn_id,
        cpStatus: parseInt(txn.status),
        cpStatusText: txn.status_text,
        amount: txn.amount,
        amountf: txn.amounti,

        btcRate,
        usdRate,
        toUSD,
        tfts: TFTs.obtained,
        tftBonus: TFTs.bonus,

        txnType: txn.ipn_type,
        currency: txn.currency,
        crypto: _crypto.id,
        user: _crypto.user
      });
    };

    processReq()
      .then(() => {
			sails.log('transaction processed successfully');
      })
      .catch((err) => {
        sails.log.error('error while saving transaction : ',err);
      });
  },

  /**
   * get conversion rate for coin to BTC. e.g. ETH rate in BTC
   * @param coin
   * @returns {Promise.<string>}
   */
  getBtcRateFor: async (coin)=> {

    let converted = 0;
    switch (coin) {

      case 'BTC':
        return '1'; //ofcourse 1 btc is equal to 1 btc :)
        break;

      case 'ETH':
        if(_.isUndefined(ethToBtc)){
          const rec = await CryptoPrice.findOne({currency: 'ETH', select: ['rate_btc']});
          if(!rec) return 'na';

          ethToBtc = new bigNumber(rec.rate_btc);
        }
        return ethToBtc.toString();
        break;

      case 'LTC':
        if(_.isUndefined(ltcToBtc)){
          const rec = await CryptoPrice.findOne({currency: 'LTC', select: ['rate_btc']});
          if(!rec) return 'na';

          ltcToBtc = new bigNumber(rec.rate_btc);
        }

        return ltcToBtc.toString();
        break;

      case 'WAVES':
        if(_.isUndefined(wavesToBtc)){
          const rec = await CryptoPrice.findOne({currency: 'LTC', select: ['rate_btc']});
          if(!rec) return 'na';

          wavesToBtc = new bigNumber(rec.rate_btc);
        }

        return wavesToBtc.toString();
        break;

      case 'LTCT':
        if(_.isUndefined(ltctToBtc)){
          const rec = await CryptoPrice.findOne({currency: 'LTC', select: ['rate_btc']});
          if(!rec) return 'na';

          ltctToBtc = new bigNumber(rec.rate_btc);
        }

        return ltctToBtc.toString();
        break;

      default:
        return '0';
    }

    return converted;
  },

  coinToUSD: async (coin, amount)=> {
    if(!amount || isNaN(amount))return '0';

    if(_.isUndefined(btcToUsd)){
      const rec = await CryptoPrice.findOne({currency: 'USD', select: ['rate_btc']});
      if(!rec) return '';

      let one = new bigNumber(1);
      usdToBtc = rec.rate_btc;
      btcToUsd = one.dividedBy(new bigNumber(rec.rate_btc));
    }

    let converted = 0;
    switch (coin) {

      case 'BTC':

        converted = btcToUsd.times(amount).toString();

        break;

      case 'ETH':
        if(_.isUndefined(ethToBtc)){
          const rec = await CryptoPrice.findOne({currency: 'ETH', select: ['rate_btc']});
          if(!rec) return 'na';

          ethToBtc = new bigNumber(rec.rate_btc);
        }

        return ethToBtc.times(amount).times(btcToUsd).toString();
        break;

      case 'LTC':
        if(_.isUndefined(ltcToBtc)){
          const rec = await CryptoPrice.findOne({currency: 'LTC', select: ['rate_btc']});
          if(!rec) return 'na';

          ltcToBtc = new bigNumber(rec.rate_btc);
        }

        return ltcToBtc.times(amount).times(btcToUsd).toString();
        break;

      case 'WAVES':
        if(_.isUndefined(wavesToBtc)){
          const rec = await CryptoPrice.findOne({currency: 'WAVES', select: ['rate_btc']});
          if(!rec) return 'na';

          wavesToBtc = new bigNumber(rec.rate_btc);
        }

        return wavesToBtc.times(amount).times(btcToUsd).toString();
        break;

      case 'LTCT':
        if(_.isUndefined(ltctToBtc)){
          const rec = await CryptoPrice.findOne({currency: 'LTCT', select: ['rate_btc']});
          if(!rec) return 'na';

          ltctToBtc = new bigNumber(rec.rate_btc);
        }

        return ltctToBtc.times(amount).times(btcToUsd).toString();
        break;

    }

    return converted;

  },

  sumBigNumbers: (numbers)=>{
    if(!_.isArray(numbers))return 'na';

    let result = new bigNumber(0);
    numbers.forEach(_num=>{
      try {
        result = result.plus(_num);
      }catch(ex){

      }
    });

    return result.toString();
  },

  subtractBigNumbers: (num1, num2, noNegativeAllowed)=>{

    let result = new bigNumber(0);
    try {
      result = new bigNumber(num1);
      result = result.minus(num2);

      if(result.isNegative() && noNegativeAllowed)
        result = new bigNumber(0);
    } catch (ex) {

    }

    return result.toString();
  },

  estimatedTFTs: (usd)=>{
    const bonus = sails.config.TFT ? sails.config.TFT.preIcoBonus : 60,     // in percentage
      tokenPrice = sails.config.TFT ? sails.config.TFT.tftRate : 0.20;
    if(!sails.config.TFT)sails.log('using default values for bonus(60%) and tftRate(0.20)');
    let tft = {obtained:0, bonus:0, total: 0};
    try{
      usd = new bigNumber(usd);
      let obt = usd.dividedBy(tokenPrice),
      _bonus = obt.times(bonus).dividedBy(100);

      tft.obtained = obt.toString();
      tft.bonus = _bonus.toString();
      tft.total = obt.plus(_bonus).toString();
    }
    catch(ex){
      sails.log(ex);
    }

    return tft;
  },

  generateAddress: async (currency, userId) => {
    return false;
    let client = new Coinpayments(sails.config.COINPAYMENT_OPTS);
    let crypto = await Crypto.findOne({user: userId, currency})
      .populate('transactions');

    if (crypto && crypto.statusId !== Status.LIVE)
      throw new CustomError(`Address for ${currency} is not available anymore. Please contact support for help`);

    if (!crypto) {
      crypto = await Crypto.findOne({user: 0, currency});
      if (crypto) {

        crypto.user = userId;
        crypto.save();
      }
    }else{

      if(_.isArray(crypto.transactions) && crypto.transactions.length){
        crypto.allInUSD = CpService.sumBigNumbers(crypto.transactions.map(_crpt=>_crpt.toUSD));
      }

    }

    if (!crypto) {

      const cpAddr = await new Promise((resolve, reject) => {
        client.getCallbackAddress(currency, (err, data) => {
          if (err) return reject(err);
          resolve(data);
        })
      });
      crypto = await Crypto.create({user: userId, address: cpAddr.address, currency});
    }

    return crypto;
  },

  /**
   * provide number of tfts that you want and currency which u want to pay and it'll return how much currency needed for tfts
   * @param {object} opts
   * @param opts.tfts - how many tokens user want
   * @param opts.amount - how much currency he want to invest/convert to tft
   * @param opts.currency - ETH, WAVES, BTC, LTC
   * @returns {Promise.<object>}
   */
  tokenCalculator: async (opts)=> {

    let {tfts, currency, amount, userId} = opts;

    if(!tfts && !amount){
      throw new CustomError('Please provide valid data to calculate TFTs');
    }

    if (!_.isString(currency) || Transaction.allowedCurrencies.indexOf(currency.toUpperCase()) === -1)
      throw new CustomError('Invalid currency to process', {status: 400});

    let crypto = await CpService.generateAddress(currency, userId);

    // first check if amount available and calculate that otherwise based on tft
    if(!amount){

      tfts = tfts.replace(/,/g, '');
      try{
        tfts = new bigNumber(tfts);
      }
      catch(_er){
        throw new CustomError('Invalid value to process', {status: 400});
      }

      let coinInUSD = await CpService.coinToUSD(currency, 1);


      try{
        coinInUSD = new bigNumber(coinInUSD);
      }
      catch(_er){
        throw new CustomError('Invalid value to process', {status: 400});
      }


      let tftCost = tfts.times('0.20'),
        tftBonus = tfts.times(60).dividedBy(100);
      let coinsNeeded = tftCost.dividedBy(coinInUSD.toString());

      return {
        tfts: tfts.toString(),
        tftBonus: tftBonus.toString(),
        tftTotal: CpService.sumBigNumbers([tfts.toString(), tftBonus.toString()]),
        tftInUSD: tftCost.toString(),
        coinRate: coinInUSD.toString(),
        coinsNeeded,
        crypto,
        currency
      }
    }
    else {
      amount = amount.replace(/,/g, '');
      try{
        amount = new bigNumber(amount);
      }
      catch(_er){
        throw new CustomError('Invalid value to process', {status: 400});
      }

      let coinInUSD = await CpService.coinToUSD(currency, amount.toString());
      let coinRate = await CpService.coinToUSD(currency, 1);

      let estimatedTFTs = CpService.estimatedTFTs(coinInUSD);

      return {
        tfts: estimatedTFTs.obtained,
        tftBonus: estimatedTFTs.bonus,
        tftTotal: estimatedTFTs.total,
        tftInUSD: coinInUSD.toString(),
        coinRate: coinRate.toString(),
        coinsNeeded: amount.toString(),
        currency,
        crypto
      }
    }
  },

  getUserTransactions: async function (userId) {

    let txns = await Transaction.find({user: userId, statusId: Status.LIVE})
      .populate('crypto', {where: {status: Status.LIVE}, sort: 'createdAt DESC'});


    let totalUSD = CpService.sumBigNumbers(txns.map(_txn=>_txn.toUSD));
    let estimatedTFTs = {
      obtained: CpService.sumBigNumbers(txns.map(_txn=>_txn.tfts)),
      bonus: CpService.sumBigNumbers(txns.map(_txn=>_txn.tftBonus))
    };
    estimatedTFTs.total = CpService.sumBigNumbers([estimatedTFTs.obtained, estimatedTFTs.bonus]);

    return {
      allInUSD: totalUSD,
      transactions: txns,
      estimatedTFTs
    };

  }
};
