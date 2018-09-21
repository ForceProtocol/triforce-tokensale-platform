const coinbaseApi = require('coinbase-commerce-node'),
moment = require('moment'),
coinbaseClient = coinbaseApi.Client,
coinbaseCharge = coinbaseApi.resources.Charge,
getBtcPrice = require('btc-value'),
{getEthPriceNow,getEthPriceHistorical} = require('get-eth-price');


module.exports = {

  createCharge: async(userId,email,amount,currency,description,forceExBonus,forceBonus,totalCurrencyRequired) => {

    try{
      var clientObj = coinbaseClient.init(sails.config.COINBASE_COMMERCE_API_KEY);
      clientObj.setRequestTimeout(5000);

      var chargeObj = await new coinbaseCharge({
        name: "FORCE Tokens",
        description: description,
        metadata: {
          customer_id: userId,
          customer_email: email,
          forceExBonus: forceExBonus,
          forceBonus: forceBonus,
          totalCurrencyRequired:totalCurrencyRequired
        },
        pricing_type: "fixed_price",
        local_price: {
          amount: amount,
          currency: currency
        },
        redirect_url: sails.config.BASE_URL + "contributor/buy-force?completed=true"
      }).save();

      return chargeObj;
    }catch(err){
      sails.log.error("CoinbaseService.createCharge err: ",err);
      return false;
    }
  },


  btcToEth: async(btcAmount) => {
    let btcPrice = await getBtcPrice();
    let ethPrice = await getEthPriceNow();
    ethPrice = ethPrice[Object.keys(ethPrice)[0]].ETH.USD;
    let ethToBtc = btcPrice / ethPrice;

    return btcAmount * ethToBtc;
  },


};
