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
		array: randomValueForType('array'),
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
	const loremIpsum =
		'lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor ' +
		'incididunt ut labore et dolore magna aliqua. enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ' +
		'ut aliquip ex ea commodo consequat. duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore ' +
		'eu fugiat nulla pariatur. excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit ';
	const loremIpsumWordBank = loremIpsum.split(' ');
	const randy = Math.floor(Math.random() * 10) + 5;
	let ret;

	switch (type.toLowerCase()) {
		case 'array':
			ret = [];
			// eslint-disable-next-line id-blacklist
			for (let i = 0; i < randy; i++) {
				ret.push(loremIpsumWordBank[Math.floor(Math.random() * (loremIpsumWordBank.length - 1))]);
			}
			break;
		case 'boolean':
			ret = Math.random() >= 0.5;
			break;

		case 'float':
			ret = Math.floor(Math.random() * 430) / 10.0;
			break;
		case 'integer':
		case 'number':
			ret = Math.floor(Math.random() * 43);
			break;
		case 'structuredValue':
			ret = {
				somevalue: 'this',
			};
			break;
		case 'string':
		case 'text':
			ret = '';
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
			break;
		default:
			return null;
	}
	return ret;
}

module.exports = {
	healthCheck,
	queryContext,
};
