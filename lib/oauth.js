var OAuth = require('node-oauth').OAuth;
var fs = require('fs');
var querystring = require('querystring');

exports.token = function(conf, req, oauthdata, confPath, callback) {
	// conf *** JSON Object containing google API infos like OAuth data and more.
  // conf *** Could be a JSON file path in wich case it will be converted to JSON object
  if(typeof conf != "object"){
  	confPath = conf;
  	conf = JSON.parse(fs.readFileSync(conf,'utf8'));
  }
  if(!req.session.oa) req.session.oa = {};
  
  var oa = new OAuth("https://www.google.com/accounts/OAuthGetRequestToken?"+querystring.stringify(oauthdata),
			"https://www.google.com/accounts/OAuthGetAccessToken",
			conf.appId,
			conf.appSecret,
			"1.0",
			conf.callbackUrl,
			"HMAC-SHA1");
	
	if(req.query['oauth_verifier'] && req.query['oauth_token']){
  	//SUCCESS?

		oa.getOAuthAccessToken(req.session.oa.oauth_token,req.session.oa.oauth_token_secret,
		req.param('oauth_verifier'),function(error, oauth_access_token, oauth_access_token_secret, results2) {
			if(error) {
				console.log('ACCESS TOKEN error', error);
		  	callback("Une erreur s'est produite, vérifier votre console pour plus de détails ...");
			}else{
				// store the access token in the session
				req.session.oa = oa;
				req.session.oa.oauth_access_token = oauth_access_token;
				req.session.oa.oauth_access_token_secret = oauth_access_token_secret;
				if(confPath){
					conf.oa = req.session.oa;
					fs.writeFileSync(confPath,JSON.stringify(conf),'utf8');
				}
				callback();
			}
		});
  }else{
  	if(!req.session.oa) req.session.oa = {};
  	if(!req.session.oa.oauth_access_token && !req.session.oa.oauth_access_token_secret){
	  	//TRY AUTH
	  	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
			  if(error){
			  	console.log('TRY AUTH error', error);
			  	callback({error:"Une erreur s'est produite, vérifier votre console pour plus de détails ..."});
			  }else{
			  	req.session.oa = oa;
					req.session.oa.oauth_token = oauth_token;
					req.session.oa.oauth_token_secret = oauth_token_secret;
			  	
			  	if(confPath){
						conf.oa = req.session.oa;
						fs.writeFileSync(confPath,JSON.stringify(conf),'utf8');
					}
			  	callback({redirect:"https://www.google.com/accounts/OAuthAuthorizeToken?oauth_token="+oauth_token});
			  }
			});
		}else{
			callback();
		}
  }
}