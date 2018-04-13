/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const bcrypt = require('bcrypt-nodejs');

module.exports = {

  tableName: 'users',

  attributes: {
    firstName: {
      type: 'STRING'
    },
    lastName: {
      type: 'STRING'
    },
    email: {
      type: 'STRING',
      required: true,
      unique: true
    },
    password: {
      type: 'STRING',
      required: true
    },
    statusId: {
      type: 'INTEGER',
      defaultsTo: 1
    },
    isDeleted: {
      type: 'BOOLEAN',
      defaultsTo: false
    },
    lastLogin: {
      'type': 'DATETIME',
      defaultsTo: new Date()
    },
//ALTER TABLE `users` ADD `wlStatus` INT NOT NULL DEFAULT '0' AFTER `socketId`;
    wlStatus: {
      type: 'INTEGER',
      defaultsTo: 0 // 3 = approved, 2=submitted/pending, 1/0/default = didnt try yet
    },

    tfaEnabled: {
      'type': 'boolean',
      defaultsTo: false
    },

    tfaSecret: {
      'type': 'string'
    },

    etherAddress: {
      'type': 'string'
    },

	releaseFundingConfirmed: {
      'type': 'DATETIME'
    },

	whitelistEthAddress: {
		'type': 'string',
		defaultsTo: ''
	},

	gender: {
		'type': 'string',
		defaultsTo: ''
	},

	dateOfBirth: {
		'type': 'string',
		defaultsTo: ''
	},

	nationality: {
		'type': 'string',
		defaultsTo: ''
	},

	country: {
		'type': 'string',
		defaultsTo: ''
	},

	approvalStatus: {
		'type': 'string',
		defaultsTo: ''
	},

	riskRating: {
		'type': 'string',
		defaultsTo: ''
	},

	checkStatusUrl: {
		'type': 'string',
		defaultsTo: ''
	},

	referrerId: {
		'type': 'string',
		defaultsTo: ''
	},
	referrerWebId: {
		'type': 'string',
		defaultsTo: ''
	},
	runCpaId: {
		'type': 'string',
		defaultsTo: ''
	},

	documentId: {
		'type': 'string',
		defaultsTo: ''
	},

	selfieId: {
		'type': 'string',
		defaultsTo: ''
	},

	runCpaCallbackFired: {
		type: 'boolean',
		defaultsTo: false
	},

	faceMatchResult: {
		'type': 'string',
		defaultsTo: ''
	},

    socketId: {
      type: 'string'
    },
    cryptos: {
      collection: 'crypto',
      via: 'user'
    },

    transactions: {
      collection: 'transaction',
      via: 'user'
    },

    toJSON: function () {
      let obj = this.toObject();
      delete obj.password;
      delete obj.statusId;
      delete obj.isDeleted;
      return obj;
    },

    validatePassword: function (attemptedPassword) {
      let self = this;
      return new Promise((resolve, reject)=>{
        bcrypt.compare(attemptedPassword, self.password, (err, result)=>{
          if(err)return reject(err);
          resolve(result);
        });
      })
    }
  },

  beforeCreate: function (user, cb) {

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(user.password, salt, function () {
      }, function (err, hash) {
        user.password = hash;
        cb(null, user);
      });
    });
  },

  beforeUpdate: function (user, cb) {
    if('password' in user){
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(user.password, salt, function () {
        }, function (err, hash) {
          user.password = hash;
          cb(null, user);
        });
      });
    }else cb(null, user);
  }/*,

  afterUpdate: function (users, cb) {
    if (!_.isArray(users)) users = [users];
    for (let user of users) {
      try {
        if ('approvalStatus' in user && _.isString(user.approvalStatus) && ['CLEARED', 'ACCEPTED', 'APPROVED'].indexOf(user.approvalStatus.toUpperCase()) !== -1) {
          user.whitelistEthAddress && BlockchainService.contracts.WhiteList.addWhiteListed(user.whitelistEthAddress)
            .catch((er) => {
              EmailService.sendEmail({
                fromEmail: 'support',
                fromName: 'Support',
                toEmail: sails.config.contacts.team,
                toName: `FORCE Team`,
                subject: 'WHITELIST:: failed to add user to whitelist',
                body:
                  `System failed to add user to whitelist. Please review and add manually:<br>
          USER DATA: <pre>${JSON.stringify(user)}</pre><br>and error message is: <pre>${er ? er.message : 'na'}</pre>`
              });
            });
        }
      }catch(e){
        sails.log.error('error while processing afterUpdate event on User model: ', e.message);
      }
    }
    _.isFunction(cb) && cb();
  }*/
};
