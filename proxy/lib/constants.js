/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD Proxy
 *
 */

const V2_BROKER_URL = process.env.PROXY || 'http://localhost:1027/v2';
const DATETIME_DEFAULT = '1970-01-01T00:00:00.000Z';
const ATTRIBUTE_DEFAULT = null;

const JSON_LD_CONTEXT =
    process.env.CONTEXT_URL || 'https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld';

const RELAY_URL = process.env.RELAY || 'https://localhost:3000/notify';

function v2BrokerURL(path) {
    return V2_BROKER_URL + path;
}

function appendContext(obj, bodyIsJSONLD) {
    if (bodyIsJSONLD) {
        obj['@context'] = JSON_LD_CONTEXT;
    }
    return obj;
}

function linkContext(res, bodyIsJSONLD) {
    if (!bodyIsJSONLD) {
        res.header(
            'Link',
            '<' + JSON_LD_CONTEXT + '>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
        );
    }
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

module.exports = {
    v2BrokerURL,
    appendContext,
    linkContext,
    getClientIp,
    DATETIME_DEFAULT,
    ATTRIBUTE_DEFAULT,
    RELAY_URL
};
