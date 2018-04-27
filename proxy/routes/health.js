const express = require('express');
const router = express.Router();

const StaticNGSIProxy = require('../controllers/static');
const RandomNGSIProxy = require('../controllers/random');
const TwitterNSGIProxy = require('../controllers/twitter');
const WeatherNSGIProxy = require('../controllers/wunderground');

router.get('/random', RandomNGSIProxy.healthCheck);
router.get('/static', StaticNGSIProxy.healthCheck);
router.get('/twitter', TwitterNSGIProxy.healthCheck);
router.get('/weather', WeatherNSGIProxy.healthCheck);

router.get('/', (req, res) => {
	res.status(200).send({
		health_urls: ['/health/random', '/health/static', '/health/weather', '/health/twitter'],
	});
});

module.exports = router;
