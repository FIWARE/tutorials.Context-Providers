/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const express = require('express');
const router = express.Router();
const entities = require('../controllers/entities');
const subscriptions = require('../controllers/subscriptions');
const notify = require('../controllers/notify');
const types = require('../controllers/types');
const attributes = require('../controllers/attributes');
const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;

function methodNotAllowedHandler(req, res) {
    res.status(StatusCodes.METHOD_NOT_ALLOWED).send({
        type: 'urn:ngsi-ld:MethodNotAllowed',
        title: getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED),
        message: `${req.method} not supported for ${req.path}`
    });
}

//Entities
router.route('/entities').get(entities.response).all(methodNotAllowedHandler);
router.route('/entities/:id').get(entities.response).all(methodNotAllowedHandler);
router.route('/entities/:id/attrs').get(entities.response).all(methodNotAllowedHandler);
router.route('/entities/:id/attrs/:attr').get(entities.response).all(methodNotAllowedHandler);

// Subscriptions
router.route('/subscriptions').get(subscriptions.list).post(subscriptions.create).all(methodNotAllowedHandler);
router
    .route('/subscriptions/:id')
    .get(subscriptions.read)
    .delete(subscriptions.delete)
    .patch(subscriptions.update)
    .all(methodNotAllowedHandler);

// Types
router.route('/types').get(types.list).all(methodNotAllowedHandler);
router.route('/types/:type').get(types.read).all(methodNotAllowedHandler);

// Attributes
router.route('/attributes').get(attributes.list).all(methodNotAllowedHandler);
router.route('/attributes/:attr').get(attributes.read).all(methodNotAllowedHandler);

// Notifications
router.route('/notify').post(notify.notify).all(methodNotAllowedHandler);

// All other routes
router.route('/*').all(methodNotAllowedHandler);

module.exports = router;
