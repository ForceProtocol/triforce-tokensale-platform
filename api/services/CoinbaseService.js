const coinbaseApi = require('coinbase-commerce-node'),
moment = require('moment'),
coinbaseClient = coinbaseApi.Client,
coinbaseCharge = coinbaseApi.resources.Charge;


module.exports = {

  createCharge: async(userId,email,amount,currency,description) => {

    try{
      var clientObj = coinbaseClient.init(sails.config.COINBASE_COMMERCE_API_KEY);
      clientObj.setRequestTimeout(5000);

      var chargeObj = await new coinbaseCharge({
        name: "FORCE Tokens",
        description: description,
        metadata: {
          customer_id: userId,
          customer_email: email
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


};
