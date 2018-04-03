/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

	'*': 'localize',

	'PagesController': {
		'getLogin': ['isGuest', 'localize'],
		'getSignUp': ['isGuest', 'localize'],
		'postKycStep2': ['tokenAuth', 'localize'],
		'resubmitKYC': ['tokenAuth', 'localize']
	},

	'DashboardController': {
		'getDashboard': ['tokenAuth', 'localize'],
		'setEthereumAddress': ['tokenAuth', 'localize'],
		'signup': ['isGuest', 'localize'],
		'login': ['isGuest', 'localize'],
		'tokenLogin': ['isGuest', 'localize']
	},

	/* TF-API Backend Policies */


	AuthController: {
		process: true
	},

	UserController: {
		'*': 'tokenAuthBackend',
		signup: true,
		signupKyc: true,
		updateUserKyc: true,
		updateUserKyc2: true,
		confirmRuncpaLead: true,
		findOneByEmail: true,
		helpConfirmed: true,
		forgotPassword: true,
		getPendingWhitelistUsers: true,
		sendActivationEmail: true,
		totalUsers: true,
		getTriforceTableData: true,
		getPartnerResults: true,
		resetPassword: 'isAuthenticated',
		activateAccount: 'isAuthenticated',
		setupEtherAddress: 'isAuthenticated'
	},

	CryptoController: {
		'*': 'tokenAuthBackend',
		'getCpBalance': true
	},

	SocketController: {
		'*': true,
		'subscribeOnline': 'tokenAuthBackend'
	},

	BlockchainController: {
		'*': 'tokenAuth',
		'getIcoSummary': true,
		'getUserTransactions': ['tokenAuthBackend'],
		'addWhiteListed': ['tokenAuthBackend', 'isAdmin'],
		'removeWhiteListed': ['tokenAuthBackend', 'isAdmin'],
		'isWhiteListed': ['tokenAuthBackend']
	}
};
