//
// This proxies responses from the Weather Underground API.
//
// For more information see: https://www.wunderground.com/weather/api/d/docs?MR=1
//

const debug = require('debug')('proxy:server');
const request = require('request-promise');

//  The  Weather API key is personal to you. 
//  Do not place them directly in the code - read them in as environment variables.
//  To do this you will need to add them to the docker-compose.yml file.
//
//	Before you start using the Weather API,  Sign up for a key at https://www.wunderground.com/weather/api/
//
const WUNDERGROUND_URL =
	'http://api.wunderground.com/api/' + process.env.WUNDERGROUND_KEY_ID + '/conditions/q/';

//
// The Health Check function merely requests a weather forecast from Berlin
// to check that your API KEY ID is valid.
//
function healthCheck(req, res) {
	request({
		url: WUNDERGROUND_URL + 'Germany/Berlin.json',
		method: 'GET',
	})
		.then(function(result) {
			debug('Weather API is available - KeyID is valid  - responding with the weather for Berlin.');
			res.set('Content-Type', 'application/json');
			res.send(result);
		})
		.catch(function(err) {
			debug('Weather API is not responding - have you added your KeyID as an environment variable?');
			res.statusCode = err.statusCode;
			res.send(err);
		});
}

//  
// The Query Context endpoint responds with data in the NGSI v1 queryContext format
// This endpoint is called by the Orion Broker when "legacyForwarding" 
// is set to "true" during registration
//
function queryContext(req, res, next) {
	debug('Listening on ' + JSON.stringify(req.params));
	debug('Listening on ' + JSON.stringify(req.body));
	debug('Listening on ' + JSON.stringify(req.query));
	res.send('respond with a resource');
}

module.exports = {
	healthCheck,
	queryContext,
};
