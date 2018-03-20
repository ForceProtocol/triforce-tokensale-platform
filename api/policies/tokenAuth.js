/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
const request = require('request-promise');

module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (req.session.token) {
    return next();
  }else if(req.cookies && req.cookies.token){

    request({
      method: 'GET',
      uri: sails.config.API_URL + 'user',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + req.cookies.token
      },
    }).then((rsp)=> {
      req.session.user = rsp;
      req.session.token = req.cookies.token;
      next();
    })
      .catch(err=> {
        res.redirect('/');
      });

  }
  else {

    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    // return res.forbidden('You are not permitted to perform this action.');
    res.redirect('/');
  }

};
