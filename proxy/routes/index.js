const express = require('express');
const router = express.Router();
const entities = require('../controllers/entities');
const subscriptions = require('../controllers/subscriptions');
const notify = require('../controllers/notify');
const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;

function methodNotAllowedHandler(req, res) {
    res.status(StatusCodes.METHOD_NOT_ALLOWED).send({
        type: 'urn:dx:as:InternalServerError',
        title: getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED),
        message: `${req.method} not supported for ${req.path}`
    });
}

router.route('/entities').get(entities.response).all(methodNotAllowedHandler);

router.route('/entities/:id').get(entities.response).all(methodNotAllowedHandler);

router.route('/entities/:id/attrs').get(entities.response).all(methodNotAllowedHandler);

router.route('/entities/:id/attrs/:attr').get(entities.response).all(methodNotAllowedHandler);

router.route('/subscriptions').get(subscriptions.list).all(methodNotAllowedHandler);

router
    .route('/subscriptions/:id')
    .get(subscriptions.read)
    .delete(subscriptions.delete)
    .patch(subscriptions.update)
    .all(methodNotAllowedHandler);

router.route('/notify').post(notify.notify).all(methodNotAllowedHandler);

router.route('/*').all(methodNotAllowedHandler);

/*
router.get('/entities', entities.response);
router.get('/entities/:id', entities.response);
router.get('/entities/:id/attrs', entities.response);
router.get('/entities/:id/attrs/:attr', entities.response);

router.get('/subscriptions', subscriptions.list);
router.get('/subscriptions/:id', subscriptions.read);
router.delete('/subscriptions/:id', subscriptions.delete);
router.patch('/subscriptions/:id', subscriptions.update);

router.post('/notify', notify.notify);*/

module.exports = router;
