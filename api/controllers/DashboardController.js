/**
 * DashboardController
 *
 * @description :: Server-side logic for managing Pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

const request = require('request-promise'),
  moment = require('moment'),
	Recaptcha = require('recaptcha-v2').Recaptcha;

var RECAPTCHA_PUBLIC_KEY  = '6LejfD8UAAAAAIuIZcStpaeaazsQH5brs32sDWza',
    RECAPTCHA_PRIVATE_KEY = '6LejfD8UAAAAAKmBbSB5Jss5CiQQ5fOhh1QRvCfD';

module.exports = {

	/**
	* Return the dashboard page
	*/
	getDashboard: function (req, res) {

	  let processReq = async ()=>{
      // const cryptos = await request({
      //   method: 'GET',
      //   uri: sails.config.API_URL + 'user-cryptos',
      //   json: true,
      //   headers: {
      //     'Authorization': 'Bearer ' + req.session.token
      //   },
      // });


      // check if added to whitelist contract
      const isWlAdded = await request({
        method: 'GET',
        uri: sails.config.API_URL + 'ico/whitelist/check',
        json: true,
        headers: {
          'Authorization': 'Bearer ' + req.session.token
        },
      });


      const user = await request({
        method: 'GET',
        uri: sails.config.API_URL + 'user',
        json: true,
        headers: {
          'Authorization': 'Bearer ' + req.session.token
        },
      });


      // let cryptObj = {};
      // if (_.isArray(cryptos)){
      //   cryptos.forEach(_crypto=>{
      //     cryptObj[_crypto.currency] = _crypto;
      //   })
      // }

      const txns =  await request({
        method: 'GET',
        uri: sails.config.API_URL + 'ico/user/txns',
        json: true,
        headers: {
          'Authorization': 'Bearer ' + req.session.token
        },
      });
      // const balance =  await request({
      //   method: 'GET',
      //   uri: sails.config.API_URL + 'balance',
      //   json: true,
      //   headers: {
      //     'Authorization': 'Bearer ' + req.session.token
      //   },
      // });

      return { /*cryptObj,*/ txns, user, isWlAdded};
    };

	  processReq()
      .then((rsp)=>{
        res.cookie('token', req.session.token, { expires: moment().add(1, 'day').toDate(), httpOnly: true });
        return res.view('contributor/dashboard', {
          layout: 'contributor/layout',
          title: 'Contributor Dashboard | TriForce Tokens Ltd',
          metaDescription: 'Contributor Dashboard.',
          // cryptos: rsp.cryptos,
          // cryptObj: rsp.cryptObj,
          txns: rsp.txns,
          isWlAdded: rsp.isWlAdded,
          // balance: rsp.balance,
          user: rsp.user,
          moment: require('moment')
        });
    })
      .catch(err=>{
        rUtil.errorResponseRedirect(err, req, res, '/');
      })


	},



	signup: function (req, res) {

		/** Add to subscribers list */
		var email = req.param("email"),
			firstName = req.param("firstName"),
			lastName = req.param("lastName");

		if(sails.config.environment === 'production'){
			Subscribers.findOrCreate({email:email,active:true}).exec(function(err,created){
				if(err || typeof created == 'undefined'){
					sails.log.error("failed to subscribe: ",err,email);
				}else{
					// Submit post request to LTF subscribe list
					var ltfFormVars = {
						'cm-f-dytkwut': firstName,
						'cm-f-dytkwui': lastName,
						'cm-udlhydk-udlhydk': email
					};

					request({
						method: 'POST',
						uri: 'http://login.yourcampaignmanager.co.uk/t/r/s/udlhydk/',
						formData: ltfFormVars,
						headers: {
							'content-type': 'application/x-www-form-urlencoded'
						}
					}).then((rsp)=> {
					}).catch(err=> {
					});
				}
			});
		}


		// Submit signup request to API server
		request({
			method: 'POST',
			json: true,
			body: req.allParams(),
			uri: sails.config.API_URL + 'register'
		}).then((rsp)=> {
			req.addFlash('success', 'Thank you for signing up.');
			req.session.user = rsp.user;
			req.session.token = rsp.token;
			req.session.etherAddress = rsp.etherAddress;
			return res.redirect('/contributor');
		}).catch(err=> {
			let msg = err.error ? err.error.err : err.message;

			if(typeof msg == 'undefined' || msg.length == 0){
				req.addFlash('errors', "There was a problem creating your account. Please contact us at pete@triforcetokens.io or telegram https://t.me/triforcetokens and we will resolve the issue as soon as possible.");
				return res.redirect("/");
			}

			rUtil.errorResponseRedirect(err, req, res, '/');
		});

	},

  setEthereumAddress: function (req, res) {

	req.params.ether_address = new Buffer(req.param('ether_address')).toString('base64');

    // Submit request to API server to reset the password
    request({
      method: 'POST',
      json: true,
      body: req.allParams(),
      headers: {
        'Authorization': 'Bearer ' + req.session.token
      },
      uri: sails.config.API_URL + 'user/setup-ether-address'
    }).then((rsp) => {
      req.addFlash('success', 'An email has been sent with the confirmation link to update your ethereum address.');
      res.redirect('/contributor');
    }).catch(err => {
		console.log("err for set ethereum address",err);
      rUtil.errorResponseRedirect(err, req, res, '/contributor');
    });
  },


	login: function (req, res) {
		// Confirm recapture success
		var data = {
			remoteip:  req.connection.remoteAddress,
			response:  req.param("g-recaptcha-response"),
			secret: RECAPTCHA_PRIVATE_KEY
		};

		var recaptcha = new Recaptcha(RECAPTCHA_PUBLIC_KEY, RECAPTCHA_PRIVATE_KEY, data);

		recaptcha.verify(function(success, error_code) {

		if(success){
				request({
					method: 'POST',
					json: true,
					body: req.allParams(),
					uri: sails.config.API_URL + 'auth'
				}).then((rsp)=> {
					req.session.user = rsp.user;
					req.session.token = rsp.token;
					res.redirect('/contributor');
				}).catch(err=> {

					let msg = err.error ? err.error.err : err.message;

					if(typeof msg == 'undefined' || msg.length == 0){
						sails.log.error("Failed to login user  - but no error returned");
						req.addFlash('errors', "There was a problem logging in to your account. Please contact us at pete@triforcetokens.io or telegram https://t.me/triforcetokens and we will resolve the issue as soon as possible.");
						return res.redirect("/login");
					}

					rUtil.errorResponseRedirect(err, req, res, '/login');
				});
			}else{
				req.addFlash('errors', "There was a problem logging in to your account. Please make sure to check the recaptcha form.");
				return res.redirect("/login");
			}
		});
  },

  tokenLogin: function (req, res) {

	if(!_.isString(req.param('token'))){
		return res.send({success: false}, 401);
	}

    request({
      method: 'GET',
      uri: sails.config.API_URL + 'user',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + req.param('token')
      },
    }).then((rsp)=> {
        req.session.user = rsp;
        req.session.token = req.param('token');
        res.send({success: true});
      })
      .catch(err=> {
        res.send({success:false}, 401);
      })
  },

  logout: function (req, res) {
    delete req.session.token;
    delete req.session.user;
    res.clearCookie('token');
    res.redirect('/?logout=true');
  },

};

