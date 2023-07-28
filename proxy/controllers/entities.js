/*
 * Copyright 2021 -  Universidad Politécnica de Madrid.
 *
 * This file is part of PEP-Proxy
 *
 */

//const config_service = require('./config_service');
//const config = config_service.get_config();
const debug = require('debug')('proxy:entities');
const got = require('got');
const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');
const moment = require('moment-timezone');
const path = require('node:path');
const convert = require('../lib/convert');

const PROXY_URL = process.env.PROXY || 'http://localhost:1027/v2';
const JSON_LD_CONTEXT =
    process.env.CONTEXT_URL || 'https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld';

/**
 * Return an "Internal Error" response. These should not occur
 * during standard operation
 *
 * @param res - the response to return
 * @param e - the error that occurred
 * @param component - the component that caused the error
 */
function internalError(res, e, component) {
    const message = e ? e.message : undefined;
    debug(`Error in ${component} communication `, message ? message : e);
    res.setHeader('Content-Type', errorContentType);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
        template({
            type: 'urn:dx:as:InternalServerError',
            title: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
            message
        })
    );
}

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

    headers['x-forwarded-for'] = convert.getClientIp(req);
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
    }

    if (transformFlags.sysAttrs) {
        options.searchParams = options.searchParams || {};
        options.searchParams.sysAttrs = 'true';
    }

    try {
        const response = await got(PROXY_URL + req.path, options);

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

        if (!bodyIsJSONLD) {
            res.header(
                'Link',
                '<' + JSON_LD_CONTEXT + '>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
            );
        }

        if (transformFlags.keyValues) {
            ldPayload = body;
            if (bodyIsJSONLD) {
                ldPayload['@context'] = JSON_LD_CONTEXT;
            }
        } else if (transformFlags.attrsOnly) {
            ldPayload = convert.formatAttribute(body, transformFlags);
            if (bodyIsJSONLD) {
                ldPayload['@context'] = JSON_LD_CONTEXT;
            }
        } else if (body instanceof Array) {
            ldPayload = _.map(body, (entity) => {
                return convert.formatEntity(entity, bodyIsJSONLD, transformFlags);
            });
        } else {
            ldPayload = convert.formatEntity(body, bodyIsJSONLD, transformFlags);
        }

        res.statusCode = response.statusCode;
        res.headers = response.headers;
        if (!bodyIsJSONLD) {
            res.type(!bodyIsJSONLD ? 'application/json' : 'application/json');
        }
        return ldPayload ? res.send(ldPayload) : res.send();
    } catch (error) {
        return error.code !== 'ENOTFOUND'
            ? res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                  type: 'https://uri.etsi.org/ngsi-ld/errors/InternalError',
                  title: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                  message: `${req.path} caused an error:  ${error.code}`
              })
            : res.status(StatusCodes.NOT_FOUND).send({
                  type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
                  title: getReasonPhrase(StatusCodes.NOT_FOUND),
                  message: `${req.path} is unavailable`
              });
    }
}

exports.response = proxyResponse;
exports.internalError = internalError;
