/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const validator = require('validator');

module.exports = {


  signupKyc: function (req, res) {
    let {firstName,lastName,email,password,nationality,country,gender,dateOfBirth,referrerId,referrerWebId,runCpaId/*,faceMatchResult,approvalStatus*/} = req.allParams();

    if(!_.isString(firstName))
      return res.badRequest('Please provide a valid first name');
    if(!_.isString(lastName))
      return res.badRequest('Please provide a valid last name');
    if(!validator.isEmail(email))
      return res.badRequest('Please provide a valid email address');
    if(password.length < 7)
      return res.badRequest('Password length must be greater than 6 characters.');


    const processRequest = async ()=>{

		let userExists = await User.findOne({email:email});

		// Make sure user is not already approved or rejected
		if(userExists){
			if(userExists.approvalStatus == 'CLEARED' || userExists.approvalStatus == 'ACCEPTED'){
				return {user:userExists,status:'cleared'};
			}else if(userExists.approvalStatus == 'REJECTED'){
				return {user:userExists,status:'rejected'};
			}
		}

		// User with email already exists - update instead
		if(typeof userExists != 'undefined' && userExists != ''){

			if(typeof userExists.runCpaId == 'undefined' || userExists.runCpaId == null){
				userExists.runCpaId = '';
			}else if(userExists.runCpaId.length != 0){
				referrerId = '';
				RunCpaService.signupCallback(userExists.runCpaId,userExists.whitelistEthAddress);
			}

			let user = await User.update({email:email},{
				firstName:firstName,
				lastName:lastName,
				password:password,
				nationality:nationality,
				country:country,
				dateOfBirth:dateOfBirth,
				gender:gender,
				statusId: Status.ACTIVE,
				referrerId:referrerId,
				referrerWebId:referrerWebId,
				runCpaId:userExists.runCpaId,
				// faceMatchResult:faceMatchResult,
				// approvalStatus:approvalStatus
			});

			//await UserService.sendActivationEmail(email);
			let loggedIn = await UserService.login(email, password);
			return loggedIn;
		}

		// User does not exist - create new
		else{

			let user = await User.create({
				firstName:firstName,
				lastName:lastName,
				email:email,
				password:password,
				nationality:nationality,
				country:country,
				dateOfBirth:dateOfBirth,
				gender:gender,
				statusId: Status.ACTIVE,
				referrerId:referrerId,
				runCpaId:runCpaId,
				// faceMatchResult:faceMatchResult,
				// approvalStatus:approvalStatus
			});

			//await UserService.sendActivationEmail(user.email);
			let loggedIn = await UserService.login(email, password);
			return loggedIn;
		}
    };

    processRequest()
      .then(res.ok)
      .catch(err=> rUtil.errorResponse(err, res));
  },




	// Update Step 1 of KYC process data
	updateUserKyc: function (req, res) {
		var userId = req.param('userId'),
			approvalStatus = req.param('approvalStatus'),
			checkStatusUrl = req.param('checkStatusUrl');

		const processRequest = async ()=>{
			let updatedUser = await User.update({id:userId},{approvalStatus:approvalStatus,checkStatusUrl:checkStatusUrl});
      let user = _.isArray(updatedUser) && updatedUser.length ? updatedUser[0]: null;
      // if (user && 'approvalStatus' in user && _.isString(user.approvalStatus) && ['CLEARED', 'ACCEPTED', 'APPROVED'].indexOf(user.approvalStatus.toUpperCase()) !== -1){
      //   user.whitelistEthAddress && BlockchainService.contracts.WhiteList.addWhiteListed(user.whitelistEthAddress)
      //     .catch((err)=>{
      //       sails.log.error('user controller: failed to add to whitelist: ', err);
      //     })
      // }
			return updatedUser;
		};

		processRequest().then(res.ok).catch(function(err){
			return err;
		});
	},


	// Update Step 2 of KYC process data
	updateUserKyc2: function (req, res) {

		var userId = req.param('userId'),
			documentId = req.param('documentId'),
			selfieId = req.param('selfieId'),
			faceMatchResult = req.param('faceMatchResult'),
			approvalStatus = req.param('approvalStatus');

		const processRequest = async ()=>{
			let updatedUser = await User.update({id:userId},{documentId:documentId,selfieId:selfieId,faceMatchResult:faceMatchResult,approvalStatus:approvalStatus});
			let user = _.isArray(updatedUser) && updatedUser.length ? updatedUser[0]: null;
      // if (user && 'approvalStatus' in user && _.isString(user.approvalStatus) && ['CLEARED', 'ACCEPTED', 'APPROVED'].indexOf(user.approvalStatus.toUpperCase()) !== -1){
      //   user.whitelistEthAddress && BlockchainService.contracts.WhiteList.addWhiteListed(user.whitelistEthAddress)
      //     .catch((err)=>{
      //       sails.log.error('user controller: failed to add to whitelist: ', err);
      //     })
      // }
			return updatedUser;
		};

		processRequest().then(res.ok).catch(function(err){
			sails.log.error("Failed to update information about user for KYC step 2: ",err);
			return err;
		});
	},


  sendActivationEmail: function (req, res) {
    UserService.sendActivationEmail(req.param('email'))
      .then(()=>{
        res.ok({
          msg: 'Please check your inbox for an activation email from TFT'
        })
      })
      .catch(err=> rUtil.errorResponse(err, res));
  },

  forgotPassword: function (req, res) {
    UserService.sendResetPasswordEmail(req.param('email'))
      .then(()=>{
        res.ok({
          msg: 'Please check your inbox for password reset instructions'
        })
      })
      .catch(err=> rUtil.errorResponse(err, res));
  },

  activateAccount: function (req, res) {
    const processRequest = async ()=>{
    	
      let user = await User.update({
        id: req.token.user.id,
        isDeleted: false,
        statusId: Status.PENDING
      }, {
        statusId: Status.ACTIVE
      });

      	if(!user || !user.length){
        	throw new CustomError('Invalid request to process', {status: 404});
		}

      	return await UserService.login(user[0].email, null, true);
    };

    processRequest()
      .then(res.ok)
      .catch(err=> rUtil.errorResponse(err, res));
  },

  resetPassword: function (req, res) {
    let password = req.param('password');
    if(!_.isString(password) || password.length < 7)
      return res.badRequest('Please provide a valid password. Password length must be greater than 6');

    let pwdChk = req.param('password-check');

    if(password !== pwdChk){
      return res.badRequest('Your password did not match. Please check and try again');
    }

    const processRequest = async ()=>{
      let user = await User.update({
        id: req.token.user.id,
        isDeleted: false,
        statusId: [Status.PENDING, Status.LIVE, Status.ACTIVE, Status.INACTIVE]
      }, {
        statusId: Status.ACTIVE,
        password
      });

      if(!user || !user.length)
        throw new CustomError('Invalid request to process', {status: 404});

      return {msg: 'Your password has been updated successfully'};
    };

    processRequest()
      .then(res.ok)
      .catch(err=> rUtil.errorResponse(err, res));
  },

  changePassword: function (req, res) {
    let password = req.param('password');
    if(!_.isString(password) || password.length < 7)
      return res.badRequest('Please provide a valid password. Password length must be greater than 6');

    const processRequest = async ()=>{

      if(req.token.user.tfaEnabled)
        await UserService.verifyTOTP(req.param('tfa_token'), req.token.user.id);

      let user = await User.update({
        id: req.token.id,
        isDeleted: false,
        statusId: [Status.PENDING, Status.LIVE, Status.ACTIVE, Status.INACTIVE]
      }, {
        password
      });

      if(!user || !user.length)
        throw new CustomError('Invalid request to process', {status: 404});

      return {msg: 'Your password has been updated successfully'};
    };

    processRequest()
      .then(res.ok)
      .catch(err=> rUtil.errorResponse(err, res));
  },

  enableTFA: function (req, res) {
    if(req.token.user.tfaEnabled)
      return res.badRequest('Two factor authentication is already enabled on this account. Please contact pete@triforcetokens.io for help');

    const speakeasy = require('speakeasy'),
      QRCode = require('qrcode'),
      secret = speakeasy.generateSecret({length: 10, label: 'TFT'}),
      url = speakeasy.otpauthURL({ secret: secret.ascii, label: 'Triforce Tokens', algorithm: 'sha512' });

    QRCode.toDataURL(url, (err, data_url) => {
      // save to logged in user.
      User.update({id: req.token.user.id}, {tfaSecret: secret.base32}).catch((er)=>sails.log.error('2fa error: ', er));

      res.send('<img src="' + data_url + '">');
    });
  },

  verifyTOTP: function (req, res) {
    if (!req.param('tfa_token')) {
      return res.badRequest({ err: 'secret_key param is missing' });
    }

    UserService.verifyTOTP(req.param('tfa_token'), req.token.user.id)
      .then(res.ok)
      .catch(err=> rUtil.errorResponse(err, res));
  },

  findOne: function (req, res) {
    let id = req.param('id') || req.token.user.id;
    if(!id || isNaN(id) || id != req.token.user.id)
      return res.notFound();

    User.findOne(id)
      .then(res.ok)
      .catch(err=>rUtil.errorResponse(err, res));
  },



	// Find User By Email & populate their transactions
	findOneByEmail: function (req, res) {

		let id = req.param('email');

		// Make sure an email is provided
		if(!id || typeof id == 'undefined'){
			return res.notFound();
		}

		// Find User by email
		User.findOne({email:id})
		.then(function(data){

			sails.log.debug("finding user by email data: ",data);

			// Get users transactions
			const processReq = async () => {

				// Get users transactions
				let txns = await Transaction.find({user: data.id}).populate('crypto');

				// Calculate the total in USD
				let totalUSD = CpService.sumBigNumbers(txns.map(_txn => _txn.toUSD));

				// Caluclate total TFTs
				let estimatedTFTs = {
					obtained: CpService.sumBigNumbers(txns.map(_txn => _txn.tfts)),
					bonus: CpService.sumBigNumbers(txns.map(_txn => _txn.tftBonus))
				};

				estimatedTFTs.total = CpService.sumBigNumbers([estimatedTFTs.obtained, estimatedTFTs.bonus]);

				return {
					user:data,
					allInUSD: totalUSD,
					estimatedTFTs,
					transactions: txns
				};
			};

			processReq().then(res.ok).catch(err => rUtil.errorResponse(err, res));

		}).catch(err => rUtil.errorResponse(err, res));
	},


	// Confirm help from contributor
	helpConfirmed: function(req,res){

		let id = req.param('email');

		// Make sure an email is provided
		if(!id || typeof id == 'undefined'){
			return res.notFound();
		}

		User.update({email:id},{releaseFundingConfirmed:new Date()}).then(res.ok).catch(err => rUtil.errorResponse(err, res));
	},


  setupEtherAddress_OLD: function (req, res) {
    if(!req.token.user.tfaEnabled)
      return res.badRequest('Please enable two factor authentication first');

    let etherAddress = req.param('ether_address');
    if(!_.isString(etherAddress) || !CpService.isAddress(etherAddress))
      return res.badRequest('Please provide a valid ETH address');

    UserService.verifyTOTP(req.param('tfa_token'), req.token.user.id)
      .then(()=> {
        return User.update({id: req.token.user.id}, {etherAddress: etherAddress});
      })
      .then(()=>res.ok())
      .catch(err=> rUtil.errorResponse(err, res));
  },

	requestEtherAddress: function (req, res) {

		let rawAddress = req.param('ether_address');

		if(!_.isString(rawAddress)){
			return res.badRequest('Could not verify your ethereum address. Please make sure you provide a valid address. ');
		}

		let etherAddress =  new Buffer(rawAddress, 'base64').toString('utf8');

		if(etherAddress.length > 43 || etherAddress.length < 40){
			// try to check raw address
			return res.badRequest('Could not verify your ethereum address. Please make sure you provide a valid address. ');
		}


		UserService.sendEtherVerifyEmail(req.token.user, etherAddress)
		.then(()=>{
			User.update({id: req.token.user.id}, {tfaSecret: etherAddress}).catch(err=>{sails.log.error(err)});
			res.ok({msg: 'An email has been sent with the confirmation link to update your ethereum address'});
		}).catch(err=>rUtil.errorResponse(err, res));

	},



	getPendingWhitelistUsers: function (req, res) {

		var approvalStatus = req.param('approvalStatus'),
			faceMatchResult = req.param('faceMatchResult');

		User.find({approvalStatus:approvalStatus,faceMatchResult:faceMatchResult}).then((users)=>{
			return res.ok({users:users});
		}).catch(function(err){
			sails.error.log("userscontroller getPendingWhitelistErr: ",err);
			return res.badRequest('API UsersController.getPendingWhitelistUsers error: ',err);
		});
	},



	setupEtherAddress: function (req, res) {

    const processReq = async ()=> {
      let user = await User.update({id: req.token.user.id, tfaSecret: req.token.etherAddress}, {etherAddress: req.token.etherAddress,whitelistEthAddress:req.token.etherAddress});

      if(!_.isArray(user) || !user.length){
        throw new CustomError('Invalid request to process. Please contact support for help', {status: 400});
      }
      user = user[0];

      if ('approvalStatus' in user && _.isString(user.approvalStatus) && ['CLEARED', 'ACCEPTED', 'APPROVED'].indexOf(user.approvalStatus.toUpperCase()) !== -1) {
        await BlockchainService.contracts.WhiteList.addWhiteListed(user.whitelistEthAddress);
      }
      return true;
    };

    processReq()
      .then(()=> res.ok({msg: 'Your ethereum address has been updated successfully'}))
      .catch(err=> {
        if(err.status === 400)
          util.errorResponse(err, res);

        return res.badRequest('Some error occurred while processing your request. Please contact support');
      });


	},


	// Get complete count of users/supporters
	totalUsers: function(req,res){
		// This intentionally gets just the unique transactions, there may be some duplicates but not important
		Transaction.count().then(function(data){res.ok({data:data})}).catch(err=>rUtil.errorResponse(err, res));
	},


  // Get complete count of users/supporters
  raza__totalUsers: function(req,res){
    Transaction.query('SELECT count(distinct userId) as users FROM transactions;', function (err, rsp) {
      if(err || !rsp || !rsp.length)
        return res.badRequest();

      res.ok({data:rsp[0].users});
    });
  },

	// Get Table row of triforce
	getTriforceTableData: function(req,res){
		Triforce.findOne({id:1}).then(function(data){res.ok({data:data})}).catch(err=>rUtil.errorResponse(err, res));
	},


	/**
	* Return the twitter tool page
	*/
	getPartnerResults: function (req, res) {

		var refId = req.param("refId"),
			accessToken = req.param("accessToken");

		// Get users transactions
		const processReq = async () => {

			// Check the partner sent the correct auth details
			let authPartner = await Partners.findOne({refId:refId,accessToken:accessToken});

			if(typeof authPartner == 'undefined' || !authPartner){
				throw new Error("Failed authentication");
			}


			// Get users transactions
			const queryPromise = sails.bluebird.promisify(User.query);

			let users = await queryPromise("SELECT a.approvalStatus,a.firstName,a.lastName,a.whitelistEthAddress,a.nationality,a.id AS userId, b.amount AS ethAmount,b.currency,b.createdAt AS transactionCreatedAt FROM users AS a LEFT JOIN transactions AS b ON a.id = b.userId WHERE a.referrerId = \"" + refId + "\"");

			var rsp = {};
				rsp.users = users;

			return rsp;
		};

		processReq().then(res.ok).catch(err => rUtil.errorResponse(err, res));

  },
  

  whitelistAddress: function(req, res) {
    const toBeWhitelisted = req.query.walletAddress;
      let processReq = async () => {
      let user = await User.update({id: req.token.user.id}, {whitelistEthAddress: toBeWhitelisted});


			if(!user.runCpaId){
				referrerId = '';
				RunCpaService.signupCallback(user.runCpaId,user.whitelistEthAddress);
			}

      if(!_.isArray(user) || !user.length){
        throw new CustomError('Invalid request to process. Please contact support for help', {status: 400});
      }
      user = user[0];
      if ('approvalStatus' in user && _.isString(user.approvalStatus) && ['CLEARED', 'ACCEPTED', 'APPROVED'].indexOf(user.approvalStatus.toUpperCase()) !== -1) {
       const bcRes = await BlockchainService.contracts.WhiteList.addWhiteListed(user.whitelistEthAddress);
      }
      return true;
    }

    processReq()
      .then(() => res.ok({msg: 'Your ethereum address has been updated successfully'}))
      .catch(err=> {
        sails.log.error(err);
        if(err.status === 400)
          rUtil.errorResponse(err, res);

        return res.badRequest('Some error occurred while processing your request. Please contact support');
      });
  }

};
  