/**
 * DashboardController
 *
 * @description :: Server-side logic for managing Pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

const request = require('request-promise'),
  moment = require('moment'),
  Recaptcha = require('recaptcha-v2').Recaptcha,
  web3Utils = require('web3-utils');

var RECAPTCHA_PUBLIC_KEY = sails.config.RECAPTCHA.PUBLIC_KEY,
  RECAPTCHA_PRIVATE_KEY = sails.config.RECAPTCHA.PRIVATE_KEY;

module.exports = {

	/**
	* Return the dashboard page
	*/
  getDashboard: function (req, res) {

    let processReq = async () => {

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

      const txns = await request({
        method: 'GET',
        uri: sails.config.API_URL + 'ico/user/txns',
        json: true,
        headers: {
          'Authorization': 'Bearer ' + req.session.token
        },
      });

      return { txns, user, isWlAdded };
    };

    processReq()
      .then((rsp) => {
        res.cookie('token', req.session.token, { expires: moment().add(1, 'day').toDate(), httpOnly: true });

        return res.view('contributor/dashboard', {
          layout: 'contributor/layout',
          title: 'Contributor Dashboard | TriForce Tokens Ltd',
          metaDescription: 'Contributor Dashboard.',
          txns: rsp.txns,
          isWlAdded: rsp.isWlAdded,
          user: rsp.user,
          moment: require('moment')
        });
      })
      .catch(err => {
        rUtil.errorResponseRedirect(err, req, res, '/');
      })


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
      console.log("err for set ethereum address", err);
      rUtil.errorResponseRedirect(err, req, res, '/contributor');
    });
  },


  tokenLogin: function (req, res) {

    if (!_.isString(req.param('token'))) {
      return res.send({ success: false }, 401);
    }

    request({
      method: 'GET',
      uri: sails.config.API_URL + 'user',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + req.param('token')
      },
    }).then((rsp) => {
      req.session.user = rsp;
      req.session.token = req.param('token');
      res.send({ success: true });
    })
      .catch(err => {
        res.send({ success: false }, 401);
      })
  },

  logout: function (req, res) {
    delete req.session.token;
    delete req.session.user;
    delete req.session.authenticated;
    res.clearCookie('token');
    res.redirect('/');
  },




  /**
  * Return the buy force
  */
  getBuyForce: async (req, res) => {
    const txns = await request({
      method: 'GET',
      uri: sails.config.API_URL + 'ico/user/txns',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + req.session.token
      },
    });
    
    return res.view('contributor/buy-force', {
      layout: 'contributor/layout',
      title: 'Buy FORCE',
      metaDescription: '',
      user: req.session.user,
      txns: txns
    });
  },


  /**
  * Return the buy force
  */
  getTransactions: async (req, res) => {

    const txns = await request({
      method: 'GET',
      uri: sails.config.API_URL + 'ico/user/txns',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + req.session.token
      },
    });
    
    return res.view('contributor/transactions', {
      layout: 'contributor/layout',
      title: 'Transactions',
      metaDescription: '',
      user: req.session.user,
      txns: txns,
      moment: require('moment')
    });
  },


  /**
  * Return the change password
  */
  getChangePassword: async (req, res) => {

    const txns = await request({
      method: 'GET',
      uri: sails.config.API_URL + 'ico/user/txns',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + req.session.token
      },
    });

    return res.view('contributor/change-password', {
      layout: 'contributor/layout',
      title: 'Change Password',
      metaDescription: '',
      user: req.session.user,
      txns: txns
    });
  },


   postChangePassword: async (req, res) => {

    try{
      let currentPassword = req.param('currentPassword'),
        newPassword = req.param('newPassword'),
        confirmNewPassword = req.param('confirmNewPassword');

        let user = await User.findOne({id:req.session.user.id});

        if(!user){
          throw new Error("Failed to retrieve user");
        }

        // Validate password
        let validPassword = await user.validatePassword(currentPassword);

        if(!validPassword){
          req.addFlash('errors',"You entered an invalid current password.");
          return res.redirect("/contributor/change-password");
        }

        // Make sure new password contains one number and capital letter
        let passwordError = User.isInvalidPassword(newPassword);
        if(passwordError){
          req.addFlash('errors',passwordError);
          return res.redirect("/contributor/change-password");
        }

        if(newPassword != confirmNewPassword){
          req.addFlash('errors',"Your new passwords do not match.");
          return res.redirect("/contributor/change-password");
        }

        // Everything ok, update users password
        let updatedPassword = User.update({id:req.session.user.id},{password:newPassword});

        if(!updatedPassword){
          throw new Error("Failed to update your password due to a server error.");
        }

        req.addFlash("success","Your new password has been updated.")
        return res.redirect("/contributor/change-password");
      }catch(err){
        sails.log.error("DashboardController.postChangePassword err: ",err);
        return res.redirect("/contributor/change-password");
      }
  },



  /**
  * Return the KYC
  */
  getKyc: async (req, res) => {
    const txns = await request({
      method: 'GET',
      uri: sails.config.API_URL + 'ico/user/txns',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + req.session.token
      },
    });

    // Get most up to date data on user
    let userData = await User.findOne({id:req.session.user.id});
    
    return res.view('contributor/kyc', {
      layout: 'contributor/layout',
      title: 'Review and update your KYC/AML',
      metaDescription: '',
      user: userData,
      txns: txns,
      moment: require('moment')
    });
  },



  postKycBio: async (req,res) => {

    try{
      let ssic = 'UNKNOWN',
        ssoc = 'UNKNOWN',
        onboardingMode = 'NON FACE-TO-FACE',
        paymentMode = 'VIRTUAL CURRENCY',
        productServiceComplexity = 'SIMPLE',
        firstName = req.param('firstName'),
        lastName = req.param('lastName'),
        nationality = req.param('nationality'),
        country = req.param('country'),
        gender = req.param('gender'),
        dobYear = req.param("dobYear"),
        dobMonth = req.param("dobMonth"),
        dobDay = req.param("dobDay"),
        userYearDob = '',
        userMonthDob = '',
        userDayDob = '',
        dateOfBirth = dobDay + '/' + dobMonth + '/' + dobYear;

        // Check if any information has actually changed
        let user = await User.findOne({id:req.session.user.id});

        if(!user){
          return res.ok({success:true,updated:false,msg:'No information to change'});
        }

        if(user.dateOfBirth){
          userYearDob = moment(user.dateOfBirth,"DD/MM/YYYY").year(),
          userMonthDob = moment(user.dateOfBirth,"DD/MM/YYYY").month(),
          userDayDob = moment(user.dateOfBirth,"DD/MM/YYYY").format('D');
        }

        // Update is not required - make sure user info is actually provided otherwise error
        if(user.firstName == firstName && user.lastName == lastName && user.nationality == nationality && user.gender == gender
          && user.country == country && dateOfBirth == user.dateOfBirth){

          // Make sure information exists
          if(!firstName || !lastName || !nationality || !country || !dateOfBirth || !dobYear || !dobMonth || !dobDay || !gender){
            return res.ok({success:false,updated:false,msg:'You have not provided all required information. Please check the form.'})
          }else{
            return res.ok({success:true,updated:false,msg:'Your information has been saved'});
          }
        }

        if(!firstName || !lastName || !nationality || !country || !dateOfBirth || !dobYear || !dobMonth || !dobDay || !gender){
          return res.ok({success:false,updated:false,msg:'You have not provided all required information. Please check the form.'})
        }


        // Update is required
        let updateUser = await User.update({id:user.id},{firstName,lastName,nationality,country,dateOfBirth,gender});

        // Submit profile to artimes
        let artemisResponse = await ArtemisApiService.submitIndividual(ssic, ssoc, onboardingMode, paymentMode, productServiceComplexity,
            firstName, lastName, user.email, nationality, country, gender, dateOfBirth, user.id);

        await User.update({id:user.id},{checkStatusUrl:artemisResponse.check_status_url});

        return res.ok({success:true,updated:true,msg:'Your bio information has been saved.'});
      }catch(err){
        sails.log.error("DashboardController.postUserBio err: ",err);
        return res.serverError({success:false,updated:false,msg: "There was an error on the server. Your bio information could not be saved."});
      }
  },



  /**
  * Save Users ETH address for whitelisting 
  */
  postKycWhitelistEthAddress: async (req,res) => {

    try{
      let whitelistEthAddress = req.param("whitelistEthAddress");

      // Validate eth address
      if(!web3Utils.isAddress(whitelistEthAddress)){
        sails.log.debug("invalid eth address",whitelistEthAddress);
        return res.ok({success:false,updated:false,msg:"You provided an invalid Ethereum wallet address"});
      }

      // Check if any information has actually changed
      let updatedUser = await User.update({id:req.session.user.id},{whitelistEthAddress:whitelistEthAddress});

      return res.ok({success:true,updated:true,msg:'Your ether address has been saved.'});
    }catch(err){
      sails.log.error("DashboardController.postKycWhitelistEthAddress err: ",err);
      return res.serverError({success:false,updated:false,msg: "Could not save your Ether address."});
    }

  },



};

