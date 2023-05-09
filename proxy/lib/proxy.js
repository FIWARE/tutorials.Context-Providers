/*
 * Copyright 2021 -  Universidad Politécnica de Madrid.
 *
 * This file is part of PEP-Proxy
 *
 */

//const config_service = require('./config_service');
//const config = config_service.get_config();
const debug = require('debug')('proxy:access');
const got = require('got');
const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');
const moment = require('moment-timezone');
const path = require('node:path');

const PROXY_URL = process.env.PROXY || 'http://localhost:1026/v2';
const NGSI_LD_URN = 'urn:ngsi-ld:';
const JSON_LD_CONTEXT =
    process.env.CONTEXT_URL || 'https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld';
const TIMESTAMP_ATTRIBUTE = 'TimeInstant';
const DATETIME_DEFAULT = '1970-01-01T00:00:00.000Z';
const ATTRIBUTE_DEFAULT = null;

//(config.app.ssl ? 'https://' : 'http://') + config.app.host + ':' + config.app.port;
const template = require('handlebars').compile(
    `{
    "type": "{{type}}",
    "title": "{{title}}",
    "detail": "{{message}}"
  }`
);

const errorContentType = 'application/json';

/**
 * Determines if a value is of type float
 *
 * @param      {String}   value       Value to be analyzed
 * @return     {boolean}              True if float, False otherwise.
 */
function isFloat(value) {
    return !isNaN(value) && value.toString().indexOf('.') !== -1;
}

/**
 * Add the client IP of the proxy client to the list of X-forwarded-for headers.
 *
 * @param req - the incoming request
 * @return a string representation of the X-forwarded-for header
 */
function getClientIp(req) {
    let ip = req.ip;
    if (ip.substr(0, 7) === '::ffff:') {
        ip = ip.substr(7);
    }
    let forwardedIpsStr = req.header('x-forwarded-for');

    if (forwardedIpsStr) {
        // 'x-forwarded-for' header may return multiple IP addresses in
        // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
        // the first one
        forwardedIpsStr += ',' + ip;
    } else {
        forwardedIpsStr = String(ip);
    }

    return forwardedIpsStr;
}

/**
 * Amends an NGSIv2 attribute to NGSI-LD format
 * All native JSON types are respected and cast as Property values
 * Relationships must be give the type relationship
 *
 * @param      {String}   attr       Attribute to be analyzed
 * @return     {Object}              an object containing the attribute in NGSI-LD
 *                                   format
 */

function convertAttrNGSILD(attr, transformFlags) {
    // eslint eqeqeq - deliberate double equals to include undefined.
    if (attr.value == null || Number.isNaN(attr.value)) {
        return undefined;
    }
    let obj = { type: 'Property', value: attr.value };

    switch (attr.type.toLowerCase()) {
        // Properties
        case 'property':
        case 'string':
        case 'text':
        case 'textunrestricted':
            break;

        // Other Native JSON Types
        case 'boolean':
            obj.value = !!attr.value;
            break;
        case 'float':
            if (isNaN(attr.value)) {
                obj = undefined;
            } else {
                obj.value = Number.parseFloat(attr.value);
            }
            break;
        case 'integer':
            if (isNaN(attr.value)) {
                obj = undefined;
            } else {
                obj.value = Number.parseInt(attr.value);
            }
            break;
        case 'number':
            if (isNaN(attr.value)) {
                obj = undefined;
            } else if (isFloat(attr.value)) {
                obj.value = Number.parseFloat(attr.value);
            } else {
                obj.value = Number.parseInt(attr.value);
            }
            break;

        // Temporal Properties
        case 'datetime':
            obj.value = {
                '@type': 'DateTime',
                '@value': moment.tz(attr.value, 'Etc/UTC').toISOString()
            };
            break;
        case 'date':
            obj.value = {
                '@type': 'Date',
                '@value': moment.tz(attr.value, 'Etc/UTC').format(moment.HTML5_FMT.DATE)
            };
            break;
        case 'time':
            obj.value = {
                '@type': 'Time',
                '@value': moment.tz(attr.value, 'Etc/UTC').format(moment.HTML5_FMT.TIME_SECONDS)
            };
            break;

        // GeoProperties
        case 'geoproperty':
        case 'point':
        case 'geo:point':
        case 'geo:json':
        case 'linestring':
        case 'geo:linestring':
        case 'polygon':
        case 'geo:polygon':
        case 'multipoint':
        case 'geo:multipoint':
        case 'multilinestring':
        case 'geo:multilinestring':
        case 'multipolygon':
        case 'geo:multipolygon':
            obj.type = 'GeoProperty';
            obj.value = attr.value;
            break;

        // Relationships
        case 'relationship':
            obj.type = 'Relationship';
            obj.object = attr.value;
            delete obj.value;
            break;

        // LanguageProperties
        case 'languageproperty':
            obj.type = 'LanguageProperty';
            obj.languageMap = attr.value;
            delete obj.value;
            break;

        default:
            obj.value = { '@type': attr.type, '@value': attr.value };
            break;
    }

    if (attr.metadata) {
        let timestamp;
        Object.keys(attr.metadata).forEach(function (key) {
            switch (key) {
                case TIMESTAMP_ATTRIBUTE:
                    timestamp = attr.metadata[key].value;
                    if (timestamp === ATTRIBUTE_DEFAULT || !moment(timestamp).isValid()) {
                        obj.observedAt = DATETIME_DEFAULT;
                    } else {
                        obj.observedAt = moment.tz(timestamp, 'Etc/UTC').toISOString();
                    }
                    break;
                case 'unitCode':
                    obj.unitCode = attr.metadata[key].value;
                    break;
                default:
                    obj[key] = convertAttrNGSILD(attr.metadata[key]);
            }
        });
        delete obj.TimeInstant;
    }

    if (transformFlags.concise) {
        delete obj.type;
        if (obj.value && _.isEmpty(attr.metadata)) {
            obj = obj.value;
        }
    }

    delete obj.metadata;
    return obj;
}

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

    /**
     * Amends an NGSIv2 payload to NGSI-LD format
     *
     * @param      {Object}   value       JSON to be converted
     * @return     {Object}               NGSI-LD payload
     */

    function formatAsNGSILD(json) {
        const obj = {};
        if (bodyIsJSONLD) {
            obj['@context'] = JSON_LD_CONTEXT;
        }

        let id;
        Object.keys(json).forEach(function (key) {
            switch (key) {
                case 'id':
                    id = json[key];
                    obj[key] = id;
                    if (!id.startsWith(NGSI_LD_URN)) {
                        obj[key] = NGSI_LD_URN + json.type + ':' + id;
                        debug('Amending id to a valid URN: %s', obj[key]);
                    }
                    break;
                case 'type':
                    obj[key] = json[key];
                    break;
                case TIMESTAMP_ATTRIBUTE:
                    // Timestamp should not be added as a root
                    // element for NSGI-LD.
                    break;
                default:
                    obj[key] = convertAttrNGSILD(json[key], transformFlags);
            }
        });

        delete obj.TimeInstant;
        return obj;
    }

    headers['x-forwarded-for'] = getClientIp(req);
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

    const response = await got(PROXY_URL + req.path, options);

    res.statusCode = response.statusCode;
    res.headers = response.headers;
    res.headers['content-type'] = contentType;
    res.type(contentType);
    const body = JSON.parse(response.body);
    const type = body.type;
    if (res.statusCode === 400) {
        res.headers['content-type'] = 'application/json';
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
        ldPayload = convertAttrNGSILD(body, transformFlags);
        if (bodyIsJSONLD) {
            ldPayload['@context'] = JSON_LD_CONTEXT;
        }
    } else if (body instanceof Array) {
        ldPayload = _.map(body, formatAsNGSILD);
    } else {
        ldPayload = formatAsNGSILD(body);
    }

    return ldPayload ? res.send(ldPayload) : res.send();
}

exports.response = proxyResponse;
exports.internalError = internalError;
