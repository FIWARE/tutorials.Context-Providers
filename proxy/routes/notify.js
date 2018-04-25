const express = require('express');
const router = express.Router();
const debug = require('debug')('proxy:server');


router.post('/:type', (req, res) => {
	debug(req.body);
	req.app.get('io').emit('notify', req.params.type + ' received');
	res.status(201).send();
});



router.get('/', (req, res) => {
	res.status(200).send({
		notify_urls: [
			"/notify/priceChange",
			"/notify/stockCountLow"
		]
	});
});


module.exports = router;
