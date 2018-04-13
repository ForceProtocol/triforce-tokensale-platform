/**
 * CryptoController
 *
 * @description :: Server-side logic for managing cryptoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const Coinpayments = require('coinpayments');

module.exports = {

  convert: function (req, res) {
    CpService.coinToUSD('LTC', 10)
      .then(converted=> res.ok({in_usd: converted})).catch(err=>rUtil.errorResponse(err, res));
  },

  getCrypto: function (req, res) {

    const currency = req.param('currency');

    if (Transaction.allowedCurrencies.indexOf(currency.toUpperCase()) === -1)
      return res.badRequest('Invalid currency');

    CpService.generateAddress(currency, req.token.user.id)
      .then(res.ok)
      .catch(err => rUtil.errorResponse(err, res));

  },

  getUserCryptos: function (req, res) {

    Crypto.find({user: req.token.user.id, statusId: Status.LIVE})
      .populate('transactions')
      .then(res.ok)
      .catch(err => rUtil.errorResponse(err, res));
  },

  getUserTransactions: function (req, res) {

    CpService.getUserTransactions(req.token.user.id)
      .then(res.ok)
      .catch(err => rUtil.errorResponse(err, res))


  },


  getCpBalance: function (req, res) {
    return false;
    let client = new Coinpayments(sails.config.COINPAYMENT_OPTS);

    client.balances((err, result) => {
      if (err) return rUtil.errorResponse(err, res);

      const processReq = async ()=>{
        let totalUSD = [];
        for(let currency in result){
          if (!result.hasOwnProperty(currency)) continue;
          result[currency].inUSD = await CpService.coinToUSD(currency, result[currency].balancef);
          totalUSD.push(result[currency].inUSD);
        }

        let _tft = sails.config.TFT;
        if(!_tft){
          _tft = await Triforce.findOne(1);
          sails.config.TFT = _tft;
        }
        let supplyRemaining = CpService.subtractBigNumbers(_tft.preIcoSupply, _tft.totalPurchased, true);

        return {
          allInUSD_CR :  CpService.sumBigNumbers(totalUSD), // current market rate
          allInUSD: _tft.totalUsdRaised,
          totalPurchased: _tft.totalPurchased,
          preIcoSupply: _tft.preIcoSupply,
          supplyRemaining,
          balances: result
        }

      };

      processReq()
        .then(res.ok)
        .catch(err => rUtil.errorResponse(err, res))

    })
  },

  tftCalculator: function (req, res) {
    CpService.tokenCalculator({userId: req.token.user.id, tfts: req.param('tft') , currency: req.param('currency'), amount: req.param('currencyAmount')})
      .then(res.ok)
      .catch(err=> rUtil.errorResponse(err,res));
  }
};

