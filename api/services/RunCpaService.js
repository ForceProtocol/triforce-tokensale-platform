
const request = require('request');

module.exports = {


	signupCallback: function(trackId,whitelistEtherAddress){
	
		request('http://runcpa.com/callbacks/event/s2s-partner/KsukkSrO3yL5-Dm5Kl0NqA16MJ58V4A9/cpl44516/' + trackId + '/' + whitelistEtherAddress, function (error, response, body) {
			if(typeof error != 'undefined' && error != null){
				sails.log.error("Failed to send callback to RunCPA: ",err);
			}
		});
	
		return;
	},
  
  
};