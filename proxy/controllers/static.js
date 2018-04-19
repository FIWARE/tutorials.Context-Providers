//
// This proxy responds with static data.
//

const debug = require('debug')('proxy:server');
const _ = require('lodash');


function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

//
// A structure for generating canned responses.
//
function staticResponses(type) {
	switch (type.toLowerCase()) {
		case 'boolean':
			return true;
		case 'number':
			return 42;
		case 'structuredValue':
			return {
				somevalue: 'this',
			};
		case 'text':
			return 'I never could get the hang of thursdays';
		default:
			return null;
	}
}

//
// The Health Check function returns some  canned responses to show it is functioning
//
function healthCheck(req, res) {
	debug('Static API is available - responding with some static values');
	res.status(200).send({
		boolean: staticResponses('boolean'),
		number: staticResponses('number'),
		structuredValue: staticResponses('structuredValue'),
		text: staticResponses('text'),
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
	const cannedResponse = {
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
			obj.contextElement.attributes.push({
				name: attr,
				type: toTitleCase(req.params.type),
				value: staticResponses(req.params.type),
			});
		});

		cannedResponse.contextResponses.push(obj);
	});

	res.send(cannedResponse);
}

module.exports = {
	healthCheck,
	queryContext,
};
