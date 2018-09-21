/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */

module.exports.http = {
	bodyParser: (function () {
    var opts = {limit:'50mb'};
    var fn;

    // Default to built-in bodyParser:
    fn = require('skipper');
    return fn(opts);

  }),
  /****************************************************************************
  *                                                                           *
  * Express middleware to use for every Sails request. To add custom          *
  * middleware to the mix, add a function to the middleware config object and *
  * add its key to the "order" array. The $custom key is reserved for         *
  * backwards-compatibility with Sails v0.9.x apps that use the               *
  * `customMiddleware` config option.                                         *
  *                                                                           *
  ****************************************************************************/

  middleware: {

  /***************************************************************************
  *                                                                          *
  * The order in which middleware should be run for HTTP request. (the Sails *
  * router is invoked by the "router" middleware below.)                     *
  *                                                                          *
  ***************************************************************************/

     order: [
       'startRequestTimer',
       'cookieParser',
       'session',
       'partnerTrackingCookie',
       'bodyParser',
       'handleBodyParserError',
       'rawBody',
       'compress',
       'methodOverride',
       'poweredBy',
       '$custom',
       'router',
       'www',
       'favicon',
       '404',
       '500'
     ],

     rawBody: function(req, res, next) {
      if (req.url !== '/coinbase/webhook') {
        return next();
      }

      req.setEncoding('utf8');

      var data = '';

      req.on('data', function (chunk) {
        data += chunk;
      });

      req.on('end', function () {
        req.rawBody = data;
        next();
      });
    },
	
	partnerTrackingCookie: function (req, res, next) {
		// Check if this is a file request
		var reqArr = req.path.split('.');
		
		// Exclude this middleware from working on files
		if(reqArr.length > 1){
			return next();
		}
		
		// Check if the last path in the request path is a unique partner code
		var reqPaths = req.path.split('/');
		
		// Must be the home page with no affiliate code
		if(reqPaths[1].length == 0){
			return next();
		}
		
		// Extract the last path in the given URL
		var lastPath = reqPaths[reqPaths.length - 1];
		
		
		// Now check if this last path in the URL matches an affiliate code
		/** PARTNER REFERRAL CHECK */
		var regex = /^ico-[\w]{2,22}$/i;
		
		// We have a match! Partner Referral
		if(regex.test(lastPath)){
		
			if(typeof req.cookies.run_cpa_track_id === 'undefined'){
				// Check if user already has a cookie set - in which case ignore
				if(typeof req.cookies !== 'undefined' && typeof req.cookies.track_id !== 'undefined'){
					// Modify the requested path
					req.url = req.path.replace(lastPath,'');
					req.affiliateTracker = {canon:req.url};
					return next();
				}
				
				// Remove tracking URL from last path
				req.url = req.path.replace(lastPath,'');
				res.cookie('track_id', lastPath, { maxAge: 25340230000000});
				
				// Check if they also sent webid for tracking
				if(typeof req.param('webid') !== 'undefined'){
					res.cookie('track_id_web_id', req.param('webid'), { maxAge: 25340230000000});
				}
			}else{
				req.url = req.path.replace(lastPath,'');
			}
		}
		
		return next();
	},

  /***************************************************************************
  *                                                                          *
  * The body parser that will handle incoming multipart HTTP requests. By    *
  * default as of v0.10, Sails uses                                          *
  * [skipper](http://github.com/balderdashy/skipper). See                    *
  * http://www.senchalabs.org/connect/multipart.html for other options.      *
  *                                                                          *
  * Note that Sails uses an internal instance of Skipper by default; to      *
  * override it and specify more options, make sure to "npm install skipper" *
  * in your project first.  You can also specify a different body parser or  *
  * a custom function with req, res and next parameters (just like any other *
  * middleware function).                                                    *
  *                                                                          *
  ***************************************************************************/

    // bodyParser: require('skipper')({strict: true})
    bodyParser: (function() {
      // Initialize a skipper instance with the default options.
      var skipper = require('skipper')();
      // Create and return the middleware function.
      return function(req, res, next) {
        // If we see the route we want skipped, just continue.
        if (req.url === '/coinbase/webhook') {
          return next();
        }
        // Otherwise use Skipper to parse the body.
        return skipper(req, res, next);
      };
    })()

  },

  /***************************************************************************
  *                                                                          *
  * The number of seconds to cache flat files on disk being served by        *
  * Express static middleware (by default, these files are in `.tmp/public`) *
  *                                                                          *
  * The HTTP static cache is only active in a 'production' environment,      *
  * since that's the only time Express will cache flat-files.                *
  *                                                                          *
  ***************************************************************************/

  // cache: 31557600000
};
