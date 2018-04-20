//
// This proxy responds with static data.
//

const debug = require('debug')('proxy:server');
const Formatter = require('../lib/formatter');

//
// The Health Check endpoint returns some  canned responses to show it is functioning
//
function healthCheck(req, res) {
	debug('Static API is available - responding with some static values');
	res.status(200).send({
		boolean: staticValueForType('boolean'),
		number: staticValueForType('number'),
		structuredValue: staticValueForType('structuredValue'),
		text: staticValueForType('text'),
	});
}

//
// The Query Context endpoint responds with data in the NGSI v1 queryContext format
// This endpoint is called by the Orion Broker when "legacyForwarding"
// is set to "true" during registration.
//
// For the static content provider, the response is in the form of static data.
//
function queryContext(req, res) {
	const response = Formatter.formatAsV1Response(req, null, (name, type) => {
		return staticValueForType(type);
	});

	res.send(response);
}

//
// A function for generating canned responses.
//
function staticValueForType(type) {
	switch (type.toLowerCase()) {
		case 'boolean':
			return true;
		case 'float':
		case 'integer':
		case 'number':
			return 42;
		case 'structuredValue':
			return {
				somevalue: 'this',
			};
		case 'string':
		case 'text':
			return 'I never could get the hang of thursdays';
		default:
			return null;
	}
}

module.exports = {
	healthCheck,
	queryContext,
};
