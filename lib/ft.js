/*
 * Helpers for Google Fusion Table
 */
var ggOAuth = require('google-API-helpers');
var fs = require('fs');

exports.init = function(conf, req, res, getpath) {
  // conf *** JSON Object containing google API infos like OAuth data and more.
  // conf *** Could be a JSON file path in wich case it will be converted to JSON object
  if(typeof conf != "object") conf = JSON.parse(fs.readFileSync(conf,'utf8'));
  var oauthdata = {scope: "https://www.googleapis.com/auth/fusiontables"};
  ggOAuth.ggOAuth(conf, req, res, oauthdata, getpath,function(){
  	console.log("connected");
  });
};

