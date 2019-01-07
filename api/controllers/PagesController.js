/**
 * PagesController
 *
 * @description :: Server-side logic for managing Pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

const request = require('request-promise'),
	Recaptcha = require('recaptcha-v2').Recaptcha,
	fs = require('fs'),
	validator = require('validator'),
	ethUnits = require('ethereumjs-units'),
	bigNumber = require('bignumber.js');

var RECAPTCHA_PUBLIC_KEY = sails.config.RECAPTCHA.PUBLIC_KEY,
	RECAPTCHA_PRIVATE_KEY = sails.config.RECAPTCHA.PRIVATE_KEY;

Recaptcha.prototype.toHTML = function (callbackFunction) {

	if (typeof callbackFunction === 'undefined') {
		callbackFunction = '';
	}

	return '<div class="g-recaptcha" data-callback="' + callbackFunction + '" data-sitekey="' + this.public_key + '"></div>';
};

module.exports = {


	/**
	* Return the home page
	*/
	getHomePage: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/home', {
			layout: 'public/layout',
			title: 'Force Protocol Ltd',
			metaDescription: 'Force Protocol is building the future of game publishing, with a full-house technology framework to make games launch successfully and continue to grow.',
			recaptchaForm: recaptcha.toHTML()
		});

	},


	/**
	* Return the login page
	*/
	getLogin: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/login', {
			layout: 'public/layout',
			title: 'Force Protocol User Account Login',
			metaDescription: '',
			recaptchaForm: recaptcha.toHTML()
		});
	},


	/**
	* Get Sign Up
	*/
	getSignUp: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/signup', {
			layout: 'public/layout',
			title: 'Force Protocol - Enter Token Sale',
			metaDescription: 'Sign up to the greatest technology based game publishing endevour.',
			recaptchaForm: recaptcha.toHTML()
		});
	},



	/**
	* Get Sign Up
	*/
	getStudioSignup: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/studio-signup', {
			layout: 'public/layout',
			title: 'Force Protocol - Submit your game',
			metaDescription: 'Submit your game to become part of the Force Protocol family.',
			recaptchaForm: recaptcha.toHTML()
		});
	},



	/**
	* Post Studio Submit game
	*/
	postStudioSignup: function (req, res) {
		// Confirm recapture success
	    var data = {
	      remoteip: req.connection.remoteAddress,
	      response: req.param("g-recaptcha-response"),
	      secret: RECAPTCHA_PRIVATE_KEY
	    };

	    var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY, data);

	    var email = req.param("email"),
	    studioName = req.param("studioName"),
	    telephone = req.param("telephone"),
	    name = req.param("name"),
	    description = req.param("description");


	    recaptcha.verify(function (success, error_code) {
	      if (success) {
	      	// Send email to us
	      	message = `Studio game submission

	      	Studio: ${studioName},
	      	Person: ${name},
	      	Email: ${email},
	      	Telephone: ${telephone},
	      	Game Details: ${description} `;

			// Submit the email to the team
			let toField = {email: 'pete@forceprotocol.io', name: 'Pete Mardell'};
			MailchimpService.sendMandrillEmail(toField, 'pete@forceprotocol.io', "Studio Game Submission", message);

	        req.addFlash('success', 'Thank you for your game submission, our team will be in touch soon!');
	        return res.redirect("/studio-signup?email=" + email);
	      } else {
	        req.addFlash('errors', 'There was a problem submitting your game, please try again or <a href="/contact">contact us</a>.');
	        return res.redirect("/studio-signup?email=" + email);
	      }
	    });
	},

	/**
	* Return the contributor login page
	*/
	getContributorLogin: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/contributor-login', {
			layout: 'public/layout',
			title: 'Contributor Login',
			metaDescription: '',
			recaptchaForm: recaptcha.toHTML()
		});
	},


	postContributorLogin: async (req, res) => {

		var email = req.param("email"),
		password = req.param("password"),
		recaptchaField = req.param("g-recaptcha-response");

		try{
		    // Confirm recapture success
		    var data = {
		      remoteip: req.connection.remoteAddress,
		      response: recaptchaField,
		      secret: RECAPTCHA_PRIVATE_KEY
		    };

		    var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY, data);

		    recaptcha.verify(function (success, error_code) {
	      		if(success) {
	      			UserService.login(email, password).then(function(userData){
	      				req.session.authenticated = true;
	      				req.session.user = userData.user;
	      				req.session.token = userData.token;

	      				if(!userData.user.approvalStatus){
				          return res.redirect("/contributor/kyc");
				        }
				        
			       		return res.redirect("/contributor");
			       }).catch((err)=>rUtil.errorResponseRedirect(err, req, res, "/contributor-login?email=" + email));

	      		}else{
	      			req.addFlash('errors', "You did not tick the recaptcha verification box.");
		    		return res.redirect("/contributor-login?email=" + email);
		    	}
			});
	  	} catch(err){
		  	req.addFlash('errors', "There was a problem logging in to your account. Please make sure your details are correct.");
		  	sails.log.error("PageController.postContributorLogin error: ",err);
		  	return res.redirect("/contributor-login?email=" + email);
	  	}
  	},


	/**
	* Get Contributor Sign Up
	*/
	getContributorSignUp: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/contributor-signup', {
			layout: 'public/layout',
			title: 'Contributor Signup',
			metaDescription: '',
			recaptchaForm: recaptcha.toHTML()
		});
	},


	/**
	* User Sign up
	*/
	postContributorSignUp: function(req,res){

		let {firstName, lastName, email, password,termsCheckbox} = req.allParams();
		let signupError = false;

		// Fix non-ascii characters
        let combining = /[\u0300-\u036F]/g; 
        firstName = firstName.normalize('NFKD').replace(combining, '');
        lastName = lastName.normalize('NFKD').replace(combining, '');

		// Confirm recapture success
	    var data = {
	      remoteip: req.connection.remoteAddress,
	      response: req.param("g-recaptcha-response"),
	      secret: RECAPTCHA_PRIVATE_KEY
	    };

	    var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY, data);


	    recaptcha.verify(function (success, error_code) {
	      	if (success) {

	      		// Make sure user agrees to terms
	      		if(!termsCheckbox){
	      			signupError = true;
			    	req.addFlash("errors","You must confirm you agree to the Token Sale Agreement and have understood all legal disclosures.");
	      		}

			    if(!_.isString(firstName)){
			    	signupError = true;
			    	req.addFlash("errors","You did not enter a valid first name");
			    }

			    if(!_.isString(lastName)){
			      	signupError = true;
			    	req.addFlash("errors","You did not enter a valid last name");
			    }

			    if(!validator.isEmail(email)){
			      	signupError = true;
			    	req.addFlash("errors","You did not enter a valid first name");
			    }

			    let passwordError = User.isInvalidPassword(password);
			    if(passwordError){
			      	signupError = true;
			    	req.addFlash("errors",passwordError);
			    }

			    if(signupError){
			    	return res.redirect("/contributor-signup?email=" + email + "&firstName=" + firstName + "&lastName=" + lastName);
			    }


			    const processRequest = async ()=>{

			      	const userExists = await User.count({email});

			      	if(userExists){
			      		throw new CustomError('An account already exists with this email address. Please login with ' + email + ' or sign up with a different one.', {status: 403});
			      	}

			      	// Check if user has been referred
			      	let referrerId = '';
			      	if(req.cookies.track_id){
			      		referrerId = req.cookies.track_id;
			      	}

			      	const user = await User.create({
				        firstName: firstName,
				        lastName: lastName,
				        email:email,
				        password: password,
				        referrerId: referrerId
			      	});

			      	await UserService.sendActivationEmail(user.email);

			      	let loggedIn = await UserService.login(email, password);

			      	req.session.authenticated = true;
			    	req.session.user = loggedIn.user;
			    	req.session.token = loggedIn.token;

			      	return loggedIn;
			    };

			    processRequest().then(function(){
			    	// TODO: Make user complete KYC
			      	req.addFlash("success","Your account has been created. You will need to click the activation link in the email sent to be able to login next time.");
			      	return res.redirect("/contributor/kyc");
		      	}).catch(err=> rUtil.errorResponseRedirect(err, req, res, "/contributor-signup?email=" + email + "&firstName=" + firstName + "&lastName=" + lastName));

			}else{
				req.addFlash("errors","You did not complete the captcha check.");
				return res.redirect("/contributor-signup?email=" + email + "&firstName=" + firstName + "&lastName=" + lastName);
			};

		});
	},


	/**
	* Completing KYC
	*/
	getCompletingKyc: function (req, res) {

		return res.view('public/completing-kyc', {
			layout: 'public/layout',
			title: 'Completing Your KYC',
			metaDescription: ''
		});

	},



	/**
	* Game Publishing
	*/
	getGamePublishing: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/game-publishing', {
			layout: 'public/layout',
			title: 'Game Publishing',
			metaDescription: 'Our team will work closely with you to ensure the best publishing campaigns are delivered to give your game maximum exposure.',
			recaptchaForm: recaptcha.toHTML()
		});

	},


	/**
	* Our Story
	*/
	getOurStory: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/our-story', {
			layout: 'public/layout',
			title: 'Our Story',
			metaDescription: '.',
			recaptchaForm: recaptcha.toHTML()
		});
	},


	/**
	* RaidParty
	*/
	getRaidParty: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/raidparty', {
			layout: 'public/layout',
			title: 'RaidParty',
			metaDescription: '.',
			recaptchaForm: recaptcha.toHTML()
		});
	},



	/**
	* Technology
	*/
	getTechnology: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/technology', {
			layout: 'public/layout',
			title: 'Our Technology',
			metaDescription: '.',
			recaptchaForm: recaptcha.toHTML()
		});
	},


	/**
	* Marketplace
	*/
	getMarketplace: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/marketplace', {
			layout: 'public/layout',
			title: 'Marketplace',
			metaDescription: '.',
			recaptchaForm: recaptcha.toHTML()
		});
	},


	/**
	* DynamicAdvertisement
	*/
	getDynamicAdvertisement: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/dynamic-advertisement', {
			layout: 'public/layout',
			title: 'Dynamic Advertisement',
			metaDescription: '.',
			recaptchaForm: recaptcha.toHTML()
		});
	},

 
	/**
	* Subscribe User
	*/
	subscribeUser: function (req, res) {

		var email = req.param("email"),
			referrerId = '',
			runCpaId = '',
			referrerWebId = '';

		// Confirm recapture success
		var data = {
			remoteip: req.connection.remoteAddress,
			response: req.param("g-recaptcha-response"),
			secret: RECAPTCHA_PRIVATE_KEY
		};

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY, data);

		recaptcha.verify(function (success, error_code) {

			if (success) {

				Subscribers.findOrCreate({ email: email, active: true }).exec(function (err, created) {
					if (err || typeof created == 'undefined') {
						req.addFlash('errors', 'There as a problem trying to subscribe you. You may already be subscribed.');
						return res.redirect("/");
					}

					/** Add to normal subscriber list **/
					MailchimpService.addSubscriber("4cd285b73f", email, "", "", "pending").then(function (addResponse) {
					}).catch(function (err) {
					});

					req.addFlash('success', 'Thank you for subscribing to future updates. Please check your email inbox and possibly junk inbox for your confirmation email.');
					return res.redirect("/");
				});
			}else{
				req.addFlash('errors', 'You did not complete the recaptcha checkbox.');
				return res.redirect("/");
			}
		});
	},



	/**
	* Return the privacy policy page
	*/
	getTeam: function (req, res) {
		return res.view('public/team', {
			layout: 'public/layout',
			title: 'Meet The Team',
			metaDescription: 'The Force Protocol team.'
		});
	},



	/**
	* Return the documents page
	*/
	getDocuments: function (req, res) {
		return res.view('public/documents', {
			layout: 'public/layout',
			title: 'Important Documents',
			metaDescription: 'Get a more complete understanding of the project by reading the white paper, pitch deck, one pager and more resources.'
		});
	},



	/**
	* Return the privacy policy page
	*/
	getPrivacy: function (req, res) {
		return res.view('public/privacy', {
			layout: 'public/layout',
			title: 'Privacy Policy',
			metaDescription: 'How your private information is handled while engaging with this website and related services'
		});
	},


	/**
	* Return the website terms of use
	*/
	getTermsOfUse: function (req, res) {
		return res.view('public/terms-of-use', {
			layout: 'public/layout',
			title: 'Website Terms of Use',
			metaDescription: 'Legal terms on your usage and interaction with this website'
		});
	},



	/**
	* Return the privacy policy page
	*/
	getFaq: function (req, res) {
		return res.view('public/faq', {
			layout: 'public/layout',
			title: 'Frequently Asked Questions: What would you like to know?',
			metaDescription: ''
		});
	},


	/**
	 * Return token sale page
	 */
	getTokenSale: function (req, res) {
		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/token-sale', {
			layout: 'public/layout',
			title: 'Token Sale',
			metaDescription: 'Token sale information',
			recaptchaForm: recaptcha.toHTML()
		});
	},


	/**
	 * Return the terms and conditions page
	 */
	getTokenSaleLegal: function (req, res) {
		return res.view('public/token-sale-legal', {
			layout: 'public/layout',
			title: 'Token Sale Legal Information',
			metaDescription: 'Token sale legal notices'
		});
	},


	/**
	 * How to invest in crypto currencies guide download
	 */
	investInCryptoCurrencies: function (req, res) {
		return res.view('public/invest-in-crypto-guide', {
			layout: 'public/layout',
			title: 'How to invest in crypto currencies and Bitcoin in 2017',
			metaDescription: 'In this guide we show you, a complete new comer to the crypto world, how to invest in crypto currencies and Bitcoin in 2017'
		});
	},


	postInvestInCryptoCurrencies: function (req, res) {

		var email = req.param("email"),
			firstName = req.param("firstName"),
			lastName = req.param("lastName");

		Subscribers.findOrCreate({ firstName: firstName, lastName: lastName, email: email, name: firstName + " " + lastName, active: true }).exec(function (err, created) {
			if (err || typeof created == 'undefined') {
				sails.log.error("failed to add free guide downloader to list: ", err, email);
				return res.ok({ status: "error", msg: "Failed to subscribe you, please try again." });
			}

			/** Add to invest in crypto guide subscriber list **/
			MailchimpService.addSubscriber("34e21fe690", email, firstName, lastName, "pending").then(function (addResponse) {
				sails.log.debug("new invest in guide downloader: ", addResponse);
			}).catch(function (err) {
				sails.log.error("new invest in guide downloader not added due to error: ", err);
			});

			req.addFlash('success', 'Thank you for requesting your free guide to investing in crypto currencies and bitcoin in 2017. Please check your inbox and possibly your junk inbox just in case.');

			return res.ok({ status: "success", msg: "Thank you for requesting your free guide to investing in crypto currencies and bitcoin in 2017. Please check your inbox and possibly your junk inbox just in case." });
		});
	},


	/**
		* Return the forgot password page
		*/
	getForgotPassword: function (req, res) {
		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/forgot-password', {
			layout: 'public/layout',
			title: 'Forgot Password',
			metaDescription: 'Force Protocol Forgot Password',
			recaptchaForm: recaptcha.toHTML()
		});
	},



	/**
	* Get force blockchain
	*/
	getForceBlockchain: function (req, res) {
		return res.view('public/force-blockchain', {
			layout: 'public/layout',
			title: 'FORCE Blockchain',
			metaDescription: 'FORCE Blockchain',
		});
	},


	/**
	* Get force blockchain
	*/
	getCustomGameTokens: function (req, res) {
		return res.view('public/custom-game-tokens', {
			layout: 'public/layout',
			title: 'Custom Game Tokens',
			metaDescription: 'Custom Game Tokens',
		});
	},


	/**
	* Get partners
	*/
	getPartners: function (req, res) {
		return res.view('public/partners', {
			layout: 'public/layout',
			title: 'Force Protocol Partners',
			metaDescription: 'Partners',
		});
	},


	/**
	* Get force wallet
	*/
	getForceWallet: function (req, res) {
		return res.view('public/force-wallet', {
			layout: 'public/layout',
			title: 'FORCE Wallet',
			metaDescription: 'FORCE Wallet',
		});
	},


	/** User forgot password - send them reset link by email
	**/
	forgotPassword: function (req, res) {

		// Confirm recapture success
		var data = {
			remoteip: req.connection.remoteAddress,
			response: req.param("g-recaptcha-response"),
			secret: RECAPTCHA_PRIVATE_KEY
		};

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY, data);

		var email = req.param("email");

		recaptcha.verify(function (success, error_code) {

			if (success) {
				// Submit request to API server to issue password reset link
				// Make sure user email is valid
				User.findOne({email:email}).then(function(user){

					if(user.statusId == Status.SUSPENDED || 
						user.statusId == Status.DELETED){
						req.addFlash('errors', "Your account has been blocked");
						return rUtil.errorResponseRedirect("Your account has been blocked.", req, res, '/');
					}

					UserService.sendResetPasswordEmail(email).then(()=>{
						req.addFlash('success', 'A password reset link will be emailed to you. Please now check your inbox and possibly junk inbox for a password reset email.');
						return res.redirect('/');
					}).catch(err=> rUtil.errorResponse(err, res));

				});

			} else {
				req.addFlash('errors', "There was a problem trying to issue you a reset password link. Please make sure to fill out the captcha form.");
				return res.redirect("/forgot-password");
			}

		});
	},


	verifyEmail: function (req, res) {
		// Submit request to API server to verify
		request({
			method: 'GET',
			json: true,
			qs: req.allParams(),
			uri: sails.config.API_URL + 'user/activate'
		}).then((rsp) => {
			req.addFlash('success', 'Your email address has been verified successfully');
			try {
				if (req.session.user) {
					req.session.user = rsp.user;
					req.session.token = rsp.token;
					return res.redirect('/contributor');
				}
			} catch (er) {
			}
			res.redirect('/contributor-login');
		}).catch(err => {
			let msg = err.error ? err.error.err : err.message;

			if (typeof msg == 'undefined' || msg.length == 0) {
				req.addFlash('errors', "There was a problem with your link. Please contact us at pete@forceprotocol.io or telegram https://t.me/triforcetokens and we will resolve the issue as soon as possible.");
				return res.redirect("/");
			}

			rUtil.errorResponseRedirect(err, req, res, '/');
		});
	},

	verifyEtherAddress: function (req, res) {

		// Submit request to API server to verify
		request({
			method: 'GET',
			json: true,
			qs: req.allParams(),
			uri: sails.config.API_URL + 'user/verify-ether-request'
		}).then((rsp) => {
			req.addFlash('success', 'Your ethereum address has been verified successfully');
			return res.redirect('/contributor');
		}).catch(err => {
			rUtil.errorResponseRedirect(err, req, res, '/');
		});
	},

	verifyTFA: function (req, res) {

		// Submit request to API server to verify
		request({
			method: 'POST',
			json: true,
			body: req.allParams(),
			headers: {
				'Authorization': 'Bearer ' + req.session.token
			},
			uri: sails.config.API_URL + 'user/verify-totp'
		}).then((rsp) => {
			req.addFlash('success', 'Two factor authentication has been enabled successfully');
			res.redirect('/contributor');
		}).catch(err => {
			let msg = err.error ? err.error.err : err.message;

			if (typeof msg === 'undefined' || msg.length === 0) {
				req.addFlash('errors', "Error occurred while processing your request. Please contact us at pete@forceprotocol.io or telegram https://t.me/triforcetokens and we will resolve the issue as soon as possible.");
				return res.redirect("/");
			}

			rUtil.errorResponseRedirect(err, req, res, '/');
		});
	},



	/**
     * Return the reset password form
     */
	getResetPassword: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		// Make sure token is valid
		var resetToken = req.param("token");

		if (typeof resetToken == 'undefined') {
			req.addFlash('errors', 'Your reset link has expired. Please complete the password reset form again.');
			return res.redirect("/");
		}

		return res.view('public/reset-password', {
			layout: 'public/layout',
			title: 'Force Protocol | Reset Your Password',
			metaDescription: 'Force Protocol Reset Password Form',
			recaptchaForm: recaptcha.toHTML()
		});
	},


	/**
     * Return the reset password form
     */
	postResetPassword: function (req, res) {

		// Confirm recapture success
		var data = {
			remoteip: req.connection.remoteAddress,
			response: req.param("g-recaptcha-response"),
			secret: RECAPTCHA_PRIVATE_KEY
		};

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY, data);

		recaptcha.verify(function (success, error_code) {

			if(!success){
				req.addFlash('errors', 'You did not complete the captcha field.');
				return res.redirect("/reset-password/" + resetToken);
			}else{

				// Make sure token is valid
				var resetToken = req.param("token");

				if (typeof resetToken == 'undefined' || !req.token || !req.token.user.id) {
					req.addFlash('errors', 'Your reset link has expired. Please complete the password reset form again.');
					return res.redirect("/");
				}

				let password = req.param('password'),
				pwdChk = req.param('password-check');

			    if(!_.isString(password) || password.length < 7){
		    		req.addFlash('errors', 'Please provide a valid password. Password length must be greater than 6');
					return res.redirect("/reset-password/" + resetToken);
			    }

			    if(password !== pwdChk){
			      	req.addFlash('errors', 'Your passwords did not match. Please check and try again.');
					return res.redirect("/reset-password/" + resetToken);
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

			      	if(!user || !user.length){
			      		throw new CustomError('Invalid request to process', {status: 404});
		    		}

			      return {msg: 'Your password has been updated successfully'};
			    };

			    processRequest()
			      .then(function(){
			      	req.addFlash('success', 'Your password has been changed successfully. Please login below.');
					return res.redirect("/contributor-login");
			      }).catch(err=> rUtil.errorResponseRedirect(err, req, res, '/'));
			  }
		});
	},





	/**
	 * Contributor Help To Release Coinpayments Funding
	 */
	getContributorHelp: function (req, res) {

		// First find the user by email
		if (typeof req.param("confirm") == 'undefined') {
			// Submit request to API server to find user by email
			request({
				method: 'GET',
				json: true,
				body: req.allParams(),
				uri: sails.config.API_URL + 'user/find/' + req.param("uid")
			}).then((rsp) => {
				sails.log.debug("user data:", rsp);
				return res.view('public/contributor-help', {
					layout: 'public/layout',
					title: 'We need your help',
					metaDescription: '',
					data: rsp
				});
			}).catch(err => {
				sails.log.debug("request error:", err);
				return res.redirect("/");
			});
		}

		// User agreed to release funding - confirm
		else {
			const processReq = async () => {
				return await request({
					method: 'GET',
					json: true,
					body: req.allParams(),
					uri: sails.config.API_URL + 'user/find/' + req.param("uid")
				});
			}

			// Submit request to API server to find user by email
			processReq().then(function (data) {

				request({
					method: 'GET',
					json: true,
					body: req.allParams(),
					uri: sails.config.API_URL + 'user/help-confirmed/' + req.param("uid")
				}).then((rsp) => {
					req.addFlash('success', 'thank you for your continued support. we will ensure your additional bonus is assigned to your account.');
					return res.view('public/contributor-help', {
						layout: 'public/layout',
						title: 'We need your help',
						metaDescription: '',
						data: data
					});
				}).catch(err => {
					sails.log.debug("request error:", err);
					req.addFlash('errors', 'there was a problem accepting your approval. please try again or contact us to make sure this is set.');
					return res.redirect("/contributor-help?uid=" + req.param("uid"));
				});
			}).catch(err => {
				sails.log.debug("request error:", err);
				req.addFlash('errors', 'there was a problem accepting your approval. please try again or contact us to make sure this is set.');
				return res.redirect("/contributor-help?uid=" + req.param("uid"));
			});
		}

	},


	/**
	* Return the Contact Us
	*/
	getContact: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/contact', {
			layout: 'public/layout',
			title: 'Get in touch with the team',
			metaDescription: '',
			recaptchaForm: recaptcha.toHTML()
		});
	},
	postContact: function (req, res) {

		var fullName = req.param("fullName"),
			email = req.param("email"),
			message = req.param("message");

		// Confirm recapture success
		var data = {
			remoteip: req.connection.remoteAddress,
			response: req.param("g-recaptcha-response"),
			secret: RECAPTCHA_PRIVATE_KEY
		};


		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY, data);

		recaptcha.verify(function (success, error_code) {
			if (success) {

				message = "Sent From: " + email.trim() + " \n\r " + message;

				// Submit the email to the team
				let toField = {email: 'pete@forceprotocol.io', name: 'Pete Mardell'};
				MailchimpService.sendMandrillEmail(toField, 'pete@forceprotocol.io', "Website Enquiry", message);

				req.addFlash('success', 'Thank you for your enquiry. A member of the team will get back to you very soon.');

				return res.redirect('/contact');
			}
			else {
				console.log("error code:", error_code);
				req.addFlash('errors', 'There was a problem confirming your request. Please make sure you complete the captcha request.');
				return res.redirect('/contact');
			}
		});
	},




	resubmitKYC: function (req, res) {
		const userId = req.session.user.id;
		let ssic = 'UNKNOWN',
			ssoc = 'UNKNOWN',
			onboardingMode = 'NON FACE-TO-FACE',
			paymentMode = 'VIRTUAL CURRENCY',
			productServiceComplexity = 'SIMPLE',
			firstName = req.param('firstName'),
			lastName = req.param('lastName'),
			email = req.param('email'),
			nationality = req.param('nationality'),
			country = req.param('country'),
			gender = req.param('gender'),
			dateOfBirth = req.param('dateOfBirth');

		let errMsgs = [];

		sails.log.info(ssic, ssoc, onboardingMode, paymentMode, productServiceComplexity,
			firstName, lastName, email, nationality, country, gender, dateOfBirth);

		ArtemisApiService.submitIndividual(ssic, ssoc, onboardingMode, paymentMode, productServiceComplexity,
			firstName, lastName, email, nationality, country, gender, dateOfBirth, userId)
			.then(function (response) {
				request({
					method: 'POST',
					json: true,
					body: {
						userId: userId,
						approvalStatus: response.approval_status,
						checkStatusUrl: response.check_status_url
					},
					uri: sails.config.API_URL + 'update-user-kyc'
				}).then((rsp) => {
					return res.json({ status: 'success', rfrId: rsp[0].id, validateToken: rsp[0].validateToken });
				}).catch(err => {
					let msg = err.error ? err.error.err : err.message;
					sails.log.error("Failed to update the users step 1 KYC information:", err);
					errMsgs.push("<p>The KYC process checks have stalled. Please try to enter your information again. If the problem persist please contact us in our <a href=\"https://t.me/triforcetokens\">telegram channel</a>.</p>");
					return res.json({ status: 'error', errMsgs: errMsgs });
				});
			})
			.catch(function (err) {
				let msg = err.error ? err.error.err : err.message;
				sails.log.error("Failed to get a good response from Artemis API for KYC step 1:", err);
				errMsgs.push("<p>The KYC process checks have stalled. Please try to enter your information again. If the problem persist please contact us in our <a href=\"https://t.me/triforcetokens\">telegram channel</a>.</p>");
				return res.json({ status: 'error', errMsgs: errMsgs });
			});
	},

	/** Step 2 KYC - document uploads
	*/
	postKycStep2: function (req, res) {

		var userId = req.session.user.id,
			validateToken = '';

		let idDocPath = null,
			selfieDocPath = null;

		var validFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

		const processReq = async () => {

			var uploadDocId = 0, uploadSelfieId = 0;


			// Process the ID document upload
			let uploadDocToArtemisRsp = new sails.bluebird(function (resolve, reject) {

				req.file('uploadDocument').upload(function (err, files) {

					if (err) {
						sails.log.error("Upload Selfie file failed: ", err.message);
						return reject(err);
					}

					var fdExtId = files[0].fd.substr((files[0].fd.lastIndexOf('.') + 1));
					var newFileFd = '.tmp/uploads/' + userId + '-IDDoc.' + fdExtId;
					idDocPath = _.clone(newFileFd);

					fs.rename(files[0].fd, newFileFd, function (err) { });

					// Make sure filetype is acceptable
					if (validFileTypes.indexOf(files[0].type) < 0) {
						//fs.unlinkSync(files[0].fd);
						return resolve({ status: 'error', err: ["<p>The ID document you uploaded is not a valid image format. It must be a .png, .gif, .jpeg or .jpg only.</p>"] });
					}

					// Make sure file size is not greater than 4MB
					if (files[0].size > 4231267) {
						//fs.unlinkSync(files[0].fd);
						return resolve({ status: 'error', err: ["<p>The ID document image uploaded is too big. Please reduce the size so it is less than 4MB in size.</p>"] });
					}


					return resolve({ status: 'success', fileFd: newFileFd, fileName: files[0].filename, mimeType: files[0].type });
				});

			});

			// Process the SELFIE document upload
			let uploadSelfieToArtemisRsp = new sails.bluebird(function (resolve, reject) {

				req.file('uploadSelfie').upload(function (err, files) {

					if (err) {
						sails.log.error("Upload Selfie file failed: ", err);
						return reject(err);
					}

					var fdExtId = files[0].fd.substr((files[0].fd.lastIndexOf('.') + 1));
					var newFileFd = '.tmp/uploads/' + userId + '-Selfie.' + fdExtId;
					selfieDocPath = _.clone(newFileFd);
					fs.rename(files[0].fd, newFileFd, function (err) { });

					// Make sure filetype is acceptable
					if (validFileTypes.indexOf(files[0].type) < 0) {
						//fs.unlinkSync(files[0].fd);
						return resolve({ status: 'error', err: ["<p>The Selfie document you uploaded is not a valid image format. It must be a .png, .gif, .jpeg or .jpg only.</p>"] });
					}

					// Make sure file size is not greater than 4MB
					if (files[0].size > 4231267) {
						//fs.unlinkSync(files[0].fd);
						return resolve({ status: 'error', err: ["<p>The Selfie document image uploaded is too big. Please reduce the size so it is less than 4MB in size.</p>"] });
					}

					return resolve({ status: 'success', fileFd: newFileFd, fileName: files[0].filename, mimeType: files[0].type });
				});

			});

			// Once all files uploaded and verified, process it
			let finalKyc2Process = await sails.bluebird.all([uploadDocToArtemisRsp, uploadSelfieToArtemisRsp]);

			uploadDocToArtemisRsp = finalKyc2Process[0];
			uploadSelfieToArtemisRsp = finalKyc2Process[1];


			var postUploadDocToArtemisRsp = '',
				postUploadSelfieToArtemisRsp = '';


			if (uploadDocToArtemisRsp.status == 'success') {
				postUploadDocToArtemisRsp = await ArtemisApiService.docPostApi(userId, uploadDocToArtemisRsp.fileFd, uploadDocToArtemisRsp.fileName, uploadDocToArtemisRsp.mimeType);
				//Get file ext:
				var fdExt = uploadDocToArtemisRsp.fileFd.substr((uploadDocToArtemisRsp.fileFd.lastIndexOf('.') + 1));
			}
			// ID document upload failed
			else {
				return { status: 'error', errMsgs: uploadDocToArtemisRsp.err };
			}

			if (uploadSelfieToArtemisRsp.status == 'success') {
				postUploadSelfieToArtemisRsp = await ArtemisApiService.docPostApi(userId, uploadSelfieToArtemisRsp.fileFd, uploadSelfieToArtemisRsp.fileName, uploadSelfieToArtemisRsp.mimeType);

				//Get file ext:
				var fdExt = uploadSelfieToArtemisRsp.fileFd.substr((uploadSelfieToArtemisRsp.fileFd.lastIndexOf('.') + 1));
			}
			// ID document upload failed
			else {
				return { status: 'error', errMsgs: uploadSelfieToArtemisRsp.err };
			}


			// If we are here then all documents uploaded correctly
			// Now need to do document comparison
			let artemisFaceCheckRsp = await ArtemisApiService.facePostApi(userId, postUploadDocToArtemisRsp.id, postUploadSelfieToArtemisRsp.id);

			// If no match - we need user to re-upload documents
			var faceMatchResult = artemisFaceCheckRsp.compare_result;

			// Record all results so far against the user in API server - NOT CRITICAL
			function requestPromise(_rsp) {
				return new Promise((resolve, reject) => {
					request({
						method: 'POST',
						json: true,
						body: {
							userId: userId,
							documentId: postUploadDocToArtemisRsp.id,
							selfieId: postUploadSelfieToArtemisRsp.id,
							faceMatchResult: faceMatchResult,
							approvalStatus: _rsp.approval_status
						},
						uri: sails.config.API_URL + 'update-user-kyc-2'
					}).then((rsp) => {
						resolve();
					}).catch(err => {
						sails.log.error("POST request to API kyc step2 failed:", err);
						resolve({ status: 'error', errMsgs: ["<p></p>"] });
					});
				});
			}

			let rsp = {};

			if (faceMatchResult != 'MATCH') {
				rsp = { approval_status: 'PENDING' };
				// await requestPromise();
				// return {status:'error',errMsgs:["<p>Your document ID and Selfie could not pass the facial recognition. Please make sure the scanned images are clear.</p>",
				// 	"<p>The most likely cause will be the ID document you uploaded. If you have another type of ID it might be worth trying that instead.</p>",
				// 	"<p>If you are struggling to get a match on your documents please message us in <a href=\"https://t.me/triforcetokens\">telegram</a> or send an email to jake@forceprotocol.io and we will make sure to get your issue resolved.</p>"]};
			} else {
				// Perform final check if we can auto approve this person with Artemis
				rsp = await ArtemisApiService.finalReportCheckApi(userId);

				if (rsp.approval_status == 'ACCEPTED' || rsp.approval_status == 'CLEARED') {
					System.findOne({ key: 'whitelist-spaces-taken' }).exec(function (err, whitespaces) {

						if (typeof whitespaces !== 'undefined') {
							var whiteSpacesTaken = parseInt(whitespaces['value']) + 1;

							System.update({ key: 'whitelist-spaces-taken' }, { value: whiteSpacesTaken }).exec(function (err, updated) {
							});
						}
					});
				}


			}



			await requestPromise(rsp);

			if (rsp.approval_status == 'ACCEPTED' || rsp.approval_status == 'CLEARED') {
				// req.addFlash('success', 'Congratulations! You are now a fully approved contributor and may enter the token sale as soon as it starts. The Ether address you need to send funds to will appear here inside your account.');
				return { status: 'cleared' };
			} else if (rsp.approval_status == 'PENDING') {
				return { status: 'pending' };
			} else {
				// req.addFlash('success', 'Thank you for completing the KYC process. We are just awaiting final approval of your documentation before we can whitelist you and allow you to contribute. This should not take much longer than a couple of hours and in most cases you will be approved.');
				return { status: 'success' };
			}

		}


		processReq().then(res.ok).catch(function (err) {
			sails.log.error('postKycStep2', err);

			// check if we successfully received their docs, if yes then don't show error message
			if (idDocPath && selfieDocPath && fs.existsSync(idDocPath) && fs.existsSync(selfieDocPath)) {

				request({
					method: 'POST',
					json: true,
					body: {
						userId: userId,
						documentId: -1,
						selfieId: -1,
						approvalStatus: 'PENDING'
					},
					uri: sails.config.API_URL + 'update-user-kyc-2'
				}).then((rsp) => {
					// req.addFlash('success', 'Thank you for completing the KYC process. We are just awaiting final approval of your documentation before we can whitelist you and allow you to contribute. This should not take much longer than a couple of hours and in most cases you will be approved.');
					res.ok({ status: 'pending', msg: 'Thank you for completing the KYC process. We are just awaiting final approval of your documentation before we can whitelist you and allow you to contribute. This should not take much longer than a couple of hours and in most cases you will be approved.' });
				}).catch(err => {
					sails.log.error("POST request to API kyc step2 failed:", err);
					res.ok({ status: 'error', errMsgs: ["<p></p>"] });
				});


			} else {
				return res.ok({
					status: "error",
					errMsgs: ["<p>There was a problem in processing your information. Please contact us for manual approval. We apologise for the issues but this is sometimes unaviodable for KYC.</p>"]
				});

			}
		});

	},





	/**
	* Return the twitter tool page
	*/
	getTwitterTool: function (req, res) {
		return res.view('public/twittertool', {
			layout: 'public/layout',
			title: 'Twitter Bounty Tool',
			metaDescription: ''
		});
	},

	/**
	* Return the twitter tool page
	*/
	postTwitterTool: function (req, res) {

		// Get bounty follower IDs
		if (req.param("action") == 'getUserIds') {

			TwitterFollowers.find().exec(function (err, users) {

				if (err) {
				} else {

					for (var i = 0; i < 1270; i++) {

						(function (i) {
							setTimeout(function () {

								if (typeof users[i] == 'undefined') {
									return;
								}

								TwitterApiService.findTwitterIdsFromUsername(req.param('bearer_token'), users[i].username.trim()).then(function (userId) {

									console.log("Username: " + users[i].username);
									console.log("Original user ID: " + users[i].uid);
									console.log("new user ID: " + userId);
									console.log("-----------------------------");

									if (users[i].uid != userId) {
										TwitterFollowers.update({ username: users[i].username }, { uid: userId }).exec(function (err, updated) {
											if (err) {
												console.log("didn't update: ", err);
											} else {
											}
										});
									}

								}).catch(function (err) {
									console.log("Failed on username: " + users[i].username);
									console.log("Reason: ", err);
									console.log("-----------------------------");
								});

							}, 1300 * i);
						})(i);

					}

				}

			});

			res.redirect('/tools/bounty/twitter');
		}

		// Add a new twitter follower to campaign
		else if (req.param("action") == 'addFollower') {

			TwitterFollowers.create(req.allParams()).then((result) => {
				if (result.length < 1) {
					throw new Error('Could not add new twitter follower - no form data or valid data from form.');
				}

				req.addFlash('success', 'New bounty follower was added.');
				res.redirect('/tools/bounty/twitter');
			}).catch(err => {
				sails.log('tw-err', err);
				req.addFlash('errors', 'There was a problem adding that follower: ' + err.message);
				res.redirect('/tools/bounty/twitter');
			});

		}

		// Download twitter followers spreadsheet
		else if (req.param("action") == 'downloadSpreadsheet') {
			var json2csv = require('json2csv');
			var fields = ['createdAt', 'uid', 'username', 'bitcoinTalkUsername', 'bitcoinTalkProfile', 'followers', 'retweets', 'likes', 'stakes', 'ethAddress'];

			TwitterFollowers.find({ select: ['createdAt', 'uid', 'username', 'bitcoinTalkUsername', 'bitcoinTalkProfile', 'followers', 'retweets', 'likes', 'stakes', 'ethAddress'] }).exec(function (err, list) {

				if (err) {
					sails.log.error("Failed to download /find twitter followers in db", err);
				}

				json2csv({ data: list, fields: fields }, function (err, csv) {
					if (err) {
						console.error(err);
						req.addFlash('errors', 'There was a problem downloading the spreadsheet');
						res.redirect('/tools/bounty/twitter');
					}

					res.attachment("twitter-bounty-followers.csv");
					res.end(csv, 'UTF-8');
				});

			});
		}


		// Perform a check of tweet retweets and likes for followers
		else if (req.param("action") == 'checkTweet') {
			TwitterApiService.checkRetweets(req.param('bearer_token'), req.param('tweetId'), -1).then(function (retweetUsers) {
				res.redirect('/tools/bounty/twitter');
			}).catch(function (err) {
				req.addFlash('errors', 'There was a problem checking retweets and likes');
				res.redirect('/tools/bounty/twitter');
			});
		}


		// Perform a check of tweet retweets and likes for followers
		else if (req.param("action") == 'connectToStream') {
			TwitterApiService.connectStream().then(function (connection) {
				req.addFlash('success', 'Connected to stream API');
				res.redirect('/tools/bounty/twitter');
			}).catch(function (err) {
				req.addFlash('errors', 'There was a problem connecting to stream API');
				res.redirect('/tools/bounty/twitter');
			});
		}

		else if (req.param("action") == 'runCpaLead') {
			request({
				method: 'POST',
				json: true,
				body: {
					userId: req.param("userId")
				},
				uri: sails.config.API_URL + 'confirm-runcpa-lead'
			}).then((rsp) => {
				req.addFlash('success', 'RunCPA Lead Confirmed');
				res.redirect('/tools/bounty/twitter');
			}).catch(err => {
				sails.log.error("POST request to API kyc step2 failed:", err);
				resolve({ status: 'error', errMsgs: ["<p></p>"] });
			});
		}

		// remove excess stakes from followers
		/*
		else if(req.param("action") == 'removeFollowersAsStakes'){
			var csv = require('fast-csv');
			var stream = fs.createReadStream("C:/wamp2/www/forceprotocol.io/remove-followers-from-stakes.csv");

			var csvStream = csv()
				.on("data", function(data){

					var username = data[0].trim(),
					followers = parseInt(data[1].trim());

					TwitterFollowers.findOne({username:username}).exec(function(err,user){

						if(err || typeof user == 'undefined'){
						}else{

							// Check if their stake count is above follower count
							if(user.stakes >= followers){
								console.log("User Stakes is greater than followers: ",user.stakes,followers);

								// calculate the stakes they should have
								var realStakes = (user.retweets * 20) + (user.likes * 5) + 105;

								// This means we added their follower count to their stake count by mistake
								if(realStakes < user.stakes){

									TwitterFollowers.update({username:username},{stakes:realStakes}).exec(function(err,updated){

										if(err || typeof user == 'undefined'){
										}else{
										}

									});
								}
							}

						}

					});

					console.log("-----");
				})
				.on("end", function(){
					 console.log("done");
				});

			stream.pipe(csvStream);

			req.addFlash('success', 'Tried to parse CSV');
			res.redirect('/tools/bounty/twitter');
			}
			*/

	},



	/**
	* Return the twitter tool page
	*/
	getPartnerResults: function (req, res) {
		var refId = req.param("refId"),
			accessToken = req.param("accessToken");

		request({
			method: 'GET',
			json: true,
			uri: sails.config.API_URL + 'partner/results/' + refId + '/' + accessToken,
		}).then((rsp) => {
			return res.json(rsp);
		}).catch(err => {
			return res.json({ error: true, errorMsg: err.message });
		});

	},


	/**
	* Return the airdrop signup page
	*/
	getAirdrop: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/airdrop', {
			layout: 'public/layout',
			title: 'Pre-register for the Airdrop Campaign!',
			metaDescription: 'Join today to claim your stake of the airdrop pot for FORCE tokens',
			recaptchaForm: recaptcha.toHTML()
		});
	},


	postAirdrop: function (req, res) {

		var email = req.param("email"),
			wallet = req.param("wallet");

		// Confirm recapture success
		var data = {
			remoteip: req.connection.remoteAddress,
			response: req.param("g-recaptcha-response"),
			secret: RECAPTCHA_PRIVATE_KEY
		};


		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY, data);

		recaptcha.verify(function (success, error_code) {
			if (success) {
				AirdropUsers.create({email:email,wallet:wallet, reward: 5}).exec(function(err,result){
					err && sails.log.error(err);
					req.addFlash('success', 'Congrats! You have been subscribed to the AirDrop campaign');
					return res.redirect('/airdrop');
				});
			}
			else {
				req.addFlash('errors', 'There was a problem confirming your request. Please make sure you complete the captcha request.');
				return res.redirect('/airdrop');
			}
		});
	},



	postCoinbaseWebhook: async(req,res) => {
		try{
			const Webhook = require('coinbase-commerce-node').Webhook;
			var event;

			event = await Webhook.verifyEventBody(
				req.rawBody,
				req.headers['x-cc-webhook-signature'],
				sails.config.COINBASE_COMMERCE_SHARED_SECRET
			);

			throw new Error("No customer ID found.");
			
			
			// Find user
			let user = await User.findOne({id:event.data.metadata.customer_id});

			if(!user){
				throw new Error("No user was found from customer ID: " + event.data.metadata.customer_id);
			}

			let emailOptions = {fromEmail:"do-not-reply@forceprotocol.io",fromName:"Force Protocol",toEmail:user.email,toName:user.firstName,subject:'',body:''},
			emailOptionsStaff = {fromEmail:"do-not-reply@forceprotocol.io",fromName:"Force Protocol",toEmail:"pete@forceprotocol.io",toName:"Pete Mardell",subject:'',body:''};

			if(event.type == "charge:created"){
				emailOptions.subject = "New pending order for FORCE tokens created";
				emailOptions.body = `Hi ${user.firstName}<br /><br />
				A new order has been created for you to purchase FORCE tokens. You can complete your order at the following link if you have not already done so:<br /><br />
				<a href="${event.data.hosted_url}">Complete Order Here</a><br /><br />
				If you have any difficulties please don't hesistate to <a href="${sails.config.BASE_URL}/contact">contact us</a>.<br />
				The Force Protocol Team`;
				EmailService.sendEmail(emailOptions);
			}else if(event.type == "charge:confirmed"){
				emailOptions.subject = "Order Completed";
				emailOptions.body = `Hi ${user.firstName}<br /><br />
				Thank you for completing your order for FORCE tokens.<br />
				Please allow our team time to verify the transaction and approve the issuance of your tokens.<br />
				You will be notified once your tokens have been distributed to the following Ether address: ${user.whitelistEthAddress}<br /><br />
				If you have any questions in the meantime, please don't hesistate to <a href="${sails.config.BASE_URL}/contact">contact us</a>.<br /><br />
				The Force Protocol Team`;
				EmailService.sendEmail(emailOptions);


				// Create ico_transaction record against user
				let blockNumber = '',
				transactionHash = '',
				logId = event.id,
				weiContribution = '',
				forceEarned = '',
				forceBonus = '',
				emailMsgExt = '',
				statusId = 1;

				// Calculate bonus
		      	let currentBonus = await CpService.getCurrentBonus();

		      	// Create temporary transaction for user
		      	let icoTransaction = await IcoTransaction.create({beneficiary:user.whitelistEthAddress,weiContribution:weiContribution,
					forceEarned:forceEarned,forceBonus:forceBonus,blockNumber:blockNumber,transactionHash:transactionHash,statusId:1,logId:logId,
					user:user.id});

		      	if(!icoTransaction){
					sails.log.error("Failed to create transaction for user: " + user.id);
					emailMsgExt += "Failed to create transaction for user: " + user.id;
				}

				if(event.data.payments[0]){
					if(event.data.payments[0].block.hash){
						blockNumber = event.data.payments[0].block.hash;
					}

					if(event.data.payments[0].transaction_id){
						transactionHash = event.data.payments[0].transaction_id;
					}

					if(event.data.payments[0].value.local.amount){
						if(event.data.payments[0].value.local.currency == 'ETH'){
							weiContribution = ethUnits.convert(event.data.payments[0].value.local.amount, 'eth', 'wei');
						}else if(event.data.payments[0].value.local.currency == 'BTC'){
							// Convert the BTC value to ETH
							let btcToEth = await CoinbaseService.btcToEth(event.data.payments[0].value.local.amount);
							weiContribution = ethUnits.convert(btcToEth, 'eth', 'wei');
							emailMsgExt += " | user paid in BTC ";
						}else{
							emailMsgExt += " | user made payment not in ETH or BTC? it was: " + event.data.payments[0].value.local.currency + " ";
						}

						forceEarned = ethUnits.convert(event.data.metadata.forceExBonus,'eth','wei');
						forceBonus = ethUnits.convert(event.data.metadata.forceBonus,'eth','wei');
						weiExpected = ethUnits.convert(event.data.metadata.totalCurrencyRequired, 'eth', 'wei');

						// If user sent enough currency, then issue the tokens
						let weiContributionInt = new bigNumber(weiContribution),
						weiExpectedInt = new bigNumber(weiExpected),
						permittedWeiDifference = weiExpectedInt.minus('500000000000000');

						if(weiContributionInt.isLessThan(permittedWeiDifference)){
							emailMsgExt += " | User didn't make enough payment : their contribution: " + weiContribution +  " & Expected: " + weiExpected;
						}
						// Issue their tokens
						else{
							sails.log.debug("issuing tokens to user");
							emailMsgExt += "Attempting to automatically issue tokens to user ";

							let forceTotalWei = new bigNumber(forceEarned).add(forceBonus);
							sails.log.debug("attempting to mint and send force tokens: ",forceTotalWei.toString());
							let mintTokens = false;
							//let mintTokens = await BlockchainService.contracts.Token.mintTokens(user.whitelistEthAddress,forceTotalWei.toString());
							//sails.log.debug("MintTokens Call result: ",mintTokens);

							// Something went wrong trying to mint force tokens and send to user
							if(!mintTokens){
								emailMsgExt += " | New tokens were NOT minted or sent to users wallet ";
							}else{
								// Set that this txn was paid
								icoTransaction = await IcoTransaction.update({id:icoTransaction.id},{statusId:2});
								emailMsgExt += " | New tokens have been minted and sent to users wallet ";
							}

						}
					}
				}

				emailOptionsStaff.subject = "New FORCE Token Order Completed";
				emailOptionsStaff.body = `New customer completed order:<br /><br />
				User ID: ${user.id}<br />
				Email: ${user.email}<br />
				Charge ID: ${event.data.id}<br />
				Whitelisted ETH Address: ${user.whitelistEthAddress}<br />
				Description: ${event.data.description}<br />
				Price: ${event.data.pricing.local.amount} ${event.data.pricing.local.currency}<br />
				Other details: ${emailMsgExt}`;
				EmailService.sendEmail(emailOptionsStaff);
			}

			return res.ok({received:true});
		}catch(err){
			return res.serverError({failed:err});
		}
	},


	/**
	* Return the home page
	*/
	whitePaper: function (req, res) {
		return res.redirect("/resources/general-whitepaper-v2.1.pdf");
	},

	/**
	* Mint Force TO wallet
	*/
	testMintForce: async (req, res)=>{
		try{
			let forceWei = '5000',
			emailMsgExt = '',
			whitelistEthAddress = "0x0FB45eF2153d59Cd10f755281a5A4ADa19Fc5403";

			let mintTokens = await BlockchainService.contracts.Token.mintTokens(whitelistEthAddress,forceWei);
			sails.log.debug("MintTokens Call result: ",mintTokens);

			// Something went wrong trying to mint force tokens and send to user
			if(!mintTokens){
				emailMsgExt = " | New tokens were NOT minted or sent to users wallet ";
			}else{
				// Set that this txn was paid
				icoTransaction = await IcoTransaction.update({id:icoTransaction.id},{statusId:2});
				emailMsgExt = " | New tokens have been minted and sent to users wallet ";
			}

			return res.ok({success:true});
		}catch(err){
			sails.log.debug("testMintForce err:",err);
			return res.ok({error:true});
		}
	},

};
