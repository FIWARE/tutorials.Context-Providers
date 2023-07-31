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
const got = require('got');

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
    const bodyIsJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = bodyIsJSONLD ? 'application/ld+json' : 'application/json';
    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0
    };

    got(Constants.v2BrokerURL(req.path), options)
        .then((response) => {
            res.statusCode = response.statusCode;
            res.headers = response.headers;
            res.headers['content-type'] = contentType;
            res.type(contentType);
            Constants.linkContext(res, bodyIsJSONLD);
            const body = JSON.parse(response.body);
            let ldPayload = body;

            if (response.statusCode === 200) {
                ldPayload = [];

                if (body instanceof Array) {
                    const filtered = _.filter(body || [], function (sub) {
                        return sub.notification.httpCustom;
                    });
                    ldPayload = _.map(filtered, (sub) => {
                        return NGSI_LD.formatSubscription(sub, bodyIsJSONLD);
                    });
                }
            }
            return body ? res.send(ldPayload) : res.send();
        })
        .catch((error) => {
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
        });
}

/**
 * /subscription/id proxying
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function readSubscription(req, res) {
    const bodyIsJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = bodyIsJSONLD ? 'application/ld+json' : 'application/json';
    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');
    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0
    };

    got(Constants.v2BrokerURL('/subscriptions/' + id), options)
        .then((response) => {
            res.statusCode = response.statusCode;
            res.headers = response.headers;
            res.headers['content-type'] = contentType;
            res.type(contentType);
            Constants.linkContext(res, bodyIsJSONLD);
            let ldPayload = [];
            const body = JSON.parse(response.body);
            ldPayload = NGSI_LD.formatSubscription(body, bodyIsJSONLD);
            return body ? res.send(ldPayload) : res.send();
        })
        .catch((error) => {
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
        });
}

/**
 * /subscription/id deletion
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

async function deleteSubscription(req, res) {
    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');
    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0
    };

    got(Constants.v2BrokerURL('/subscriptions/' + id), options)
        .then((response) => {
            res.statusCode = response.statusCode;
            res.headers = response.headers;
            if (response.body) {
                res.headers['content-type'] = 'application/ld+json';
                res.type('application/ld+json');
            }
            return res.send(response.body);
        })
        .catch((error) => {
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
        });
}

/**
 * /subscription/id creation
 *
 * @param req - the incoming request
 * @param res - the response to return
 */

function createSubscription(req, res) {
    let v2Payload = NGSI_V2.formatSubscription(req.body);

    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0,
        json: v2Payload
    };

    got(Constants.v2BrokerURL('/subscriptions/'), options)
        .then((response) => {
            res.statusCode = response.statusCode;
            res.headers = response.headers;
            if (response.body) {
                res.headers['content-type'] = 'application/ld+json';
                res.type('application/ld+json');
            }
            return res.send(response.body);
        })
        .catch((error) => {
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
        });
}

function updateSubscription(req, res) {
    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');
    let v2Payload = NGSI_V2.formatSubscription(req.body);

    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0,
        json: v2Payload
    };

    got(Constants.v2BrokerURL('/subscriptions/' + id), options)
        .then((response) => {
            res.statusCode = response.statusCode;
            res.headers = response.headers;
            if (response.body) {
                res.headers['content-type'] = 'application/ld+json';
                res.type('application/ld+json');
            }
            return res.send(response.body);
        })
        .catch((error) => {
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
        });
}

exports.list = listSubscriptions;
exports.read = readSubscription;
exports.create = createSubscription;
exports.delete = deleteSubscription;
exports.update = updateSubscription;
