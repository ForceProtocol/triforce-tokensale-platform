module.exports.routes = {

	/** Public Routes */
	'GET /': 'PagesController.getHomePage',

  /** Strategy Pages */
  'GET /token-sale': 'PagesController.getTokenSale',
  'GET /private-sale': 'PagesController.getPrivateSale',
  'GET /game-publishing': 'PagesController.getGamePublishing',
  'GET /marketplace': 'PagesController.getMarketplace',
  'GET /player-community': 'PagesController.getPlayerCommunity',
  'GET /dynamic-advertisement': 'PagesController.getDynamicAdvertisement',
  'GET /raidparty': 'PagesController.getRaidParty',
  'GET /dynamic-advertisement': 'PagesController.getDynamicAdvertisement',
  'GET /technology': 'PagesController.getTechnology',
  'GET /team': 'PagesController.getTeam',
  'GET /our-story': 'PagesController.getOurStory',
  'GET /force-blockchain': 'PagesController.getForceBlockchain',
  'GET /force-wallet': 'PagesController.getForceWallet',
  'GET /custom-game-tokens': 'PagesController.getCustomGameTokens',
  'GET /documents': 'PagesController.getDocuments',
  'GET /partners': 'PagesController.getPartners',
  'GET /studio-signup': 'PagesController.getStudioSignup',
  'POST /studio-signup': 'PagesController.postStudioSignup',

  /** Legal / Terms and Conditions, Privacy */
  'GET /token-sale-legal': 'PagesController.getTokenSaleLegal',
  'GET /terms-of-use': 'PagesController.getTermsOfUse',
  'GET /privacy': 'PagesController.getPrivacy',

  /** Email Subscribe */
  'POST /subscribe': 'PagesController.subscribeUser',
  'POST /subscribe-presale': 'PagesController.preSaleSubscribeUser',

  /** Help and Support */
  'GET /faq': 'PagesController.getFaq',
  'GET /contact': 'PagesController.getContact',
  'POST /contact': 'PagesController.postContact',


  /** Accounts */
  'GET /verify-email': 'PagesController.verifyEmail',
  'GET /verify-ether-request': 'PagesController.verifyEtherAddress',
  'GET /forgot-password': 'PagesController.getForgotPassword',
  'POST /forgot-password': 'PagesController.forgotPassword',
  'GET /reset-password/:token': 'PagesController.getResetPassword',
  'POST /reset-password/:token': 'PagesController.postResetPassword',
	
	// KYC Process
	'GET /join-whitelist': 'PagesController.getJoinWhitelist',
	'POST /join-whitelist': 'PagesController.postJoinWhitelist',
	'POST /join-whitelist-step-1': 'PagesController.postKycStep1',
	'POST /join-whitelist-step-2': 'PagesController.postKycStep2',
  /** Resubmit KYC Application */
  'POST /resubmit-kyc': 'PagesController.resubmitKYC',

	/** INVESTOR DASHBOARD */
	'GET /contributor-signup': 'PagesController.getContributorSignUp',
	'POST /contributor-signup': 'PagesController.postContributorSignup',
  'GET /contributor-login': 'PagesController.getContributorLogin',
	'POST /contributor-login': 'PagesController.postContributorLogin',
	'GET /contributor': 'DashboardController.getDashboard',
  'GET /contributor/transactions': 'DashboardController.getTransactions',
  'GET /contributor/kyc': 'DashboardController.getKyc',
  'GET /contributor/buy-force': 'DashboardController.getBuyForce',
  'GET /contributor/buy-force': 'DashboardController.postBuyForce',
  'GET /contributor/change-password': 'DashboardController.getChangePassword',
  'POST /contributor/change-password': 'DashboardController.postChangePassword',
  'GET /logout': 'DashboardController.logout',
  'GET /user/activate': 'UserController.activateAccount',
  'GET /user/resend-activation-link': 'UserController.sendActivationEmail',
  '/contributor/set-ethereum-address': 'DashboardController.setEthereumAddress',

	// Get pending whitelist users for artemis front end server
	'POST /get-pending-whitelist-users': 'UserController.getPendingWhitelistUsers',

  'POST /user/setup-ether-address': 'UserController.requestEtherAddress',
  'GET /user/verify-ether-request': 'UserController.setupEtherAddress',

  'GET /user/:id?': 'UserController.findOne',
  'GET /user/find/:email': 'UserController.findOneByEmail',
  'GET /user/help-confirmed/:email': 'UserController.helpConfirmed',
  'GET /users/total': 'UserController.totalUsers',
  'GET /user-crypto': 'CryptoController.getCrypto',
  'GET /user-cryptos': 'CryptoController.getUserCryptos',
  'GET /user-txns': 'CryptoController.getUserTransactions',

  'GET /balance': 'CryptoController.getCpBalance',
  'GET /convert': 'CryptoController.convert',
  'GET /calculator': 'CryptoController.tftCalculator',

  'GET /campaign-data': 'UserController.getTriforceTableData',
  'GET /partner/results/:refId/:accessToken': 'UserController.getPartnerResults',


  // white list
  'GET /ico/whitelist/check': 'BlockchainController.isWhiteListed',
  'POST /ico/whitelist/add': 'BlockchainController.addWhiteListed',
  'DELETE /ico/whitelist/remove': 'BlockchainController.removeWhiteListed',
  'GET /ico/summary': 'BlockchainController.getIcoSummary',
  'GET /ico/user/txns': 'BlockchainController.getUserTransactions',

  /** whiteList step route */
  'POST /whitelist-address': 'UserController.whitelistAddress',

  /** ADMIN TOOLS */
  'GET /tools/bounty/twitter': 'PagesController.getTwitterTool',
  'POST /tools/bounty/twitter': 'PagesController.postTwitterTool',

  // Socket Connect Subscribes
  'GET /subscribe/transactions': 'SocketController.subscribeTransactions',
  'GET /subscribe/online': 'SocketController.subscribeOnline',

};
