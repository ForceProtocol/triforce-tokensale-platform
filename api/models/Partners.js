/**
* Users.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		
		refId: {
			type: 'string',
			maxLength: 20,
			unique: true,
			required: true
		},
		name: {
			type: 'string',
			minLength: 120,
			required: true
		},
		accessToken: {
			type: 'string',
			maxLength: 80,
			required:true
		},
		details: {
			type: 'text',
		},
	},

};

