module.exports = function (req, res, next) {

	if(req.session.authenticated) {
		return res.redirect('/contributor');
	}
	next();

};
