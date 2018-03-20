/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {
  sails.bluebird = require('bluebird');
  let contracts = require('../api/services/contracts');

  sails.getBasePath = function () {
    let path = require('path');
    let arr = __dirname.split(path.sep);
    arr.pop(); //go back one directory
    // arr.pop(); //go back one directory
    return path.normalize(arr.join('/'));
  };

  if(sails.config.environment === 'production'){
    /** LIVE - PRODUCTION VARS **/
    sails.ARTEMIS_API_URL = "https://p3.cynopsis.co/artemis_triforce";
    sails.ARTEMIS_TFT_DOMAIN = "TRIFORCE";
    sails.ARTEMIS_API_TOKEN = "2f33744e-2461-4f75-bfca-60cf4cee0846";
  }else{
    /** DEVELOPMENT VARS **/
    sails.ARTEMIS_API_URL = "https://p3.cynopsis.co/artemis_triforce_uat";
    sails.ARTEMIS_TFT_DOMAIN = "TRIFORCE_UAT";
    sails.ARTEMIS_API_TOKEN = "2610db88-301e-46af-a5ae-57d23a31eb65";
  }

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  setTimeout(function () {
    contracts.initAll();
  }, 1000);
  //calling it couple of times to make sure its called properly bcz sometimes system takes more than 1000ms to load
  // calling multiple times wont have any effect if its already initialized
  setTimeout(function () {
    contracts.initAll();
  }, 9000);
  setTimeout(function () {
    contracts.initAll();
  }, 90000);
	
	TwitterApiService.connectStream().then(function(connected){}).catch(function(err){
	});
	
	cb();
};
