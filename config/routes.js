module.exports.routes = {

	/** Public Routes */
	'GET /': 'PagesController.getHomePage',

  /** Strategy Pages */
  'GET /game-publishing': 'PagesController.getGamePublishing',
  'GET /market-place': 'PagesController.getMarketPlace',
  'GET /player-community': 'PagesController.getPlayerCommunity',
  'GET /dynamic-advertisement': 'PagesController.getDynamicAdvertisement',


	'GET /login': 'PagesController.getLogin',
	'POST /subscribe': 'PagesController.subscribeUser',
	'POST /subscribe-presale': 'PagesController.preSaleSubscribeUser',
	'GET /contributor-help': 'PagesController.getContributorHelp',
	'GET /faq': 'PagesController.getFaq',
	'GET /documents': 'PagesController.getDocuments',

  
	'GET /contact': 'PagesController.getContact',
	'POST /contact': 'PagesController.postContact',

  //terms and conditions
  'GET /terms-of-token-sale': 'PagesController.getTermsConditions',
  'GET /privacy': 'PagesController.getPrivacy',
	

	// New Subscribe Landing Pages
	'GET /join': 'PagesController.getJoinUk',
	'GET /join/:locale': 'PagesController.getJoinLocale',
	'POST /join-landing-page': 'PagesController.postJoinLandingPage',
	
	
	// KYC Process
	'GET /join-whitelist': 'PagesController.getJoinWhitelist',
	'POST /join-whitelist': 'PagesController.postJoinWhitelist',
	'POST /join-whitelist-step-1': 'PagesController.postKycStep1',
	'POST /join-whitelist-step-2': 'PagesController.postKycStep2',
	
	
	// Subscriber thank you pages
	'GET /thanks-uk': 'PagesController.getThanksUk',
	'GET /thanks-russia': 'PagesController.getThanksRussia',
	'GET /thanks-germany': 'PagesController.getThanksGermany',
	'GET /thanks-france': 'PagesController.getThanksFrance',
	'GET /thanks-spain': 'PagesController.getThanksSpain',
	'GET /thanks-brazil': 'PagesController.getThanksBrazil',
	'GET /thanks-korea': 'PagesController.getThanksKorea',
	'GET /thanks-japan': 'PagesController.getThanksJapan',
	'GET /thanks-china': 'PagesController.getThanksChina',

	'GET /verify-email': 'PagesController.verifyEmail',
	'GET /verify-ether-request': 'PagesController.verifyEtherAddress',
	'POST /verify-tfa': 'PagesController.verifyTFA',
	'GET /forgot-password': 'PagesController.getForgotPassword',
	'POST /forgot-password': 'PagesController.forgotPassword',
	'GET /reset-password/:token': 'PagesController.getResetPassword',
	'POST /reset-password/:token': 'PagesController.postResetPassword',

	/** INVESTOR DASHBOARD */
	'GET /signup': 'PagesController.getSignUp',
	'POST /signup': 'DashboardController.signup',
	'POST /login': 'DashboardController.login',
	'POST /token-login': 'DashboardController.tokenLogin',
	'GET /logout': 'DashboardController.logout',
	'GET /contributor': 'DashboardController.getDashboard',
	'/contributor/set-ethereum-address': 'DashboardController.setEthereumAddress',
	
	
	/** Partner Result Tracking **/
	'GET /partner/results/:refId/:accessToken': 'PagesController.getPartnerResults',
	
	
	/** ADMIN TOOLS */
	'GET /tools/bounty/twitter': 'PagesController.getTwitterTool',
	'POST /tools/bounty/twitter': 'PagesController.postTwitterTool',

	/**resubmit KYC Application */
	'POST /resubmit-kyc': 'PagesController.resubmitKYC',
	

	/** =========================================================== */
	/** Tf-API backend Routes */
	/** =========================================================== */

  'POST /auth': 'AuthController.process',
  'POST /auth/process': 'AuthController.process',

  'POST /register': 'UserController.signup',
  'POST /register-kyc': 'UserController.signupKyc',
  'POST /update-user-kyc': 'UserController.updateUserKyc',
  'POST /update-user-kyc-2': 'UserController.updateUserKyc2',
  'POST /confirm-runcpa-lead': 'UserController.confirmRuncpaLead',
  'GET /user/resend-activation-link': 'UserController.sendActivationEmail',
  'GET /user/activate': 'UserController.activateAccount',
  'POST /user/forgot-password': 'UserController.forgotPassword',
  'POST /user/reset-password': 'UserController.resetPassword',
  'POST /user/change-password': 'UserController.changePassword',

	// Get pending whitelist users for artemis front end server
	'POST /get-pending-whitelist-users': 'UserController.getPendingWhitelistUsers',

  // 'GET /user/enable-tfa': 'UserController.enableTFA',
  // 'POST /user/verify-totp': 'UserController.verifyTOTP',
  // 'POST /user/ether-address': 'UserController.setupEtherAddress',
  'POST /user/setup-ether-address': 'UserController.requestEtherAddress',
  'GET /user/verify-ether-request': 'UserController.setupEtherAddress',

  'GET /user/:id?': 'UserController.findOne',
  'GET /user/find/:email': 'UserController.findOneByEmail',
  'GET /user/help-confirmed/:email': 'UserController.helpConfirmed',
  // 'GET /users': 'UserController.find',
  'GET /users/total': 'UserController.totalUsers',

  'GET /user-crypto': 'CryptoController.getCrypto',
  'GET /user-cryptos': 'CryptoController.getUserCryptos',
  'GET /user-txns': 'CryptoController.getUserTransactions',

  'GET /balance': 'CryptoController.getCpBalance',
  'GET /convert': 'CryptoController.convert',
  'GET /calculator': 'CryptoController.tftCalculator',

  'GET /campaign-data': 'UserController.getTriforceTableData',

  // Socket Connect Subscribes
  'GET /subscribe/transactions': 'SocketController.subscribeTransactions',
  'GET /subscribe/online': 'SocketController.subscribeOnline',


  'GET /partner/results/:refId/:accessToken': 'UserController.getPartnerResults',


  // white list
  'GET /ico/whitelist/check': 'BlockchainController.isWhiteListed',
  'POST /ico/whitelist/add': 'BlockchainController.addWhiteListed',
  'DELETE /ico/whitelist/remove': 'BlockchainController.removeWhiteListed',

  // ico
  'GET /ico/summary': 'BlockchainController.getIcoSummary',
  'GET /ico/user/txns': 'BlockchainController.getUserTransactions',

  /** whiteList step route */
  'POST /whitelist-address': 'UserController.whitelistAddress',

};
