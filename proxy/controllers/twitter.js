//
// This proxies responses from the Twitter API.
//
// For more information see: https://developer.twitter.com/
//

const debug = require('debug')('proxy:server');
const Twitter = require('twitter');
const request = require('request-promise');

// The  Twitter Consumer Key & Consumer Secret are personal to you.
// Do not place them directly in the code - read them in as environment variables.
// To do this you will need to add them to the docker-compose.yml file.
//
// To get Consumer Key & Consumer Secret, you have to create an app in Twitter via
//     https://apps.twitter.com/app/new
// Then you'll be taken to a page containing Consumer Key & Consumer Secret.
//
const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
const TWITTER_OAUTH_TOKEN_URL = 'https://api.twitter.com/oauth2/token';
const TWITTER_SEARCH_PATH = 'search/tweets';

//
// The Health Check function merely requests tweets about FIWARE
// to check that your CONSUMER KEY and CONSUMER SECRET are valid.
//
function healthCheck(req, res) {
	makeTwitterRequest(
		{ q: 'FIWARE' },
		(error, tweets) => {
			debug(
				'Twitter is responding - your keys are valid  - responding with the tweets about FIWARE.'
			);
			res.send(tweets);
		},
		err => {
			debug(
				'Twitter is not responding - have you added your Consumer Key & Consumer Secret as environment variables?'
			);
			res.statusCode = err.statusCode;
			res.send(err);
		}
	);
}

//
// The Query Context endpoint responds with data in the NGSI v1 queryContext format
// This endpoint is called by the Orion Broker when "legacyForwarding"
// is set to "true" during registration
//
function queryContext(req, res) {
	debug('Listening on ' + JSON.stringify(req.params));
	debug('Listening on ' + JSON.stringify(req.body));
	debug('Listening on ' + JSON.stringify(req.query));
	res.send('respond with a resource');
}

//
// When calling the twitter library, for an application with read-only
// access we need to supply CONSUMER KEY, CONSUMER SECRET and a bearer token.
//
// The twitter API uses OAuth to offer the access token so first make an OAuth
// request to obtain the token, then use the token in the actual request.
//
function makeTwitterRequest(params, callback, errorHandler) {
	request({
		url: TWITTER_OAUTH_TOKEN_URL,
		method: 'POST',
		auth: {
			user: TWITTER_CONSUMER_KEY,
			pass: TWITTER_CONSUMER_SECRET,
		},
		form: {
			grant_type: 'client_credentials',
		},
	})
		.then(function(result) {
			debug('Making a Twitter Search API request: ' + JSON.stringify(params));
			const client = new Twitter({
				consumer_key: TWITTER_CONSUMER_KEY,
				consumer_secret: TWITTER_CONSUMER_SECRET,
				bearer_token: JSON.parse(result).access_token,
			});

			client.get(TWITTER_SEARCH_PATH, params, callback);
		})
		.catch(errorHandler);
}

module.exports = {
	healthCheck,
	queryContext,
};
