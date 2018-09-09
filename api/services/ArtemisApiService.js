/**
 * Artemis API Service
 *
 * @description :: Server-side logic for managing Pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 
const request = require('request-promise'),
	fs = require('fs');

module.exports = {

	
	/**
	* Collate user ID retweets against a tweet
	*/
	submitIndividual: function (ssic,ssoc,onboardingMode,paymentMode,productServiceComplexity,
								firstName,lastName,email,nationality,country,gender,dateOfBirth,userId) {
	
		return new sails.bluebird(function(resolve, reject) {
						
			// Format gender
			if(gender == 'female'){
				gender = 'FEMALE';
			}else{
				gender = 'MALE';
			}
			
			// Submit signup request to API server
			request({
				uri: sails.ARTEMIS_API_URL + '/default/individual_risk',
				method: 'POST',
				headers: {"WEB2PY-USER-TOKEN":sails.ARTEMIS_API_TOKEN},
				form: {
					domain_name:sails.ARTEMIS_TFT_DOMAIN,
					rfrID: userId,
					ssic_code: ssic,
					ssoc_code: ssoc,
					onboarding_mode: onboardingMode,
					payment_mode: paymentMode,
					product_service_complexity: productServiceComplexity,
					first_name: firstName,
					last_name: lastName,
					nationality: nationality,
					country_of_residence: country,
					gender:gender,
					date_of_birth:dateOfBirth
				},
			}).then((rsp)=> {
				return resolve(JSON.parse(rsp));
			}).catch(err=> {
				return reject(err);
			});
		
		});
		
	},
	
	
	/**
	* Collate user ID retweets against a tweet
	*/
	docPostApi: function (userId,fileLocation,fileName,contentType) {
	
		return new sails.bluebird(function(resolve, reject) {

			// Submit signup request to API server
			var req = request({
				uri: sails.ARTEMIS_API_URL + '/api/individual_doc',
				method: 'POST',
				json: true,
				headers: {"Content-Type":"application/json","WEB2PY-USER-TOKEN":sails.ARTEMIS_API_TOKEN},
				formData: {
					domain_name:sails.ARTEMIS_TFT_DOMAIN,
					cust_rfr_id: userId,
					file: {
						value: fs.createReadStream(fileLocation),
						options: {
							filename:fileName,
							contentType: contentType
						}
					}
				},
			}).then((rsp)=> {
			
				if(rsp.errors.length > 0){
					return reject(rsp.errors);
				}
				
				return resolve(rsp);
			}).catch(err=> {
				console.log("error.statusCodeError is:",err.StatusCodeError);
				return reject(err);
			});
			
		});
		
	},
	
	
	
	/**
	* Perform Face Recognition check
	*/
	facePostApi: function (userId,docId,selfieId) {
		
		return new sails.bluebird(function(resolve, reject) {

			// Submit signup request to API server
			var req = request({
				uri: sails.ARTEMIS_API_URL + '/api/individual_face',
				method: 'POST',
				json: true,
				headers: {"Content-Type":"application/json","WEB2PY-USER-TOKEN":sails.ARTEMIS_API_TOKEN},
				formData: {
					domain_name:sails.ARTEMIS_TFT_DOMAIN,
					cust_rfr_id: userId,
					source_doc_id:docId,
					target_doc_id:selfieId
				},
			}).then((rsp)=> {
			
				if(typeof rsp.errors == 'undefined' || rsp.errors == null){
					return resolve(rsp);
				}
				
				sails.log.error("rejected errors:",rsp);
				
				return reject(rsp.errors);
			}).catch(err=> {
			
				sails.log.error("rejected errors 2:",err);
					
				// It tried to match - but failed
				if(typeof err.error !== 'undefined' && typeof err.error.errors !== 'undefined' && typeof err.error.errors.comparison !== 'undefined'){
					if(err.error.errors.comparison.indexOf("undetected") != -1){
						return reject("<p>Please try uploading different images as the facial recognition could not be matched.</p>");
					}
				}
				
				return reject(err.error.errors);
			});
			
		});
		
	},
	
	
	
	/**
	* Perform Face Recognition check
	*/
	finalReportCheckApi: function (userId) {
		
		return new sails.bluebird(function(resolve, reject) {

			// Submit signup request to API server
			var req = request({
				uri: sails.ARTEMIS_API_URL + '/api/individual_customer_report',
				method: 'POST',
				json: true,
				headers: {"Content-Type":"application/json","WEB2PY-USER-TOKEN":sails.ARTEMIS_API_TOKEN},
				formData: {
					domain_name:sails.ARTEMIS_TFT_DOMAIN,
					cust_rfr_id: userId
				},
			}).then((rsp)=> {
			
				if(typeof rsp.errors == 'undefined' || rsp.errors == null){
					return resolve(rsp);
				}
				
				return reject(rsp.errors);
			}).catch(err=> {
				return reject(err);
			});
			
		});
		
	},
	
	
	/**
	* Check individuals who are pending if their status changed and facematch done
	*/
	checkIndividualStatus: async function () {

    let users = await User.find({
      approvalStatus: 'PENDING',
      sort: 'updatedAt DESC',
      limit: 50
    });


    if(!users || (_.isArray(users) && !users.length)) {
		  return 'No pending users found to process for KYC';
	  }

    sails.log.verbose('users found: ', users.length);

    let rsp = {accepted: 0, rejected: 0, totalProcessed: 0};
    for(let user of users) {
      try{
        let kycRsp = await request({
          uri: sails.ARTEMIS_API_URL + '/default/check_status.json',
          method: 'GET',
          json: true,
          headers: {"Content-Type":"application/json","WEB2PY-USER-TOKEN":sails.ARTEMIS_API_TOKEN},
          qs: {
            domain_name:sails.ARTEMIS_TFT_DOMAIN,
            rfrID: user.id
          },
        });

        rsp.totalProcessed = users.length;

        if(!_.isUndefined(kycRsp.errors) || kycRsp.errors){
          sails.log.error(`Artemis - Error while processing KYC for USER: [${user.id}]-${user.firstName} ${user.lastName}`,kycRsp.errors);

          continue;
        }


        if(kycRsp.approval_status && (kycRsp.approval_status == 'CLEARED' || kycRsp.approval_status == 'ACCEPTED')) {
          let updUsr = await User.update({id:kycRsp.rfrID},{approvalStatus:kycRsp.approval_status,faceMatchResult:"MATCH"});
          rsp.accepted++;
          await EmailService.sendEmail({
            fromEmail: 'support',
            fromName: 'Support',
            toEmail: user.email,
            toName: `${user.firstName} ${user.lastName}`,
            subject: 'Your KYC application for TriForce Tokens was accepted',
            body: `Hi ${user.firstName},<br /><br /> We are happy to let you know your KYC/AML process has been <strong>accepted</strong>.<br /><br /><a href=\"https://triforcetokens.io/login\">Login Here</a><br /><br />Please remember the token sale opens on <strong>20th February at 12:30pm UTC</strong>. Make sure you are logged in and ready to buy FORCE tokens to get the best rates.<br /><br />Kind Regards,<br />The TriForce Tokens Team`
          });

          if(!updUsr || (_.isArray(updUsr) && !updUsr.length)){
            await EmailService.sendEmail({
              fromEmail: 'admin',
              fromName: 'Admin',
              toEmail: 'support',
              toName: 'Support',
              subject: 'KYC - manual APPROVAL',
              body: `A user has been ACCEPTED by Artemis but system failed to update user record. Please set user status to ACCEPTED manually. User info: <br><pre>${JSON.stringify(user)}</pre>`
            });
          }else {
            _.isString(updUsr[0].whitelistEthAddress) && await BlockchainService.contracts.WhiteList.addWhiteListed(updUsr[0].whitelistEthAddress);
          }


        }
        else if (kycRsp.approval_status === 'REJECTED'){
          rsp.rejected++;
          let updUsr = await User.update({id:kycRsp.rfrID},{approvalStatus:kycRsp.approval_status});
          sails.log.info(`Artemis - USER IS REJECTED : [${user.id}]-${user.firstName} ${user.lastName}`);

          if(!updUsr || (_.isArray(updUsr) && !updUsr.length)){
            await EmailService.sendEmail({
              fromEmail: 'admin',
              fromName: 'Admin',
              toEmail: 'support',
              toName: 'Support',
              subject: 'KYC - manual REJECTION',
              body: `A user has been rejected by Artemis but system failed to update user record. Please set user status to REJECTED manually. User info: <br><pre>${JSON.stringify(user)}</pre>`
            });
          }

          await EmailService.sendEmail({
            fromEmail: 'support',
            fromName: 'Support',
            toEmail: user.email,
            toName: `${user.firstName} ${user.lastName}`,
            subject: 'Your KYC application for TriForce Tokens was rejected',
            body: `Hi ${user.firstName},<br /><br /> We are sorry to let you know your KYC/AML process has been <strong>rejected</strong>.<br />If you strongly feel this is in error please get in touch with us in telegram or you can login to your account and use the support chat channel there.<br /><br /><a href=\"https://triforcetokens.io/login\">Login Here</a><br /><br />Kind Regards,<br />The TriForce Tokens Team`
          });
        }

      }catch(er){
        sails.log.error(`Error while processing KYC for USER: [${user.id}]-${user.firstName} ${user.lastName}`, er.message);
      }

    }

    return rsp;
	},

	
};

