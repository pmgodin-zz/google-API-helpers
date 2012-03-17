/*
 * Helpers for Google Fusion Table
 */
var googleAPI = require('google-API-helpers');
var fs = require('fs');
var querystring = require('querystring');
var OAuth = require('node-oauth').OAuth;

exports.init = function(conf, req, res, getpath) {
  // conf *** JSON Object containing google API infos like OAuth data and more.
  // conf *** Could be a JSON file path in wich case it will be converted to JSON object
  var confPath = null;
  if(typeof conf != "object"){
  	confPath = conf;
  	conf = JSON.parse(fs.readFileSync(conf,'utf8'));
  }
  var oauthdata = {
  	scope: "https://www.googleapis.com/auth/fusiontables",
  	access_type: "offline"
  };
  googleAPI.ggOAuth.token(conf, req, res, oauthdata, getpath, confPath);
};

exports.SELECT = function(SELECT,req,callback){
	var sheetID = "https://www.google.com/fusiontables/api/query?";
	var query = querystring.stringify({
		sql:	SELECT
	});
	sheetID += query;
			
	oa = new OAuth(req.session.oa._requestUrl,
		req.session.oa._accessUrl,
		req.session.oa._consumerKey,
		req.session.oa._consumerSecret,
		req.session.oa._version,
		req.session.oa._authorize_callback,
		req.session.oa._signatureMethod);
			
	oa._headers['GData-Version'] = '3.0'; 
		
	oa.getProtectedResource(
	sheetID,
	"GET",
	req.session.oa.oauth_access_token,
	req.session.oa.oauth_access_token_secret,
	function (error, data, response) {
		if(error){
			console.log('TRY SHEET error', error);
			callback("Une erreur s'est produite, vérifier votre console pour plus de détails ...");
		}else{
	   	callback(data);
		}
	});
}
