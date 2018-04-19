//
// This proxy responds with static data.
//

const debug = require('debug')('proxy:server');
const _ = require('lodash');


//
// The Health Check endpoint returns some  canned responses to show it is functioning
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
	const response = formatAsV1Response(req, (attr, req) => {
		return {
			name: attr,
			type: toTitleCase(req.params.type),
			value: staticResponses(req.params.type),
		};
	});

	res.send(response);
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
// A function for generating canned responses.
//
function staticResponses(type) {
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

//
// Formatting function for an NSGI v1 response to a context query.
//
function formatAsV1Response(req, formatter) {
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
			obj.contextElement.attributes.push(formatter(attr, req));
		});

		ngsiV1Response.contextResponses.push(obj);
	});

	return ngsiV1Response;
}



module.exports = {
	healthCheck,
	queryContext,
};
