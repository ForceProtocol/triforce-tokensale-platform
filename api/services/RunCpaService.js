
const request = require('request');

module.exports = {


	signupCallback: function(trackId,whitelistEtherAddress){
	
		request(`http://runcpa.com/callbacks/event/s2s-partner/${sails.config.RUNCPA_API_KEY}/${trackId}/${whitelistEtherAddress}`, function (error, response, body) {
			if(typeof error != 'undefined' && error != null){
				sails.log.error("Failed to send callback to RunCPA: ",err);
			}
		});
	
		return;
	},
  
  
};