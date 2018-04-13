/**
* Whitelists.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var bcrypt = require('bcryptjs');

module.exports = {

	attributes: {
		
		firstName: {
			type: 'string',
			maxLength: 40
		},
		email: {
			type: 'email',
			maxLength: 255,
			unique: true,
			required: true
		},
		password: {
			type: 'string',
			minLength: 6,
			required: true,
			regex: /(?=.*\d)/ // Must contain at least one number
		},
		activateCode: {
			type: 'string',
			maxLength: 40
		},
		status: {
			type: 'boolean',
			defaultsTo: false
		},
		lastLogin: {
			type: 'datetime'
		},
		failedLoginAttempts: {
			type: 'integer',
			defaultsTo: '0'
		},
		passwordResetAttempts: {
			type: 'integer',
			defaultsTo: '0'
		},
		toJSON: function() {
		  var obj = this.toObject();
		  delete obj.password;
		  return obj;
		},
	},
	
  
  
	beforeCreate: function (user, cb) {
	
		user.email = user.email.replace(/\s+/g, '');
		
		var salt = bcrypt.genSaltSync(10);

		bcrypt.hash(user.password, salt, function (err, hash) {
		  if (err) return cb(err);
		  user.password = hash;
		  cb();
		});
	},
	
	
	beforeUpdate: function (user, cb) {
		
		if(typeof user.password !== 'undefined' && user.password.length > 0){
			var salt = bcrypt.genSaltSync(10);

			bcrypt.hash(user.password, salt, function (err, hash) {
			  if (err) return cb(err);
			  user.password = hash;
			  cb();
			});
		}else{
			cb();
		}
		
	},

};

