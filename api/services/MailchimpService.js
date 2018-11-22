/**
 * MailchimpService
 *
 * @description :: Server-side logic for managing Pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Mailchimp = require('mailchimp-api-v3')
var mailchimp = new Mailchimp(sails.config.MAILCHIMP_KEY);
var mandrill = require('node-mandrill')(sails.config.MANDRILL_KEY);

var domain = 'forceprotocol.io';
var mailgun = require('mailgun-js')({apiKey: sails.config.MAILGUN_KEY, domain: domain});

module.exports = {

	
	/**
	* Add a subscriber to a mailchimp list
	*/
	addSubscriber: async(listId,email,firstName,lastName,subscribeStatus)=>{

		try{
			var list = mailgun.lists('subscriber@mg.forceprotocol.io');

			var user = {
			  subscribed: true,
			  address: email,
			  name: firstName + " " + lastName,
			};
			 
			list.members().create(user, function (err, data) {
				if(error){
					sails.log.debug("Error adding subscriber mailgun: ",err);
					return false;
				}

				return true;
			});
		}catch(err){
			sails.log.debug("Error adding subscriber mailgun: ",err);
			return false;
		}
	},
	
	
	
	sendMandrillEmail: async(to,from,subject,text)=>{

		try{
			let toName;

			if(typeof to.email === 'undefined'){
				return false;
			}

			var data = {
			  from: from,
			  to: to.email,
			  subject: subject,
			  text: text
			};
 
			mailgun.messages().send(data, function (error, body) {

				if(error){
					sails.log.debug("Error sending email via mailgun: ",err);
					return false;
				}

				return true;
			});

		}catch(err){
			sails.log.debug("Error sending email via mailgun: ",err);
			return false;
		}

	},
	
	
};

