/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const debug = require('debug')('adapter:entities');
const got = require('got');
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
    const headers = req.headers;
    const contentType = req.get('Accept');
    const bodyIsJSONLD = req.get('Accept') === 'application/ld+json';
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

    headers['x-forwarded-for'] = Constants.getClientIp(req);
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

    try {

        const response = await got(Constants.v2BrokerURL(req.path), options);

        res.statusCode = response.statusCode;
        res.headers = response.headers;
        res.headers['content-type'] = contentType;
        res.type(contentType);
        const body = JSON.parse(response.body);
        const type = body.type;
        if (res.statusCode === 400) {
            res.headers['content-type'] = 'application/json';
            res.type('application/json');
            return res.send(body);
        }

        if (queryType.length > 1 && !queryType.includes(type)) {
            res.statusCode = 404;
            return res.send();
        }

        if (transformFlags.keyValues) {
            ldPayload = body;
        } else if (transformFlags.attrsOnly) {
            ldPayload = NGSI_LD.formatAttribute(body, transformFlags);
        } else if (body instanceof Array) {
            ldPayload = _.map(body, (entity) => {
                return NGSI_LD.formatEntity(entity, bodyIsJSONLD, transformFlags);
            });
        } else {
            ldPayload = NGSI_LD.formatEntity(body, bodyIsJSONLD, transformFlags);
        }
        ldPayload = Constants.appendContext(ldPayload, bodyIsJSONLD);
        Constants.linkContext(res, bodyIsJSONLD);

        res.statusCode = response.statusCode;
        res.headers = response.headers;
        if (!bodyIsJSONLD) {
            res.type(!bodyIsJSONLD ? 'application/json' : 'application/json');
        }
        return ldPayload ? res.send(ldPayload) : res.send();
    } catch (error) {
        debug(error);
        return error.code !== 'ENOTFOUND'
            ? res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                  type: 'urn:ngsi-ld/errors/InternalError',
                  title: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                  message: `${req.path} caused an error:  ${error.code}`
              })
            : res.status(StatusCodes.NOT_FOUND).send({
                  type: 'urn:ngsi-ld/errors/ResourceNotFound',
                  title: getReasonPhrase(StatusCodes.NOT_FOUND),
                  message: `${req.path} is unavailable`
              });
    }
}

exports.response = proxyResponse;
