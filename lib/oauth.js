var OAuth = require('node-oauth').OAuth;
var fs = require('fs');
var querystring = require('querystring');

exports.ggOAuth = function(conf, req, res, oauthdata, getpath) {
	// conf *** JSON Object containing google API infos like OAuth data and more.
  // conf *** Could be a JSON file path in wich case it will be converted to JSON object
  if(typeof conf != "object") conf = JSON.parse(fs.readFileSync(conf,'utf8'));
  
  var oa = new OAuth("https://www.google.com/accounts/OAuthGetRequestToken?"+querystring.stringify(oauthdata),
			"https://www.google.com/accounts/OAuthGetAccessToken",
			conf.appId,
			conf.appSecret,
			"1.0",
			conf.callbackUrl,
			"HMAC-SHA1");
	
	if(req.query['oauth_verifier'] && req.query['oauth_token']){
  	//SUCCESS?

		oa.getOAuthAccessToken(req.session.oauth_token,req.session.oauth_token_secret,
		req.param('oauth_verifier'),function(error, oauth_access_token, oauth_access_token_secret, results2) {
			if(error) {
				console.log('ACCESS TOKEN error', error);
		  	res.send("Une erreur s'est produite, vérifier votre console pour plus de détails ...");
			}else{
				// store the access token in the session
				req.session.oauth_access_token = oauth_access_token;
				req.session.oauth_access_token_secret = oauth_access_token_secret;
				
				res.redirect(getpath);
			}
		});
  }else{
  	if(!req.session.oauth_access_token && !req.session.oauth_access_token_secret){
	  	//TRY AUTH
	  	oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
			  if(error){
			  	console.log('TRY AUTH error', error);
			  	res.send("Une erreur s'est produite, vérifier votre console pour plus de détails ...");
			  }else{
			  	req.session.oa = oa;
					req.session.oauth_token = oauth_token;
					req.session.oauth_token_secret = oauth_token_secret;
			  	res.redirect("https://www.google.com/accounts/OAuthAuthorizeToken?oauth_token="+oauth_token);
			  }
			});
		}else{
			res.redirect(getpath);
		}
  }
}