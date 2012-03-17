/*
 * Helpers for Google Fusion Table
 */
var googleAPI = require('google-API-helpers');
var fs = require('fs');
var querystring = require('querystring');
var OAuth = require('node-oauth').OAuth;

function datarow(csv){
	csv = csv.split('\n');
	var data = new Array;
	for(i=0;i<csv.length;i++){
		csv[i] = csv[i].split('","');
		if(i>0){
			
		}
	}
	console.log(csv.length);
	return csv;
}

exports.init = function(conf, req, callback) {
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
  googleAPI.ggOAuth.token(conf, req, oauthdata, confPath, callback);
};

exports.SELECT = function(SELECT,soa,callback){
	var sheetID = "https://www.google.com/fusiontables/api/query?";
	var query = querystring.stringify({
		sql:	SELECT
	});
	sheetID += query;
			
	oa = new OAuth(soa._requestUrl,
		soa._accessUrl,
		soa._consumerKey,
		soa._consumerSecret,
		soa._version,
		soa._authorize_callback,
		soa._signatureMethod);
			
	oa._headers['GData-Version'] = '3.0'; 
		
	oa.getProtectedResource(
	sheetID,
	"GET",
	soa.oauth_access_token,
	soa.oauth_access_token_secret,
	function (error, data, response) {
		if(error){
			console.log('TRY SHEET error', error);
			callback("Une erreur s'est produite, vérifier votre console pour plus de détails ...");
		}else{
	   	callback(datarow(data));
		}
	});
}
