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
const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;

async function notify(req, res) {
    const target = req.get('Target');

    if (!target) {
        return res.status(404).send();
    }

    const body = req.body;
    const subscriptionId = body.subscriptionId.startsWith(NGSI_LD_URN)
        ? body.subscriptionId
        : NGSI_LD_URN + 'Subscription:' + body.subscriptionId;

    const contentType = req.get('Accept') || 'application/json';
    const bodyIsJSONLD = req.get('Accept') === 'application/ld+json';
    const data = _.map(body.data, (entity) => {
        return convert.formatEntity(entity, bodyIsJSONLD, {});
    });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': contentType
        },
        throwHttpErrors: false,
        retry: 0,
        json: {
            id: 'urn:ngsi-ld:Notification:' + uuidv4(),
            type: 'Notification',
            notifiedAt: moment().tz('Etc/UTC').toISOString(),
            subscriptionId,
            data
        }
    };

    if (!bodyIsJSONLD) {
        options.headers['Link'] =
            '<' + JSON_LD_CONTEXT + '>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"';
    }

    got(target, options)
        .then((response) => {
            res.statusCode = response.statusCode;
            res.headers = response.headers;
            if (response.headers['content-type']) {
                res.type(response.headers['content-type']);
            }
            return res.status(response.statusCode).send(response.body);
        })
        .catch((error) => {
            return (code =
                error.code !== 'ENOTFOUND'
                    ? res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                          type: 'https://uri.etsi.org/ngsi-ld/errors/InternalError',
                          title: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                          message: `${target} caused an error: ${error.code}`
                      })
                    : res.status(StatusCodes.NOT_FOUND).send({
                          type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
                          title: getReasonPhrase(StatusCodes.NOT_FOUND),
                          message: `${target} is unavailable`
                      }));
        });
}

exports.notify = notify;
