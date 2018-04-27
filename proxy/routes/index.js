const express = require('express');
const router = express.Router();
const debug = require('debug')('proxy:server');
const monitor = require('../lib/monitoring');
const Store = require('../controllers/store');
const _ = require('lodash');

function catchErrors(fn) {
	return (req, res, next) => {
		return fn(req, res, next).catch(next);
	};
}

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'FIWARE Tutorial' });
});

// eslint-disable-next-line no-unused-vars
router.get('/app/monitor', function(req, res) {
	res.render('monitor', { title: 'Event Monitor' });
});

router.get('/app/store/:storeId', catchErrors(Store.readContextData), Store.displayStore);
router.get('/app/store/:storeId/till', catchErrors(Store.readContextData), Store.displayTillInfo);
router.get('/app/store/:storeId/warehouse', Store.displayWarehouseInfo);
router.post('/app/inventory/:inventoryId', catchErrors(Store.buyItem));

router.post('/subscription/:type', (req, res) => {
	monitor('notify', req.params.type + ' received', req, req.body);
	_.forEach(req.body.data, item => {
		if (item.refStore) {
			debug(req.params.type + ' received');
			monitor(item.refStore, req.params.type + ' received', req);
		}
		if (item.refProduct) {
			monitor(item.refProduct, req.params.type + ' received', req);
		}
		if (item.refShelf) {
			monitor(item.refShelf, req.params.type + ' received', req);
		}
	});
	res.status(204).send();
});

module.exports = router;
