/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  process: function (req, res) {
     let email = req.param('email'),
       password = req.param('password');

     if(!_.isString(email) || !_.isString(password))
       return res.badRequest('Invalid email or password provided');

      UserService.login(email, password)
       .then(res.ok)
       .catch((err)=>rUtil.errorResponse(err, res));
  }
};

