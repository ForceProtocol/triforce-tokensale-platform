module.exports = function(req, res, next) {

	if(typeof req.param("locale") !== 'undefined' && req.param("locale").length > 0){
		req.session.language = req.param("locale");
	}
	
	if(typeof req.session.language !== 'undefined' && req.session.language.length > 0){
		req.setLocale(req.session.language);
		res.locals.language = req.session.language;
	}

	next();
};