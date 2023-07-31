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
const got = require('got');
const NGSI_LD = require('../lib/ngsi-ld');
const Constants = require('../lib/constants');

/**
 * /attributes proxying
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function listAttributes(req, res) {
    const bodyIsJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = bodyIsJSONLD ? 'application/ld+json' : 'application/json';

    try {
        const options = {
            method: req.method,
            throwHttpErrors: false,
            retry: 0
        };
        const response = await got(Constants.v2BrokerURL('/types'), options);

        res.statusCode = response.statusCode;
        res.headers = response.headers;
        res.headers['content-type'] = contentType;
        res.type(contentType);
        Constants.linkContext(res, bodyIsJSONLD);

        let ldPayload = [];
        const body = JSON.parse(response.body);

        ldPayload = NGSI_LD.formatEntityAttributeList(body, bodyIsJSONLD);

        return body ? res.send(ldPayload) : res.send();
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

/**
 * /attributes/<attr> proxying
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function readAttribute(req, res) {
    const attrName = req.params.attr;
    const bodyIsJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = bodyIsJSONLD ? 'application/ld+json' : 'application/json';

    try {
        const options = {
            method: req.method,
            throwHttpErrors: false,
            retry: 0
        };
        const response = await got(Constants.v2BrokerURL('/types'), options);

        res.statusCode = response.statusCode;
        res.headers = response.headers;
        res.headers['content-type'] = contentType;
        res.type(contentType);
        Constants.linkContext(res, bodyIsJSONLD);

        let ldPayload = [];
        const body = JSON.parse(response.body);
        ldPayload = NGSI_LD.formatEntityAttribute(body, bodyIsJSONLD, attrName);

        return body ? res.send(ldPayload) : res.send();
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

exports.list = listAttributes;
exports.read = readAttribute;
