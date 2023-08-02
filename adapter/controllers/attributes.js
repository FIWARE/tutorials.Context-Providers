/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');

const debug = require('debug')('adapter:attributes');
const got = require('got').extend({
    timeout: {
        request: 1000
    }
});
const NGSI_LD = require('../lib/ngsi-ld');
const Constants = require('../lib/constants');

/**
 * /attributes proxying
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function listAttributes(req, res) {
    const headers = {};
    const tenant = req.header('NGSILD-Tenant') || null;
    headers['x-forwarded-for'] = Constants.getClientIp(req);
    if (tenant) {
        headers['fiware-service'] = tenant;
    }
    headers.accept = 'application/json';
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';

    const options = {
        method: req.method,
        throwHttpErrors: false,
        headers,
        retry: 0
    };
    const response = await got(Constants.v2BrokerURL('/types'), options);

    res.statusCode = response.statusCode;
    if (tenant) {
        res.set('NGSILD-Tenant', tenant);
    }

    const v2Body = JSON.parse(response.body);
    const ldPayload = NGSI_LD.formatEntityAttributeList(v2Body, isJSONLD);

    if (_.isEmpty(ldPayload.attributeList)) {
        res.statusCode = StatusCodes.NOT_FOUND;
        return Constants.sendError(res, {
            type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
            title: getReasonPhrase(StatusCodes.NOT_FOUND),
            detail: `${req.path}`
        });
    }
    Constants.linkContext(res, isJSONLD);
    return Constants.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * /attributes/<attr> proxying
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function readAttribute(req, res) {
    const headers = {};
    const tenant = req.header('NGSILD-Tenant') || null;
    headers['x-forwarded-for'] = Constants.getClientIp(req);
    if (tenant) {
        headers['fiware-service'] = tenant;
    }
    headers.accept = 'application/json';
    const attrName = req.params.attr;
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';

    const options = {
        method: req.method,
        throwHttpErrors: false,
        headers,
        retry: 0
    };
    const response = await got(Constants.v2BrokerURL('/types'), options);

    res.statusCode = response.statusCode;
    if (tenant) {
        res.set('NGSILD-Tenant', tenant);
    }

    const v2Body = JSON.parse(response.body);
    const ldPayload = NGSI_LD.formatEntityAttribute(v2Body, isJSONLD, attrName);

    if (ldPayload.attributeCount === 0) {
        res.statusCode = StatusCodes.NOT_FOUND;
        return Constants.sendError(res, {
            type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
            title: getReasonPhrase(StatusCodes.NOT_FOUND),
            detail: `${attrName}`
        });
    }
    Constants.linkContext(res, isJSONLD);
    return Constants.sendResponse(res, v2Body, ldPayload, contentType);
}

exports.list = listAttributes;
exports.read = readAttribute;
