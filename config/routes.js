module.exports.routes = {

	/** Public Routes */
	'GET /': 'PagesController.getHomePage',
	'GET /login': 'PagesController.getLogin',
	'POST /subscribe': 'PagesController.subscribeUser',
	
	'GET /airdrop': 'PagesController.getAirdrop',
	'POST /airdrop': 'PagesController.postAirdrop',

	'POST /subscribe-presale': 'PagesController.preSaleSubscribeUser',
	'GET /contributor-help': 'PagesController.getContributorHelp',
	'GET /faq': 'PagesController.getFaq',
	'GET /documents': 'PagesController.getDocuments',
	'GET /contact': 'PagesController.getContact',
	'POST /contact': 'PagesController.postContact',

    //slack invite
    'GET /slack-invite': 'PagesController.getSlackInvitePage',
    'POST /slack-invite': 'PagesController.postSlackInvite',

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
	
	// Friends and Family Landing Page
	'GET /friends-only-discount': 'PagesController.getFriendsSupport',
	'POST /friends-only-discount': 'PagesController.postFriendsSupport',
	
	
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
	

	// Investing in Crypto Currencies Guide
	'GET /how-to-invest-in-crypto-currencies-and-bitcoin-in-2017': 'PagesController.investInCryptoCurrencies',

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

  '/ipn': function (req, res) {
    sails.log('IPN received');
    CpService.IPN(req.body);
    res.ok();
  },

  '/test-withdrawal': function (req, res) {
    const Coinpayment = require('coinpayments');
    let client = new Coinpayment(sails.config.COINPAYMENT_OPTS);
    let addr = req.param('address');
    client.createWithdrawal({
      'currency': 'LTCT',
      'amount': 1,
      'address': addr || 'mtXCiJTkFWfSSQCapd8QQzUEECeXjzoYtP'
    }, function (err, result) {
      console.log(err, result);
      res.ok(result);
    });

  },

  '/update-pre-ico-force': function (req, res) {
    let bigNumber = require('bignumber.js');
    bigNumber.config({ EXPONENTIAL_AT: [-7, 2000] });

    const processReq = async ()=>{

      const etherRate = '0.0613690925';
      const getInEther = function (btcRate, amount) {
        let inBtc = new bigNumber(btcRate).mul(amount);
        return inBtc.div(etherRate).toString();
      };
      const getForce = function (etherContribution, extraDiscount) {
        let bonus = extraDiscount ? 70 : 60;
        let forcePrice = 6000;
        let forceBought = new bigNumber(etherContribution).mul(forcePrice);

        let bonusEarned = forceBought.times(bonus).dividedBy(100);

        return {forceBought, bonusEarned, totalForce: new bigNumber(forceBought).add(bonusEarned).toString()}
      };

      let txns = await Transaction.find({statusId: Status.LIVE, limit: 1000}).populate('user');


      for(let txn of txns) {
        //get ether value
        let ethContrib = getInEther(txn.btcRate, txn.amount);

        let isSpecial = false;
        if(_.isObject(txn.user) && txn.user.releaseFundingConfirmed)
          isSpecial = true;

        let force = getForce(ethContrib, isSpecial);

        txn.inEth = ethContrib;
        txn.forceEarned = force.totalForce;
        txn.forceBonus = force.bonusEarned;
        await txn.save();

        // calculate tokens
        // 6000 + 60% or 70% depending on acceptance
      }

      return true;
    };

    processReq()
      .then(res.ok);
  },

  '/process-pending1': function (req, res){
    BlockchainService.contracts.TriForceNetworkCrowdsale.processOldEvents()
      .catch(_err => sails.log.error('error while processing ico pending txns ', _err));
  },

  '/tmp': function (req, res) {
    BlockchainService.contracts.WhiteList.isWhiteListed('0x4271aF2959dd5A2a1189bfF20d7bcAe9820B1500')
      .then(res.ok)
      .catch(res.badRequest);
  }
};
