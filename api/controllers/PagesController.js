/**
 * PagesController
 *
 * @description :: Server-side logic for managing Pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

const request = require('request-promise'),
	Recaptcha = require('recaptcha-v2').Recaptcha,
	fs = require('fs');

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


		function next() {
			return res.view('public/home', {
				layout: 'public/layout',
				title: 'TriForce Tokens Ltd',
				metaDescription: 'TriForce Tokens will become the industry standard on multiple gaming platforms introducing new revenue models. Join our crypto-currency ICO crowdfund today.',
				recaptchaForm: recaptcha.toHTML()
			});
		}

		//check if user is already logged-in
		if (req.cookies && req.cookies.token && !req.session.token) {

			request({
				method: 'GET',
				uri: sails.config.API_URL + 'user',
				json: true,
				headers: {
					'Authorization': 'Bearer ' + req.cookies.token
				},
			}).then((rsp) => {
				req.session.user = rsp;
				req.session.token = req.cookies.token;

				next();
			})
				.catch(err => {
					sails.log('login token error: ', err);
					next();
				});

		} else {
			next();
		}

	},


	/**
	* Return the login page
	*/
	getLogin: function (req, res) {

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/login', {
			layout: 'public/layout',
			title: 'TriForce Tokens User Account Login',
			metaDescription: 'TriForce Tokens will become the industry standard on multiple gaming platforms introducing new revenue models. Join our crypto-currency ICO crowdfund today.',
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
			title: 'TriForce Tokens - Enter Token Sale',
			metaDescription: 'TriForce Tokens will become the industry standard on multiple gaming platforms introducing new revenue models. Join the gaming revolution today.',
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

		// Check if this is referral ID by cookie
		if (typeof req.cookies !== 'undefined' && typeof req.cookies.track_id !== 'undefined') {
			referrerId = req.cookies.track_id;

			if (typeof req.cookies.track_id_web_id !== 'undefined') {
				referrerWebId = req.cookies.track_id_web_id;
			}
		} else if (typeof req.cookies.run_cpa_track_id !== 'undefined') {
			runCpaId = req.cookies.run_cpa_track_id;
		}

		Subscribers.findOrCreate({ email: email, referrerId: referrerId, referrerWebId: referrerWebId, runCpaId: runCpaId, runCpaTrackedOn: new Date(), active: true }).exec(function (err, created) {
			if (err || typeof created == 'undefined') {
				sails.log.error("failed to subscribe: ", err, email);
				return res.ok({ status: "error", msg: "Failed to subscribe you, please try again." });
			}

			/** Add to normal subscriber list **/
			MailchimpService.addSubscriber("4cd285b73f", email, "", "", "pending").then(function (addResponse) {
			}).catch(function (err) {
				sails.log.debug("new subscriber not added due to error: ", err);
			});

			req.addFlash('success', 'Thank you for subscribing to future updates. Please check your email inbox and possibly junk inbox for your confirmation email.');

			return res.ok({ status: "success", msg: "You have been successfully subscribed and will be kept updated about the ICO. Please check your email inbox and possibly junk inbox for your confirmation email." });
		});
	},



	/**
	* Pre-Sale Subscribe User
	*/
	preSaleSubscribeUser: function (req, res) {

		var email = req.param("email"),
			firstName = req.param("firstName"),
			lastName = req.param("lastName"),
			referrerId = '',
			referrerWebId = '',
			runCpaId = '';

		// Check if this is referral ID by cookie
		if (typeof req.cookies !== 'undefined' && typeof req.cookies.track_id !== 'undefined') {
			referrerId = req.cookies.track_id;

			if (typeof req.cookies.track_id_web_id !== 'undefined') {
				referrerWebId = req.cookies.track_id_web_id;
			}
		} else if (typeof req.cookies.run_cpa_track_id !== 'undefined') {
			runCpaId = req.cookies.run_cpa_track_id;
		}

		// Submit post request to LTF subscribe list
		var ltfFormVars = {
			'cm-f-dytkwut': firstName,
			'cm-f-dytkwui': lastName,
			'cm-udlhydk-udlhydk': email
		};

		// Confirm recapture success
		var data = {
			remoteip: req.connection.remoteAddress,
			response: req.param("g-recaptcha-response"),
			secret: RECAPTCHA_PRIVATE_KEY
		};


		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY, data);

		recaptcha.verify(function (success, error_code) {

			if (success) {
				request({
					method: 'POST',
					uri: 'http://login.yourcampaignmanager.co.uk/t/r/s/udlhydk/',
					formData: ltfFormVars,
					headers: {
						'content-type': 'application/x-www-form-urlencoded'
					}
				}).then((rsp) => {
				}).catch(err => {
				});


				Subscribers.findOrCreate({ email: email, firstName: firstName, lastName: lastName, referrerId: referrerId, referrerWebId: referrerWebId, runCpaId: runCpaId, runCpaTrackedOn: new Date(), active: true }).exec(function (err, created) {
				});

				req.addFlash('success', 'Thank you for registering your interest in joining the pre-sale. Please check your email inbox and possibly junk inbox for your confirmation email.');

				return res.ok({ status: "success", msg: "You have been successfully subscribed and will be kept updated about the ICO. Please check your email inbox and possibly junk inbox for your confirmation email." });
			} else {
				console.log("error code:", error_code);
				req.addFlash('errors', 'There was a problem confirming your request. Please make sure you complete the captcha request.');
				return res.ok({ status: "error", msg: "Your join request could not be sent, due to an invalid captcha. Please complete the captcha question." });
			}
		});

	},



	/**
	* Return the survey
	*/
	getSurvey: function (req, res) {
		return res.view('public/survey', {
			layout: 'public/layout',
			title: 'TriForce Tokens - Market Research Survey',
			metaDescription: 'A real digital currency to use in every game you play.'
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
	* Return the friends and family landing page
	*/
	getFriendsSupport: function (req, res) {
		return res.view('public/friends-support', {
			layout: 'public/layout',
			title: 'Special friends and family discount for FORCE tokens',
			metaDescription: ''
		});
	},


	/**
	* Return the friends and family landing page
	*/
	postFriendsSupport: function (req, res) {
		return res.view('public/friends-support', {
			layout: 'public/layout',
			title: 'Special friends and family discount for FORCE tokens',
			metaDescription: ''
		});
	},



	/**
	* Return the join landing page uk
	*/
	getJoinUk: function (req, res) {

		return res.redirect("/");
		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/landingpage/join', {
			layout: 'public/layout',
			title: 'Join TriForce Tokens today',
			metaDescription: 'We will keep you informed of updates as we lead up to our next Token Sale on 20th Feb 2018',
			recaptchaForm: recaptcha.toHTML()
		});
	},

	/**
	* Return the join landing page uk
	*/
	getJoinLocale: function (req, res) {

		return res.redirect("/");
		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);

		return res.view('public/landingpage/join', {
			layout: 'public/layout',
			title: 'Join TriForce Tokens today',
			metaDescription: 'We will keep you informed of updates as we lead up to our next Token Sale on 20th Feb 2018',
			locale: req.param('locale'),
			recaptchaForm: recaptcha.toHTML()
		});
	},


	/**
	* Pre-Sale Subscribe User
	*/
	postJoinLandingPage: function (req, res) {

		var email = req.param("email"),
			firstName = req.param("firstName"),
			lastName = req.param("lastName"),
			referrerId = '',
			referrerWebId = '',
			runCpaId = '',
			ltfUrl = req.param('ltfUrl'),
			successPage = req.param('ltfSuccessPage');

		// Check if this is referral ID by cookie
		if (typeof req.cookies !== 'undefined' && typeof req.cookies.track_id !== 'undefined') {
			referrerId = req.cookies.track_id;

			if (typeof req.cookies.track_id_web_id !== 'undefined') {
				referrerWebId = req.cookies.track_id_web_id;
			}
		} else if (typeof req.cookies.run_cpa_track_id !== 'undefined') {
			runCpaId = req.cookies.run_cpa_track_id;
		}

		if (typeof successPage == 'undefined' || successPage.length < 1) {
			successPage = '/';
		}

		// Submit post request to LTF subscribe list
		var ltfFormVars = {
			[req.param('firstNameFieldValue')]: firstName,
			[req.param('lastNameFieldValue')]: lastName,
			[req.param('emailFieldValue')]: email
		};

		// Confirm recapture success
		var data = {
			remoteip: req.connection.remoteAddress,
			response: req.param("g-recaptcha-response"),
			secret: RECAPTCHA_PRIVATE_KEY
		};

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY, data);

		recaptcha.verify(function (success, error_code) {

			if (success) {
				request({
					method: 'POST',
					uri: ltfUrl,
					formData: ltfFormVars,
					headers: {
						'content-type': 'application/x-www-form-urlencoded'
					}
				}).then((rsp) => {
				}).catch(err => {
				});

				Subscribers.findOrCreate({ email: email, firstName: firstName, lastName: lastName, referrerId: referrerId, referrerWebId: referrerWebId, runCpaId: runCpaId, runCpaTrackedOn: new Date(), active: true }).exec(function (err, created) {
				});

				req.addFlash('success', 'Thank you for registering your interest in joining the pre-sale. Please check your email inbox and possibly junk inbox for your confirmation email.');

				return res.redirect(successPage);
			} else {
				req.addFlash('errors', 'There was a problem confirming your request. Please make sure you complete the captcha request.');
				return res.redirect(successPage);
			}
		});

	},



	/**
	* Return the subscriber thanks uk
	*/
	getThanksUk: function (req, res) {
		return res.view('public/subscriber/thanks-uk', {
			layout: 'public/layout',
			title: 'Congratulations on Joining TriForce Tokens',
			metaDescription: 'We will keep you informed of updates as we lead up to our next Token Sale on 20th Feb 2018'
		});
	},
	/**
	* Return the subscriber thanks Russia
	*/
	getThanksRussia: function (req, res) {
		return res.view('public/subscriber/thanks-russia', {
			layout: 'public/layout',
			title: 'Congratulations on Joining TriForce Tokens',
			metaDescription: 'We will keep you informed of updates as we lead up to our next Token Sale on 20th Feb 2018'
		});
	},
	/**
	* Return the subscriber thanks germany
	*/
	getThanksGermany: function (req, res) {
		return res.view('public/subscriber/thanks-germany', {
			layout: 'public/layout',
			title: 'Congratulations on Joining TriForce Tokens',
			metaDescription: 'We will keep you informed of updates as we lead up to our next Token Sale on 20th Feb 2018'
		});
	},
	/**
	* Return the subscriber thanks France
	*/
	getThanksFrance: function (req, res) {
		return res.view('public/subscriber/thanks-france', {
			layout: 'public/layout',
			title: 'Congratulations on Joining TriForce Tokens',
			metaDescription: 'We will keep you informed of updates as we lead up to our next Token Sale on 20th Feb 2018'
		});
	},
	/**
	* Return the subscriber thanks Spain
	*/
	getThanksSpain: function (req, res) {
		return res.view('public/subscriber/thanks-spain', {
			layout: 'public/layout',
			title: 'Congratulations on Joining TriForce Tokens',
			metaDescription: 'We will keep you informed of updates as we lead up to our next Token Sale on 20th Feb 2018'
		});
	},
	/**
	* Return the subscriber thanks Brazil
	*/
	getThanksBrazil: function (req, res) {
		return res.view('public/subscriber/thanks-brazil', {
			layout: 'public/layout',
			title: 'Congratulations on Joining TriForce Tokens',
			metaDescription: 'We will keep you informed of updates as we lead up to our next Token Sale on 20th Feb 2018'
		});
	},
	/**
	* Return the subscriber thanks Korea
	*/
	getThanksKorea: function (req, res) {
		return res.view('public/subscriber/thanks-korea', {
			layout: 'public/layout',
			title: 'Congratulations on Joining TriForce Tokens',
			metaDescription: 'We will keep you informed of updates as we lead up to our next Token Sale on 20th Feb 2018'
		});
	},
	/**
	* Return the subscriber thanks Japan
	*/
	getThanksJapan: function (req, res) {
		return res.view('public/subscriber/thanks-japan', {
			layout: 'public/layout',
			title: 'Congratulations on Joining TriForce Tokens',
			metaDescription: 'We will keep you informed of updates as we lead up to our next Token Sale on 20th Feb 2018'
		});
	},
	/**
	* Return the subscriber thanks China
	*/
	getThanksChina: function (req, res) {
		return res.view('public/subscriber/thanks-china', {
			layout: 'public/layout',
			title: 'Congratulations on Joining TriForce Tokens',
			metaDescription: 'We will keep you informed of updates as we lead up to our next Token Sale on 20th Feb 2018'
		});
	},



	/**
	* Submit the survey
	*/
	postSurvey: function (req, res) {
		var params = req.allParams();

		// Verify param values posted
		if (typeof params.email === 'undefined' ||
			params.email.length == 0) {
			req.addFlash('error', 'You should provide an email address with your response so we' +
				' can send your Bitcoin reward.');
		}


		// Subscribe this respondent
		if (typeof params.optin !== 'undefined') {
			Subscribers.create({ email: params.email, active: true }).exec(function (err, created) {

				if (err || typeof created == 'undefined') {
					sails.log.error("failed to subscribe from the survey: ", err, params);
				}

				req.addFlash('success', 'Thank you for subscribing to future updates.');
			});
		}

		if (typeof params.platforms == "undefined") {
			params.platforms = '';
		}

		if (params.hasRankingSystem == 'true') {
			params.hasRankingSystem = true;
		} else {
			params.hasRankingSystem = false;
		}

		SurveyResponses.create({
			email: params.email, rewardInPound: '50', companyType: params.companyType, platforms: params.platforms,
			largestRevenue: params.largestRevenue, inappRevenue: params.inappRevenue, switchProvider: params.switchProvider,
			offerOwnCurrency: params.offerOwnCurrency, offerPlayerBetting: params.offerPlayerBetting,
			offerPlayerItemTrading: params.offerPlayerItemTrading, goodIdea: params.goodIdea, hasRankingSystem: params.hasRankingSystem,
			useRankingSystem: params.useRankingSystem, becomeSupporter: params.becomeSupporter, comments: params.comments,
			reliability: params.rel, companyName: params.companyName
		}).exec(function (err, created) {

			if (err || typeof created == 'undefined') {
				sails.log.error("Failed to create survey response: ", err, params);
				req.addFlash('error', 'Sorry, there was a problem recording your survey results.' +
					' Please check your details and try again.');
				req.addFlash('error', 'If you are keep experiencing issues, please email us at support@triforcetokens.io.');
			} else {
				req.addFlash('success', 'Fantastic! Thank you for completing the survey. Once we analyse the results' +
					' we will be in touch about your Bitcoin reward.');
			}

			return res.redirect('/survey-for-bitcoin-2017');
		});
	},


	/**
	 * Return the slack invite page
	 */
	getSlackInvitePage: function (req, res) {
		return res.redirect("/");
	},

	/**
	 * Process the slack invite
	 */
	postSlackInvite: function (req, res) {
		return res.redirect("/");
	},

	/**
	 * Return the terms and conditions page
	 */
	getTermsConditions: function (req, res) {
		return res.view('public/terms', {
			layout: 'public/layout',
			title: 'TriForce Tokens Terms and Conditions',
			metaDescription: 'TriForce Tokens Terms and Conditions'
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
			metaDescription: 'TriForce Tokens Forgot Password',
			recaptchaForm: recaptcha.toHTML()
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

		recaptcha.verify(function (success, error_code) {

			if (success) {
				// Submit request to API server to issue password reset link
				request({
					method: 'POST',
					json: true,
					body: req.allParams(),
					uri: sails.config.API_URL + 'user/forgot-password'
				}).then((rsp) => {
					req.addFlash('success', 'A password reset link will be emailed to you. Please now check your inbox and possibly junk inbox for a password reset email.');
					res.redirect('/');
				}).catch(err => {
					let msg = err.error ? err.error.err : err.message;

					if (typeof msg == 'undefined' || msg.length == 0) {
						req.addFlash('errors', "There was a problem trying to issue you a reset password link. Please contact us at pete@triforcetokens.io or telegram https://t.me/triforcetokens and we will resolve the issue as soon as possible.");
						return res.redirect("/");
					}

					rUtil.errorResponseRedirect(err, req, res, '/');
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
			res.redirect('/');
		}).catch(err => {
			let msg = err.error ? err.error.err : err.message;

			if (typeof msg == 'undefined' || msg.length == 0) {
				req.addFlash('errors', "There was a problem with your link. Please contact us at pete@triforcetokens.io or telegram https://t.me/triforcetokens and we will resolve the issue as soon as possible.");
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
				req.addFlash('errors', "Error occurred while processing your request. Please contact us at pete@triforcetokens.io or telegram https://t.me/triforcetokens and we will resolve the issue as soon as possible.");
				return res.redirect("/");
			}

			rUtil.errorResponseRedirect(err, req, res, '/');
		});
	},



	/**
     * Return the reset password form
     */
	getResetPassword: function (req, res) {

		// Make sure token is valid
		var resetToken = req.param("token");

		if (typeof resetToken == 'undefined') {
			req.addFlash('errors', 'Your reset link has expired. Please complete the password reset form again.');
			return res.redirect("/");
		}


		return res.view('public/reset-password', {
			layout: 'public/layout',
			title: 'TriForce Tokens | Reset Your Password',
			metaDescription: 'TriForce Tokens Reset Password Form'
		});
	},


	/**
     * Return the reset password form
     */
	postResetPassword: function (req, res) {

		// Make sure token is valid
		var resetToken = req.param("token");

		if (typeof resetToken == 'undefined') {
			req.addFlash('errors', 'Your reset link has expired. Please complete the password reset form again.');
			return res.redirect("/");
		}

		// Submit request to API server to reset the password
		request({
			method: 'POST',
			json: true,
			body: req.allParams(),
			uri: sails.config.API_URL + 'user/reset-password'
		}).then((rsp) => {
			req.addFlash('success', 'Your password change has been accepted. Please now login to your account.');
			res.redirect('/');
		}).catch(err => {
			rUtil.errorResponseRedirect(err, req, res, req.path);
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
				MailchimpService.sendMandrillEmail([{ email: 'pete@triforcetokens.io', name: 'Pete Mardell' }], 'pete@triforcetokens.io', "Website Enquiry", message);

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



	/**
	* Return the KYC sign up form
	*/
	getJoinWhitelist: function (req, res) {
		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY);
		var whitelistSpacesTotal = 2001;
		var whitelistSpacesUsed = 1;

		System.findOne({ key: 'whitelist-spaces-available' }).exec(function (err, val) {
			if (typeof val !== 'undefined') {
				whitelistSpacesTotal = val['value'];
			}

			System.findOne({ key: 'whitelist-spaces-taken' }).exec(function (err, val) {

				if (typeof val !== 'undefined') {
					whitelistSpacesUsed = val['value'];
				}

				availableSeats = whitelistSpacesTotal - whitelistSpacesUsed;

				if (availableSeats < 1) {
					availableSeats = 0;
				}

				return res.view('public/join-whitelist', {
					layout: 'public/layout',
					title: 'Claim Your Space: Become an approved contributor today and enter the evolution in gaming.',
					metaDescription: '',
					availableSeats: availableSeats,
					recaptchaForm: recaptcha.toHTML("recaptchaCallback")
				});

			});
		});
	},


	/**
	* POST the KYC sign up form
	*/
	postJoinWhitelist: function (req, res) {
		return res.view('public/join-whitelist', {
			layout: 'public/layout',
			title: 'Reserve Your Seat: Become an approved contributor today and enter the revolution in gaming.',
			metaDescription: ''
		});
	},




	/** Step 1 KYC
	*/
	postKycStep1: function (req, res) {

		var ssic = 'UNKNOWN',
			ssoc = 'UNKNOWN',
			onboardingMode = 'NON FACE-TO-FACE',
			paymentMode = 'VIRTUAL CURRENCY',
			productServiceComplexity = 'SIMPLE',
			firstName = req.param('firstName'),
			lastName = req.param('lastName'),
			email = req.param('email'),
			password = req.param('password'),
			nationality = req.param('nationality'),
			country = req.param('country'),
			gender = req.param('gender'),
			dateOfBirth = req.param('dateOfBirth'),
			referrerId = '',
			runCpaId = '',
			referrerWebId = '';

		var errMsgs = [];

		// Check if this is referral ID by cookie
		if (typeof req.cookies !== 'undefined' && typeof req.cookies.track_id !== 'undefined') {
			referrerId = req.cookies.track_id;

			if (typeof req.cookies.track_id_web_id !== 'undefined') {
				referrerWebId = req.cookies.track_id_web_id;
			}
		} else if (typeof req.cookies.run_cpa_track_id !== 'undefined') {
			runCpaId = req.cookies.run_cpa_track_id;
		}

		// Submit post request to LTF subscribe list
		var ltfFormVars = {
			'cm-f-dytkwut': firstName,
			'cm-f-dytkwui': lastName,
			'cm-udlhydk-udlhydk': email
		};

		// Subscribe user to email sequence
		request({
			method: 'POST',
			uri: 'http://login.yourcampaignmanager.co.uk/t/r/s/udlhydk/',
			formData: ltfFormVars,
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			}
		}).then((rsp) => {
		}).catch(err => {
		});


		// Submit signup request to API server
		request({
			method: 'POST',
			json: true,
			body: {
				firstName: firstName,
				lastName: lastName,
				email: email,
				password: password,
				nationality: nationality,
				country: country,
				gender: gender,
				dateOfBirth: dateOfBirth,
				referrerId: referrerId,
				referrerWebId: referrerWebId,
				runCpaId: runCpaId,
				faceMatchResult: "MATCH",
				approvalStatus: "CLEARED"
			},
			uri: sails.config.API_URL + 'register-kyc'
		})
			.then((rsp) => {

				// User is already cleared for KYC
				if (rsp.status == 'cleared' || rsp.status == 'rejected') {
					req.addFlash('success', 'You have already completed the KYC process. Please login to your account.');
					return res.json(rsp);
				}

				req.session.user = rsp.user;
				req.session.token = rsp.token;
				// req.session.etherAddress = rsp.etherAddress;
				req.session.kyc = true;

				// Submit signup request to API server
				ArtemisApiService.submitIndividual(ssic, ssoc, onboardingMode, paymentMode, productServiceComplexity,
					firstName, lastName, email, nationality, country, gender, dateOfBirth, rsp.user.id).then(function (response) {

						// Submit Atremis response to update user in API server
						request({
							method: 'POST',
							json: true,
							body: {
								userId: rsp.user.id,
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


					}).catch(function (err) {
						let msg = err.error ? err.error.err : err.message;
						sails.log.error("Failed to get a good response from Artemis API for KYC step 1:", err);
						errMsgs.push("<p>The KYC process checks have stalled. Please try to enter your information again. If the problem persist please contact us in our <a href=\"https://t.me/triforcetokens\">telegram channel</a>.</p>");
						return res.json({ status: 'error', errMsgs: errMsgs });
					});

			})
			.catch(err => {
				let msg = err.error ? err.error.err : err.message;
				sails.log.error("Failed to submit step 1 KYC data to API server:", err);
				errMsgs.push("<p>The KYC process checks have stalled. Please try to enter your information again. If the problem persist please contact us in our <a href=\"https://t.me/triforcetokens\">telegram channel</a>.</p>");
				return res.json({ status: 'error', errMsgs: errMsgs });
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
				console.log(response);
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
				// 	"<p>If you are struggling to get a match on your documents please message us in <a href=\"https://t.me/triforcetokens\">telegram</a> or send an email to jake@triforcetokens.io and we will make sure to get your issue resolved.</p>"]};
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
			var stream = fs.createReadStream("C:/wamp2/www/triforcetokens.io/remove-followers-from-stakes.csv");

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
				AirdropUsers.create({ email: email, wallet: wallet }).exec(function (err, result) {
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

};
