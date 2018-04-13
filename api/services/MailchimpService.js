/**
 * MailchimpService
 *
 * @description :: Server-side logic for managing Pages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var Mailchimp = require('mailchimp-api-v3')
var mailchimp = new Mailchimp(sails.config.MAILCHIMP_KEY);
var mandrill = require('node-mandrill')(sails.config.MANDRILL_KEY);

module.exports = {

	
	/**
	* Add a subscriber to a mailchimp list
	*/
	addSubscriber: function (listId,email,firstName,lastName,subscribeStatus) {
	
		sails.log.debug("-- addSubscriber mailchimp requested --");
		
		return mailchimp.post('/lists/' + listId + '/members', {
			email_address : email,
			status: subscribeStatus,
			merge_fields: {
				"FNAME": firstName,
				"LNAME": lastName
			}
		})
		.then(function(results) {
			return results;
		})
		.catch(function (err) {
			throw err;
		});
	},
	
	
	
	sendMandrillEmail: function(to,from,subject,text){
		mandrill('/messages/send', {
			message: {
				to: to,
				from_email: from,
				subject: subject,
				text: text
			}
		},function(error, response){
			// there was an error
			if (error){
				console.log( JSON.stringify(error) );
			}
		});
	},
	
	
};

