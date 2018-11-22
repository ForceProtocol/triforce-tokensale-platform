module.exports = {

  errorResponseRedirect: function (err, req, res, route) {
    let msg = '';
    if(_.isString(err.error))
      msg = err.error;
    else msg = err.error ? err.error.err : err.message;

    if(!_.isString(msg))
      msg = "There was a problem setting your ethereum address. Please contact us at pete@forceprotocol.io or telegram https://t.me/triforcetokens and we will resolve the issue as soon as possible.";

    req.addFlash('errors', msg);

    if(err.statusCode === 401){
      delete req.session.token;
      delete req.session.user;
    }

    let rsp = {};
    if (err instanceof Error) {
      rsp = {err: err.message};
    } else {
      rsp = err;
    }

    if(!route) return res.serverError();
    res.redirect(route);

  },

  errorResponse: function(err, res, responseFormat){
    sails.log.debug(err);
    let rsp = {}, _status = 500;
    if(err instanceof CustomError){
      rsp = {err: err.message};
      _status = err.status || 500;
  
    }else if(err instanceof Error){
      rsp = {err: err.message};
    }else{
      rsp = err;
    }
  
    if(responseFormat && responseFormat == 'xml'){
      const jstoxml = require('jstoxml');
      res.setHeader("Content-type", "text/xml");
      return res.send(jstoxml.toXML(rsp, { header: true, indent: '    ' }), _status);
    }else{
      res.send(rsp, _status);
    }
  },

};
