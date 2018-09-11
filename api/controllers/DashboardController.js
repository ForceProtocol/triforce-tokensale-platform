/**
 * DashboardController
 *
 * @description :: Server-side logic for managing Pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

const request = require('request-promise'),
  moment = require('moment'),
  Recaptcha = require('recaptcha-v2').Recaptcha,
  web3Utils = require('web3-utils'),
  fs = require("fs"),
  {getEthPriceNow,getEthPriceHistorical} = require('get-eth-price'),
  getBtcPrice = require('btc-value');

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
      txns: txns,
      moment: require('moment')
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

        // block Americans
        if(nationality == "AMERICAN" || country.indexOf("AMERICA") !== -1){
          return res.ok({success:true,updated:false,msg:'We are unable to accept American Citizens or Residents at this time.'});
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



  /**
  * Upload ID document
  */
  postUploadIdDocument: async (req,res) => {
    try {
      let uploadPath = '.tmp/public/users/id',
      displayPath = 'users/id',
      validFileTypes = ["image/jpg","image/jpeg","image/png","image/gif"];

      // Process the SELFIE document upload
      let uploadIdDocument = await new sails.bluebird(function (resolve, reject) {

        try{
          req.file('documentIdFile').upload({
              dirname: require('path').resolve(sails.config.appPath, uploadPath),
              maxBytes: 1 * 1024 * 1024 //1 MB
            }, function (err, uploadedFiles) {

            if (err || !uploadedFiles || uploadedFiles.length < 1) {
              return reject(err);
            }

            var fdExtId = uploadedFiles[0].fd.substr((uploadedFiles[0].fd.lastIndexOf('.') + 1));
            var fileName = req.session.user.id + "-" + new Date().getTime() + '-ID.' + fdExtId;
            var newFileFd = require('path').resolve(sails.config.appPath, uploadPath) + '\\' + fileName;
            var docPath = _.clone(newFileFd);

            fs.rename(uploadedFiles[0].fd, newFileFd, function (err) { 

              if(err){
                return reject(err);
              }

              // Make sure filetype is acceptable
              if (validFileTypes.indexOf(uploadedFiles[0].type) < 0) {
                return resolve({ status: 'error', err: "The file type uploaded was not valid."});
              }

              return resolve({ status: 'success', fileFd: newFileFd, fileName: fileName, renderPublicLocation: displayPath + '/' + fileName, mimeType: uploadedFiles[0].type });
            });
          });
        }catch(err){
          return reject(err);
        }

      });

      if (uploadIdDocument.status == 'success') {
        postUploadDocToArtemisRsp = await ArtemisApiService.docPostApi(req.session.user.id, uploadIdDocument.fileFd, uploadIdDocument.fileName, uploadIdDocument.mimeType);

        // Update users document ID
        let updateUser = await User.update({id:req.session.user.id},{documentId:postUploadDocToArtemisRsp.id});

        return res.ok({
          success: true,
          fileName: uploadIdDocument.fileName,
          renderPublicLocation: uploadIdDocument.renderPublicLocation,
          msg: "Your ID document file was stored successfully"
        });

      }
      // ID document upload failed
      else {
        throw new Error("Failed to process the uploaded document.");
      }

    } catch (err) {
      sails.log.error("DashboardController.postUploadIdDocument err: ",err);
      return res.serverError({success:false,msg: err});
    }
  },



  /**
  * Upload Selfie
  */
  postUploadSelfie: async (req,res) => {
    try {
      let uploadPath = '.tmp/public/users/selfie',
      displayPath = 'users/selfie',
      validFileTypes = ["image/jpg","image/jpeg","image/png","image/gif"];

      // Process the SELFIE document upload
      let uploadIdDocument = await new sails.bluebird(function (resolve, reject) {

        try{
          req.file('selfieFile').upload({
              dirname: require('path').resolve(sails.config.appPath, uploadPath),
              maxBytes: 1 * 1024 * 1024 //1 MB
            }, function (err, uploadedFiles) {

            if (err || !uploadedFiles || uploadedFiles.length < 1) {
              return reject(err);
            }

            var fdExtId = uploadedFiles[0].fd.substr((uploadedFiles[0].fd.lastIndexOf('.') + 1));
            var fileName = req.session.user.id + "-" + new Date().getTime() + '-SELFIE.' + fdExtId;
            var newFileFd = require('path').resolve(sails.config.appPath, uploadPath) + '/' + fileName;
            var docPath = _.clone(newFileFd);


            fs.rename(uploadedFiles[0].fd, newFileFd, function (err) { 

              if(err){
                return reject(err);
              }
            
              // Make sure filetype is acceptable
              if (validFileTypes.indexOf(uploadedFiles[0].type) < 0) {
                return resolve({ status: 'error', err: "The file type uploaded was not valid."});
              }

              return resolve({ status: 'success', fileFd: newFileFd, fileName: fileName, renderPublicLocation: displayPath + '/' + fileName, mimeType: uploadedFiles[0].type });
            });

          });
        }catch(err){
          return reject(err);
        }

      });

      if (uploadIdDocument.status == 'success') {
        postUploadDocToArtemisRsp = await ArtemisApiService.docPostApi(req.session.user.id, uploadIdDocument.fileFd, uploadIdDocument.fileName, uploadIdDocument.mimeType);

        // Update users document ID
        let updateUser = await User.update({id:req.session.user.id},{selfieId:postUploadDocToArtemisRsp.id});

        return res.ok({
          success: true,
          fileName: uploadIdDocument.fileName,
          renderPublicLocation: uploadIdDocument.renderPublicLocation,
          msg: "Your ID document file was stored successfully"
        });

      }
      // ID document upload failed
      else {
        throw new Error("Failed to process the uploaded document.");
      }

    } catch (err) {
      sails.log.error("DashboardController.postUploadIdDocument err: ",err);
      return res.serverError({success:false,msg: err});
    }
  },



  /**
  * Perform final KYC validation
  */
  postCompleteKyc: async (req,res) => {
    try{

      // Get user info to process
      let user = await User.findOne({id:req.session.user.id});

      if(!user){
        throw new Error("There was a problem with the server, please try completing the form again.");
      }

      // Now need to do document comparison
      let artemisFaceCheckRsp = await ArtemisApiService.facePostApi(user.id, user.documentId, user.selfieId);

      // If no match - we need user to re-upload documents
      var faceMatchResult = artemisFaceCheckRsp.compare_result;

      // Perform final check if we can auto approve this person with Artemis
      finalKycCheck = await ArtemisApiService.finalReportCheckApi(user.id);

      let updatedUser = await User.update({id:user.id},{riskRating:finalKycCheck.risk_rating,approvalStatus:finalKycCheck.approval_status,faceMatchResult:faceMatchResult});

      let emailOptions = {fromEmail:"do-not-reply@triforcetokens.io",fromName:"TriForce Tokens",toEmail:user.email,toName:user.firstName,subject:'',body:''};

      if (finalKycCheck.approval_status == 'ACCEPTED' || finalKycCheck.approval_status == 'CLEARED') {
        req.addFlash('success', 'Congratulations! You are now a fully approved contributor and may purchase FORCE tokens.');
        emailOptions.subject = "Your KYC application was accepted";
        emailOptions.body = `Hi ${user.firstName}<br />
        Your KYC application was processed successfully and we are pleased to inform you, you have been approved as a contributor.<br />
        You may now purchase FORCE tokens and expect to receive them back to the Ether address you provided.<br />
        Remember you can always <a href="${sails.config.BASE_URL}/contributor-login">access your account here</a>.<br /><br />

        Kind Regards<br />
        The TriForce Tokens Team`;

        EmailService.sendEmail(emailOptions);
        return res.redirect("/contributor/kyc");
      } else if (finalKycCheck.approval_status == 'PENDING') {
        req.addFlash('success', 'Great, we received your KYC information. Please allow a few minutes for us to verify the details provided.');

        emailOptions.subject = "Your KYC application is being processed";
        emailOptions.body = `Hi ${user.firstName}<br />
        Your KYC application is currently being processed. Our team will ensure you receive an email when it has been completed with the result.<br />
        Once approved you will be able to purchase the remaining FORCE from our final token sale that ends soon.<br />
        Remember you can always <a href="${sails.config.BASE_URL}/contributor-login">access your account here</a>.<br /><br />

        Kind Regards<br />
        The TriForce Tokens Team`;

        EmailService.sendEmail(emailOptions);

        // Send email to team about pending KYC application
        emailOptions = {fromEmail:"do-not-reply@triforcetokens.io",fromName:"TriForce Tokens",toEmail:"pete@triforcetokens.io",toName:"Team",subject:'User has KYC Pending',body:''};
        emailOptions.body = `A user tried to complete KYC. A manual review is required. The user info is:<br /><br />
        Email: ${user.email}<br />
        First Name: ${user.firstName}<br />
        Last Name: ${user.lastName}<br />
        Document ID: ${user.documentId}<br />
        Selfie ID: ${user.selfieId}<br />
        Nationality: ${user.nationality}<br />
        Country: ${user.country}
        `;

        EmailService.sendEmail(emailOptions);

        return res.redirect("/contributor/kyc");
      } else {
        req.addFlash('error', 'Sorry, it seems that our KYC provider has indicated your KYC application should be declined. If you feel this is in error, please contact us.');

        emailOptions.subject = "Your KYC application was rejected";
        emailOptions.body = `Hi ${user.firstName}<br />
        Unfortunately your KYC application has been rejected. This is due to information based from our KYC provider, Cynopsis Solutions PTE.<br />
        If you feel that an error has been made please <a href="${sails.config.BASE_URL}/contact">contact us here</a>.<br /><br />

        Kind Regards<br />
        The TriForce Tokens Team`;

        EmailService.sendEmail(emailOptions);
        return res.redirect("/contributor/kyc");
      }
    }catch(err){
      req.addFlash("errors","Your KYC process could not be completed. Please check all details are correct in the form below.")
      sails.log.error("DashboardController.postCompleteKyc err: ",err);
      return res.redirect("/contributor/kyc");
    }
  },



  /**
  * Save Users ETH address for whitelisting 
  */
  postCalculator: async (req,res) => {

    try{
      let forceQty = parseFloat(req.param("forceQty")),
        selectedCurrency = req.param("selectedCurrency"),
        totalForce = forceQty,
        currentCryptoPrice = 1;


      // Calculate bonus
      let currentBonus = await CpService.getCurrentBonus();

      // Ensure forceQty is a valid number
      if(!forceQty || isNaN(forceQty)){
        return res.ok({success:false,msg:"You did not provide a valid FORCE quantity value."});
      }

      if(!selectedCurrency || (selectedCurrency != 'btc' && selectedCurrency != 'eth')){
        return res.ok({success:false,msg:"You did not select a valid payment currency."});
      }

      if(currentBonus > 0){
        totalForce = forceQty + ((forceQty / 100) * currentBonus);
      }

      let totalForceUsd = (forceQty * 0.15).toFixed(2);

      switch(selectedCurrency){
        case 'eth':
          currentCryptoPrice = await getEthPriceNow();
          currentCryptoPrice = currentCryptoPrice[Object.keys(currentCryptoPrice)[0]].ETH.USD;
        break;
        case 'btc':
          currentCryptoPrice = await getBtcPrice();
        break;
      }

      let totalCurrencyRequired = CpService.roundToCleanDecimal(totalForceUsd / currentCryptoPrice,"8");

      return res.ok({success:true,currentBonus:currentBonus,forceQty:forceQty,selectedCurrency:selectedCurrency,totalForce:totalForce,totalForceUsd:totalForceUsd,currentCryptoPrice:currentCryptoPrice,totalCurrencyRequired:totalCurrencyRequired});
    }catch(err){
      sails.log.error("DashboardController.postKycWhitelistEthAddress err: ",err);
      return res.serverError({success:false,updated:false,msg: "Could not calculate your order due to a server issue."});
    }

  },


  postCreateCharge: async(req,res) => {
    try{
      let forceQty = parseFloat(req.param("forceQty")),
        selectedCurrency = req.param("selectedCurrency"),
        totalForce = forceQty,
        currentCryptoPrice = 1;


      // Calculate bonus
      let currentBonus = await CpService.getCurrentBonus();

      // Ensure forceQty is a valid number
      if(!forceQty || isNaN(forceQty)){
        return res.ok({success:false,msg:"You did not provide a valid FORCE quantity value."});
      }

      if(!selectedCurrency || (selectedCurrency != 'btc' && selectedCurrency != 'eth')){
        return res.ok({success:false,msg:"You did not select a valid payment currency."});
      }

      if(currentBonus > 0){
        totalForce = forceQty + ((forceQty / 100) * currentBonus);
      }

      let totalForceUsd = (forceQty * 0.15).toFixed(2);

      switch(selectedCurrency){
        case 'eth':
          currentCryptoPrice = await getEthPriceNow();
          currentCryptoPrice = currentCryptoPrice[Object.keys(currentCryptoPrice)[0]].ETH.USD;
        break;
        case 'btc':
          currentCryptoPrice = await getBtcPrice();
        break;
      }

      let totalCurrencyRequired = CpService.roundToCleanDecimal(totalForceUsd / currentCryptoPrice,"8");

      // Create charge
      let description = "Authenticated purchase of " + totalForce + " FORCE tokens.";
      let coinbaseCharge = await CoinbaseService.createCharge(req.session.user.id,req.session.user.email,totalCurrencyRequired,selectedCurrency,description);

      if(!coinbaseCharge){
        throw new Error("Failed to create an order to complete.");
      }

      sails.log.debug("coinbaseCharge ",coinbaseCharge);

      return res.ok({success:true,hostedUrl:coinbaseCharge.hosted_url,currentBonus:currentBonus,forceQty:forceQty,selectedCurrency:selectedCurrency,totalForce:totalForce,totalForceUsd:totalForceUsd,currentCryptoPrice:currentCryptoPrice,totalCurrencyRequired:totalCurrencyRequired});
    }catch(err){
      sails.log.error("DashboardController.postKycWhitelistEthAddress err: ",err);
      return res.serverError({success:false,updated:false,msg: "Could not calculate your order due to a server issue."});
    }
  },

};

