/**
* Users.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		username: {
			type: 'string',
			maxLength: 255,
			unique: true
		},
		bitcoinTalkUsername: {
			type: 'string',
			maxLength: 255,
			unique: true
		},
		bitcoinTalkProfile: {
			type: 'string',
			maxLength: 255,
			unique: true
		},
		ethAddress: {
			type: 'string',
			maxLength: 255,
		},
		uid: {
			type: 'string',
			maxLength: 255,
			unique: true
		},
		retweets: {
			type: 'integer',
			maxLength: 8
		},
		likes: {
			type: 'integer',
			maxLength: 8
		},
		followers: {
			type: 'integer',
			maxLength: 8
		},
		stakes: {
			type: 'integer',
			maxLength: 8
		},
		active: {
			type: 'boolean',
			defaultsTo: true
		},
		tweets: {
			collection: 'followertweetstracked',
			via: 'twitterFollower'
		}
	},
	
  
  
	beforeCreate: function (user, cb) {
		user.username = user.username.replace("@", '');
		cb();
	},
	

};

