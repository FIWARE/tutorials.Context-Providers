//
// This proxy responds with random data.
//

const debug = require('debug')('proxy:server');
const Formatter = require('../lib/formatter');

//
// The Health Check endpoint returns some random data values to show it is functioning
//
function healthCheck(req, res) {
	debug('Random API is available - responding with some random values');
	res.status(200).send({
		boolean: randomValueForType('boolean'),
		number: randomValueForType('number'),
		structuredValue: randomValueForType('structuredValue'),
		text: randomValueForType('text'),
	});
}

//
// The Query Context endpoint responds with data in the NGSI v1 queryContext format
// This endpoint is called by the Orion Broker when "legacyForwarding"
// is set to "true" during registration
//
// For the random content provider, the response is in the form of random values
// which change with each request.
//
function queryContext(req, res) {
	const response = Formatter.formatAsV1Response(req, null, (name, type) => {
		return randomValueForType(type);
	});

	res.send(response);
}

//
// A function to generate some random responses.
//
function randomValueForType(type) {
	switch (type.toLowerCase()) {
		case 'boolean':
			return Math.random() >= 0.5;
		case 'float':
		case 'integer':
		case 'number':
			return Math.floor(Math.random() * 43);
		case 'structuredValue':
			return {
				somevalue: 'this',
			};
		case 'string':
		case 'text':
			const loremIpsum =
				'lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor ' +
				'incididunt ut labore et dolore magna aliqua. enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ' +
				'ut aliquip ex ea commodo consequat. duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore ' +
				'eu fugiat nulla pariatur. excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit ';
			const loremIpsumWordBank = loremIpsum.split(' ');

			const randy = Math.floor(Math.random() * 10) + 5;
			let ret = '';
			// eslint-disable-next-line id-blacklist
			for (let i = 0; i < randy; i++) {
				let newTxt =
					loremIpsumWordBank[Math.floor(Math.random() * (loremIpsumWordBank.length - 1))];
				if (
					ret.substring(ret.length - 1, ret.length) === '.' ||
					ret.substring(ret.length - 1, ret.length) === '?'
				) {
					newTxt = newTxt.substring(0, 1).toUpperCase() + newTxt.substring(1, newTxt.length);
				}
				ret += ' ' + newTxt;
			}
			return ret;
		default:
			return null;
	}
}

module.exports = {
	healthCheck,
	queryContext,
};
