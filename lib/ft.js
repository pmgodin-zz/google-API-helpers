/*
 * Helpers for Google Fusion Table
 */
var googleAPI = require('google-API-helpers');
var fs = require('fs');
var querystring = require('querystring');
var OAuth = require('oauth').OAuth;

// Transform CSVToArray to Array of objects
function datarow(csv){
	var data = new Array;
	for(i=0;i<csv.length;i++){
		if(csv[i].length==1 && csv[i][0]==''){
			// Remove trailling object
			csv[i] = undefined;
		}else{
			if(i>0){
				data.push({});
				for(value in csv[i]){
					data[i-1][csv[0][value]] = csv[i][value];
				}
			}
		}
	}
	return data;
}
// Thanks to Kirtan on  Stack Overflow
// http://stackoverflow.com/questions/1293147/javascript-code-to-parse-csv-data
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
 	// Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = (strDelimiter || ",");

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp((
    // Delimiters.
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

    // Quoted fields.
    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

    // Standard fields.
    "([^\"\\" + strDelimiter + "\\r\\n]*))"),"gi");

  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;

  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (arrMatches = objPattern.exec( strData )){

    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[ 1 ];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)){

      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push( [] );

    }

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[ 2 ]){
      
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      var strMatchedValue = arrMatches[ 2 ].replace(new RegExp( "\"\"", "g" ),"\"");
    } else {

      // We found a non-quoted value.
      var strMatchedValue = arrMatches[ 3 ];
    }

    // Now that we have our value string, let's add
    // it to the data array.
    arrData[ arrData.length - 1 ].push( strMatchedValue );
  }

  // Return the parsed data.
  return(arrData);
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

exports.QUERY = function(query,soa,callback){
	var method = (query.toLowerCase().indexOf("select")==0) ? "GET" : "POST";
	var sheetID = "https://www.google.com/fusiontables/api/query?";
	query = querystring.stringify({
		sql:	query
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
	method,
	soa.oauth_access_token,
	soa.oauth_access_token_secret,
	function (error, data, response) {
		if(error){
			console.log('TRY SHEET error', error);
			callback("Une erreur s'est produite, vérifier votre console pour plus de détails ...");
		}else{
	   	callback(datarow(CSVToArray(data)));
		}
	});
}
