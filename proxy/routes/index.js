const express = require('express');
const router = express.Router();
const entities = require('../controllers/entities');
const subscriptions = require('../controllers/subscriptions');
const notify = require('../controllers/notify');

router.get('/entities', entities.response);
router.get('/entities/:id', entities.response);
router.get('/entities/:id/attrs', entities.response);
router.get('/entities/:id/attrs/:attr', entities.response);

router.get('/subscriptions', subscriptions.list);
router.get('/subscriptions/:id', subscriptions.read);
router.delete('/subscriptions/:id', subscriptions.delete);
router.patch('/subscriptions/:id', subscriptions.update);

router.post('/notify', notify.notify);

module.exports = router;
