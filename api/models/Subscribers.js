/**
* Subscribers.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/


module.exports = {
	attributes: {

        email: {
            type: 'email',
            unique: true,
            required: true
        },
        name: {
            type: 'string',
            size: 140,
            defaultsTo: ''
        },
		firstName: {
            type: 'string',
            size: 140,
            defaultsTo: ''
        },
		lastName: {
            type: 'string',
            size: 140,
            defaultsTo: ''
        },
		runCpaId: {
			type: 'string',
			size: 60,
			defaultsTo: ''
		},
		runCpaTrackedOn: {
			type: 'datetime',
		},
		referrerId: {
			'type': 'string',
			defaultsTo: ''
		},
        active: {
            type: 'boolean',
            defaultsTo: true
        }

    }
};

