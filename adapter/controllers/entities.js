/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const debug = require('debug')('adapter:entities');
const got = require('got').extend({
    timeout: {
        request: 1000
    }
});
const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');
const moment = require('moment-timezone');
const path = require('node:path');
const NGSI_LD = require('../lib/ngsi-ld');
const Constants = require('../lib/constants');

/**
 * "Access Permitted" forwarding. Forward the proxied request and
 * return the response.
 *
 * @param req - the incoming request
 * @param res - the response to return
 */
async function proxyResponse(req, res) {
    const contentType = req.get('Accept');
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const queryOptions = req.query.options ? req.query.options.split(',') : null;
    const queryAttrs = req.query.attrs ? req.query.attrs.split(',') : null;
    const queryType = req.query.type ? req.query.type.split(',') : [];
    const queryQ = req.query.q;

    const transformFlags = {};
    transformFlags.sysAttrs = !!(queryOptions && queryOptions.includes('sysAttrs'));
    transformFlags.concise = !!(queryOptions && queryOptions.includes('concise'));
    transformFlags.keyValues = !!(queryOptions && queryOptions.includes('keyValues'));
    transformFlags.attrsOnly = req.path.split(path.sep).includes('attrs');
    let v2queryOptions = null;
    let ldPayload = null;
    if (req.query.options) {
        v2queryOptions = _.without(queryOptions, 'concise', 'sysAttrs');
    }

    const headers = {};
    const tenant = req.header('NGSILD-Tenant') || null;
    headers['x-forwarded-for'] = Constants.getClientIp(req);
    if (tenant) {
        headers['fiware-service'] = tenant;
    }
    headers.accept = 'application/json';

    const options = {
        method: req.method,
        headers,
        throwHttpErrors: false,
        retry: 0
    };

    if (req.query) {
        options.searchParams = req.query;
        delete options.searchParams.options;

        if (queryType.length > 1) {
            delete options.searchParams.type;
        }
        if (v2queryOptions && v2queryOptions.length > 0) {
            options.searchParams.options = v2queryOptions.join(',');
        }

        if (queryAttrs && queryAttrs.length > 0) {
            options.searchParams.attrs = queryAttrs.join(',');
        }
        if (queryQ) {
            options.searchParams.q = queryQ.replace(/"/gi, '').replace(/%22/gi, '');
        }
    }

    if (transformFlags.sysAttrs) {
        options.searchParams = options.searchParams || {};
        options.searchParams.sysAttrs = 'true';
    }

    const response = await got(Constants.v2BrokerURL(req.path), options);

    res.statusCode = response.statusCode;
    if (tenant) {
        res.set('NGSILD-Tenant', tenant);
    }
    const v2Body = JSON.parse(response.body);
    const type = v2Body.type;
    if (!Constants.is2xxSuccessful(res.statusCode)) {
        return Constants.sendError(res, v2Body);
    }

    if (queryType.length > 1 && !queryType.includes(type)) {
        res.set('Content-Type', 'application/json');
        res.type('application/json');
        return res.status(StatusCodes.NOT_FOUND).send({
            type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
            title: getReasonPhrase(StatusCodes.NOT_FOUND),
            detail: `${req.path}`
        });
    }
    if (transformFlags.keyValues) {
        ldPayload = v2Body;
    } else if (transformFlags.attrsOnly) {
        ldPayload = NGSI_LD.formatAttribute(v2Body, transformFlags);
    } else if (v2Body instanceof Array) {
        ldPayload = _.map(v2Body, (entity) => {
            return NGSI_LD.formatEntity(entity, isJSONLD, transformFlags);
        });
    } else {
        ldPayload = NGSI_LD.formatEntity(v2Body, isJSONLD, transformFlags);
    }
    ldPayload = Constants.appendContext(ldPayload, isJSONLD);
    Constants.linkContext(res, isJSONLD);
    if (!isJSONLD) {
        res.type(!isJSONLD ? 'application/json' : 'application/json');
    }
    return Constants.sendResponse(res, v2Body, ldPayload, contentType);
}

exports.response = proxyResponse;
