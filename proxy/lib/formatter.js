const _ = require('lodash');

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
function formatAsV1Response(req, data, formatter) {
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
			obj.contextElement.attributes.push(formatter(attr, req, data));
		});

		ngsiV1Response.contextResponses.push(obj);
	});

	return ngsiV1Response;
}

module.exports = {
	formatAsV1Response,
	toTitleCase,
};
