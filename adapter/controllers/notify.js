/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const _ = require('lodash');
const NGSI_LD = require('../lib/ngsi-ld');
const Constants = require('../lib/constants');
const debug = require('debug')('adapter:notify');

const got = require('got').extend({
    timeout: {
        request: 1000
    }
});
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
    const subscriptionId = body.subscriptionId.startsWith(Constants.NGSI_LD_URN)
        ? body.subscriptionId
        : Constants.NGSI_LD_URN + 'Subscription:' + body.subscriptionId;

    const contentType = req.get('Accept') || 'application/json';
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const data = _.map(body.data, (entity) => {
        return NGSI_LD.formatEntity(entity, isJSONLD, {});
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

    if (!isJSONLD) {
        options.headers['Link'] =
            '<' + JSON_LD_CONTEXT + '>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"';
    }

    const response = await got(target, options);

    res.statusCode = response.statusCode;
    if (response.headers['content-type']) {
        res.set('content-type', response.headers['content-type']);
        res.type(response.headers['content-type']);
    }
    return res.status(response.statusCode).send(response.body);
}

exports.notify = notify;
