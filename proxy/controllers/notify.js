const _ = require('lodash');
const convert = require('../lib/convert');
const debug = require('debug')('proxy:notify');
const JSON_LD_CONTEXT =
    process.env.CONTEXT_URL || 'https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld';

const NGSI_LD_URN = 'urn:ngsi-ld:';
const got = require('got');
const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');
const util = require('util');


async function notify(req, res) {
	const headers = req.headers;
	const body = req.body;
	const subscriptionId =  body.subscriptionId.startsWith(NGSI_LD_URN) ?  body.subscriptionId: NGSI_LD_URN + 'Subscription:' + body.subscriptionId;

    const contentType = req.get('Accept') || 'application/json';
    const bodyIsJSONLD = req.get('Accept') === 'application/ld+json';
    const data = _.map(body.data, (entity) => {
        	return convert.formatEntity(entity, bodyIsJSONLD, {})
        } );
    
    const target = req.get('Target');

	
	if (target){ 
    
    	const options = {
	        method: 'POST',
	        headers: {
	        	'Content-Type': contentType,
	        },
	        throwHttpErrors: false,
	        retry:  0,
	        responseType: 'json',
	        json: {
					id: 'urn:ngsi-ld:Notification:' + uuidv4(),
					type: 'Notification',
					notifiedAt: moment().tz('Etc/UTC').toISOString(),
					subscriptionId,
					data
				}
    	};

    	if (!bodyIsJSONLD) {
        	options.headers[ 'Link'] =
            '<' + JSON_LD_CONTEXT + '>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"';
        }

        got(target, options)
        .then((response) => {
            return res.status(response.statusCode).send(response.body);
        })
        .catch((error) => {
            debug('Error: %s', JSON.stringify(util.inspect(error), null, 4));
            return res.status(error.response ? error.response.statusCode : 500).send(error);
        });
	} else{
		return res.status(404).send();
	}


/*
    if (!bodyIsJSONLD) {
        res.header(
            'Link',
            '<' + JSON_LD_CONTEXT + '>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
        );
    }
    res.header('Content-Type', contentType );
    res.type(contentType);
	/*return res.send({

		id: 'urn:ngsi-ld:Notification:' + uuidv4(),
    	type: 'Notification',
    	notifiedAt: moment().tz('Etc/UTC').toISOString(),
		subscriptionId,
		data
	});*/
	 
}


exports.notify = notify;  