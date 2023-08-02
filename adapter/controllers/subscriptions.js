/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');
const debug = require('debug')('adapter:subscriptions');
const got = require('got').extend({
    timeout: {
        request: 1000
    }
});

const Constants = require('../lib/constants');
const NGSI_LD = require('../lib/ngsi-ld');
const NGSI_V2 = require('../lib/ngsi-v2');

/**
 * /subscription proxying
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function listSubscriptions(req, res) {
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
        headers,
        throwHttpErrors: false,
        retry: 0
    };

    const response = await got(Constants.v2BrokerURL('/subscriptions'), options);

    res.statusCode = response.statusCode;
    if (tenant) {
        res.set('NGSILD-Tenant', tenant);
    }
    const v2Body = JSON.parse(response.body);
    if (!Constants.is2xxSuccessful(res.statusCode)) {
        return Constants.sendError(res, v2Body);
    }
    res.headers = response.headers;
    Constants.linkContext(res, isJSONLD);
    let ldPayload = [];

    if (v2Body instanceof Array) {
        const filtered = _.filter(v2Body || [], function (sub) {
            return sub.notification.httpCustom;
        });
        ldPayload = _.map(filtered, (sub) => {
            return NGSI_LD.formatSubscription(sub, isJSONLD);
        });
    }

    return Constants.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * /subscription/id proxying
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function readSubscription(req, res) {
    const headers = {};
    const tenant = req.header('NGSILD-Tenant') || null;
    headers['x-forwarded-for'] = Constants.getClientIp(req);
    if (tenant) {
        headers['fiware-service'] = tenant;
    }
    headers.accept = 'application/json';
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';
    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');
    const options = {
        method: req.method,
        throwHttpErrors: false,
        headers,
        retry: 0
    };

    const response = await got(Constants.v2BrokerURL('/subscriptions/' + id), options);
    const v2Body = JSON.parse(response.body);
    res.statusCode = response.statusCode;
    if (tenant) {
        res.set('NGSILD-Tenant', tenant);
    }
    if (!Constants.is2xxSuccessful(res.statusCode)) {
        return Constants.sendError(res, v2Body);
    }
    res.headers = response.headers;
    Constants.linkContext(res, isJSONLD);
    const ldPayload = NGSI_LD.formatSubscription(v2Body, isJSONLD);
    return Constants.sendResponse(res, v2Body, ldPayload, contentType);
}

/**
 * /subscription/id deletion
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function deleteSubscription(req, res) {
    const headers = {};
    const tenant = req.header('NGSILD-Tenant') || null;
    headers['x-forwarded-for'] = Constants.getClientIp(req);
    if (tenant) {
        headers['fiware-service'] = tenant;
    }

    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');
    const options = {
        method: req.method,
        headers,
        throwHttpErrors: false,
        retry: 0
    };

    const response = await got(Constants.v2BrokerURL('/subscriptions/' + id), options);

    res.statusCode = response.statusCode;
    res.headers = response.headers;
    if (tenant) {
        res.set('NGSILD-Tenant', tenant);
    }
    if (!Constants.is2xxSuccessful(res.statusCode)) {
        const v2Body = JSON.parse(response.body);
        return Constants.sendError(res, v2Body);
    }
    return res.send();
}

/**
 * /subscription/id creation
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function createSubscription(req, res) {
    const headers = {};
    const tenant = req.header('NGSILD-Tenant') || null;
    headers['x-forwarded-for'] = Constants.getClientIp(req);
    if (tenant) {
        headers['fiware-service'] = tenant;
    }

    const v2Payload = NGSI_V2.formatSubscription(req.body);

    const options = {
        method: req.method,
        throwHttpErrors: false,
        headers,
        retry: 0,
        json: v2Payload
    };

    const response = await got(Constants.v2BrokerURL('/subscriptions'), options);

    res.statusCode = response.statusCode;
    if (response.headers.location) {
        {
            res.set(
                'Location',
                response.headers.location.replace(/v2\/subscriptions\//gi, 'ngsi-ld/v1/urn:ngsi-ld:Subscription:')
            );
        }
    }
    if (tenant) {
        res.set('NGSILD-Tenant', tenant);
    }

    if (!Constants.is2xxSuccessful(res.statusCode)) {
        const v2Body = JSON.parse(response.body);
        return Constants.sendError(res, v2Body);
    }
    return res.send();
}

async function updateSubscription(req, res) {
    const headers = {};
    const tenant = req.header('NGSILD-Tenant') || null;
    headers['x-forwarded-for'] = Constants.getClientIp(req);
    if (tenant) {
        headers['fiware-service'] = tenant;
    }

    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');
    let v2Payload = NGSI_V2.formatSubscription(req.body);

    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0,
        headers,
        json: v2Payload
    };

    const response = await got(Constants.v2BrokerURL('/subscriptions/' + id), options);

    res.statusCode = response.statusCode;
    res.headers = response.headers;
    if (tenant) {
        res.set('NGSILD-Tenant', tenant);
    }
    if (!Constants.is2xxSuccessful(res.statusCode)) {
        const v2Body = JSON.parse(response.body);
        return Constants.sendError(res, v2Body);
    }
    return res.send();
}

exports.list = listSubscriptions;
exports.read = readSubscription;
exports.create = createSubscription;
exports.delete = deleteSubscription;
exports.update = updateSubscription;
