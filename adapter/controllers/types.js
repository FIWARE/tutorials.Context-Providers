/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');

const debug = require('debug')('adapter:types');
const got = require('got').extend({
    timeout: {
        request: 1000
    }
});
const NGSI_LD = require('../lib/ngsi-ld');
const Constants = require('../lib/constants');

async function listTypes(req, res) {
    const headers = {};
    const tenant = req.header('NGSILD-Tenant') || null;
    headers['x-forwarded-for'] = Constants.getClientIp(req);
    if (tenant) {
        headers['fiware-service'] = tenant;
    }
    headers.accept = 'application/json';
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';

    try {
        const options = {
            method: req.method,
            throwHttpErrors: false,
            headers,
            retry: 0
        };

        const response = await got(Constants.v2BrokerURL(req.path), options);

        res.statusCode = response.statusCode;
        res.headers = response.headers;
        if (tenant) {
            res.set('NGSILD-Tenant', tenant);
        }
        const v2Body = JSON.parse(response.body);
        if (!Constants.is2xxSuccessful(res.statusCode)) {
            return Constants.sendError(res, v2Body);
        }

        Constants.linkContext(res, isJSONLD);

        let ldPayload = [];

        ldPayload = NGSI_LD.formatEntityTypeList(v2Body, isJSONLD);

        return Constants.sendResponse(res, v2Body, ldPayload, contentType);
    } catch (error) {
        debug(error);
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
async function readType(req, res) {
    const headers = {};
    const tenant = req.header('NGSILD-Tenant') || null;
    headers['x-forwarded-for'] = Constants.getClientIp(req);
    if (tenant) {
        headers['fiware-service'] = tenant;
    }
    headers.accept = 'application/json';
    const typeName = req.params.type;
    const isJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = isJSONLD ? 'application/ld+json' : 'application/json';
    const options = {
        method: req.method,
        throwHttpErrors: false,
        headers,
        retry: 0
    };

    try {
        const response = await got(Constants.v2BrokerURL(req.path), options);

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

        const ldPayload = NGSI_LD.formatEntityTypeInformation(v2Body, isJSONLD, typeName);

        return Constants.sendResponse(res, v2Body, ldPayload, contentType);
    } catch (error) {
        debug(error);
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

exports.list = listTypes;
exports.read = readType;
