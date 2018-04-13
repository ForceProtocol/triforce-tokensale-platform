module.exports = function (req, res, next) {

	// guest pages are only accessible when you are not logged in. e.g. /login, /signup

	if(req.session.token) {
		// logged in but accessing signup/login page
		return res.redirect('/contributor');
	}
	next();

};
