/**
 * isAdmin
 *
 * @description :: Policy to check if user is admin
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 */

module.exports = function (req, res, next) {

  if(!req.token || !req.token.user)
    return res.json(401, {err: 'Invalid Token'});

  if(['raza@forceprotocol.io', 'pete@forceprotocol.io'].indexOf(req.token.user.email) !== -1){
    next();
  }
  else {
    return res.json(401, {err: 'Invalid Token'});
  }

};
