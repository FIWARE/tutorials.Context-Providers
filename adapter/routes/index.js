/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const debug = require('debug')('adapter:routes');
const express = require('express');
const router = express.Router();
const entities = require('../controllers/entities');
const subscriptions = require('../controllers/subscriptions');
const notify = require('../controllers/notify');
const types = require('../controllers/types');
const attributes = require('../controllers/attributes');
const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;

function errorHandler(error, req, res, next) {
    debug(error);
    res.status(error.statusCode || 400).send(error);
}

const tryCatch = (controller) => async (req, res, next) => {
    try {
        await controller(req, res);
    } catch (error) {
        switch (error.code) {
            case 'ENOTFOUND':
                res.status(StatusCodes.NOT_FOUND).send({
                    type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
                    title: getReasonPhrase(StatusCodes.NOT_FOUND),
                    message: `${req.path} cannot be found`
                });
                break;
            case 'ETIMEDOUT':
                res.status(StatusCodes.GATEWAY_TIMEOUT).send({
                    type: 'https://uri.etsi.org/ngsi-ld/errors/GatewayTimeout',
                    title: getReasonPhrase(StatusCodes.GATEWAY_TIMEOUT),
                    message: `${req.path} is did not respond in time`
                });
                break;
            case 'ECONNREFUSED':
                res.status(StatusCodes.BAD_GATEWAY).send({
                    type: 'https://uri.etsi.org/ngsi-ld/errors/BadGateway',
                    title: getReasonPhrase(StatusCodes.BAD_GATEWAY),
                    message: `${req.path} server is unavailable`
                });
                break;
            default:
                debug(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                    type: 'https://uri.etsi.org/ngsi-ld/errors/InternalError',
                    title: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                    message: `${req.path} caused an error:  ${error.code}`
                });
                break;
        }
        return next(error);
    }
};

function methodNotAllowedHandler(req, res) {
    res.status(StatusCodes.METHOD_NOT_ALLOWED).send({
        type: 'urn:ngsi-ld:MethodNotAllowed',
        title: getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED),
        message: `${req.method} not supported for ${req.path}`
    });
}

//Entities
router.route('/entities').get(tryCatch(entities.response)).all(methodNotAllowedHandler);
router.route('/entities/:id').get(tryCatch(entities.response)).all(methodNotAllowedHandler);
router.route('/entities/:id/attrs').get(tryCatch(entities.response)).all(methodNotAllowedHandler);
router.route('/entities/:id/attrs/:attr').get(tryCatch(entities.response)).all(methodNotAllowedHandler);

// Subscriptions
router
    .route('/subscriptions')
    .get(tryCatch(subscriptions.list))
    .post(tryCatch(subscriptions.create))
    .all(methodNotAllowedHandler);

router
    .route('/subscriptions/:id')
    .get(tryCatch(subscriptions.read))
    .delete(tryCatch(subscriptions.delete))
    .patch(tryCatch(subscriptions.update))
    .all(methodNotAllowedHandler);

// Types
router.route('/types').get(tryCatch(types.list)).all(methodNotAllowedHandler);
router.route('/types/:type').get(tryCatch(types.read)).all(methodNotAllowedHandler);

// Attributes
router.route('/attributes').get(tryCatch(attributes.list)).all(methodNotAllowedHandler);
router.route('/attributes/:attr').get(tryCatch(attributes.read)).all(methodNotAllowedHandler);

// Notifications
router.route('/notify').post(tryCatch(notify.notify)).all(methodNotAllowedHandler);

// All other routes
router.route('/*').all(methodNotAllowedHandler);

module.exports = router;
