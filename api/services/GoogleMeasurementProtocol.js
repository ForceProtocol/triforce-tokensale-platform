/**
 * Google Measurement Protocol
 *
 * @description :: Server-side logic for managing Pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

const request = require('request-promise');

module.exports = {

	/**
	* Send request for WinWin GTM tracking once a payment is received
	*/
	recordEthPayment: async function (userId,cid,ethValue) {
		
		try{
			let kycRsp = await request({
				uri: 'https://www.google-analytics.com/collect',
				method: 'GET',
				headers: {},
				qs: {
					v:'1',
					t:'transaction',
					tid: 'UA-104636616-1',
					uid: userId,
					cid: cid,
					ti: '1231231234',
					tr: ethValue,
					in: 'crypto',
					ip: '4',
					iq: '1',
					cu: 'EUR'
				},
			});
		}catch(err){
			sails.log.error('Error while submitting request to google measurement protocol', err.message);
		}
	},

};

