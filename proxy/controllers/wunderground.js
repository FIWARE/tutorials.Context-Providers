//
// This proxies responses from the Weather Underground API.
//
// For more information see: https://www.wunderground.com/weather/api/d/docs?MR=1
//

const debug = require('debug')('proxy:server');
const request = require('request-promise');
const _ = require('lodash');

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
	makeWeatherRequest('Germany/Berlin')
		.then(function(result) {
			const response = JSON.parse(result).response || {};
			if (response.error) {
				throw new Error({ message: 'API Key Not Found', statusCode: 401 });
			}
			debug('Weather API is available - KeyID is valid  - responding with the weather for Berlin.');
			res.set('Content-Type', 'application/json');
			res.send(result);
		})
		.catch(function(err) {
			debug(
				'Weather API is not responding - have you added your KeyID as an environment variable?'
			);
			res.statusCode = err.statusCode || 501;
			res.send(err);
		});
}

//
// The Query Context endpoint responds with data in the NGSI v1 queryContext format
// This endpoint is called by the Orion Broker when "legacyForwarding"
// is set to "true" during registration
//
function queryContext(req, res) {
	makeWeatherRequest(req.params.queryString)
		.then(function(result) {
			const observation = JSON.parse(result).current_observation;

			if (observation == null) {
				throw new Error({ message: 'Not Found', statusCode: 404 });
			}

			res.set('Content-Type', 'application/json');
			res.send(
				formatAsV1Response(req, observation, (attr, req, observation) => {
					return {
						name: attr,
						type: toTitleCase(req.params.type),
						value: observation[req.params.attr],
					};
				})
			);
		})
		.catch(function(err) {
			debug(err);
			res.statusCode = err.statusCode || 501;
			res.send(err);
		});
}

//
// When calling the Weather API we need to supply the API Key as part of the
// URL. This method logs the request and appends the query to the base URL
//
function makeWeatherRequest(query) {
	debug('Making a Weather API request: ' + query);
	return request({
		url: WUNDERGROUND_URL + query + '.json',
		method: 'GET',
	});
}

//
// Entity types are typically title cased following Schema.org
//
function toTitleCase(str) {
	return str.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

//
// Formatting function for an NSGI v1 response to a context query.
//
function formatAsV1Response(req, observation, formatter) {
	const ngsiV1Response = {
		contextResponses: [],
	};

	_.forEach(req.body.entities, function(entity) {
		const obj = {
			contextElement: {
				attributes: [],
				id: entity.id,
				isPattern: 'false',
				type: entity.type,
			},
			statusCode: {
				code: '200',
				reasonPhrase: 'OK',
			},
		};

		_.forEach(req.body.attributes, function(attr) {
			obj.contextElement.attributes.push(formatter(attr, req, observation));
		});

		ngsiV1Response.contextResponses.push(obj);
	});

	return ngsiV1Response;
}

module.exports = {
	healthCheck,
	queryContext,
};

module.exports = {
	healthCheck,
	queryContext,
};
